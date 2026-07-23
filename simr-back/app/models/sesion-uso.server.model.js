"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccionSchema = new Schema(
  {
    entidad: { type: String, required: true },
    tipoAccion: {
      type: String,
      enum: ["view", "create", "update", "delete", "search"],
      required: true,
    },
    entidadId: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SesionUsoSchema = new Schema(
  {
    usuario: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: { type: String, required: true },
      nombre: { type: String },
      apellidos: { type: String },
      email: { type: String, trim: true },
      roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
      roleNames: [{ type: String }],
    },
    ip: { type: String, required: true, trim: true },
    modulo: { type: String, required: true, trim: true },
    ruta: { type: String, trim: true },
    fechaInicio: { type: Date, required: true, default: Date.now },
    fechaFin: { type: Date },
    duracionSegundos: { type: Number },
    activo: { type: Boolean, default: true },
    acciones: [AccionSchema],
  },
  { timestamps: true }
);

SesionUsoSchema.index({ usuario: 1, modulo: 1, fechaInicio: -1 });
SesionUsoSchema.index({ ip: 1, fechaInicio: -1 });
SesionUsoSchema.index({ modulo: 1, activo: 1 });
SesionUsoSchema.index({ createdAt: -1 });
SesionUsoSchema.index({ "usuario.roleNames": 1 });
SesionUsoSchema.index({ "acciones.entidad": 1, "acciones.tipoAccion": 1 });

SesionUsoSchema.statics.getEstadisticas = async function () {
  const totalSesiones = await this.countDocuments();
  const sesionesActivas = await this.countDocuments({ activo: true });
  const usuariosUnicos = (
    await this.distinct("usuario.username")
  ).length;

  const totalDuracion = await this.aggregate([
    { $match: { duracionSegundos: { $exists: true, $ne: null } } },
    { $group: { _id: null, total: { $sum: "$duracionSegundos" } } },
  ]);

  const promedioDuracionSegundos =
    totalDuracion.length > 0 ? totalDuracion[0].total / totalSesiones : 0;

  return {
    totalSesiones,
    sesionesActivas,
    usuariosUnicos,
    promedioDuracionMinutos: Math.round(promedioDuracionSegundos / 60),
  };
};

SesionUsoSchema.statics.getEstadisticasPorModulo = async function () {
  const data = await this.aggregate([
    {
      $group: {
        _id: "$modulo",
        sesiones: { $sum: 1 },
        duracionTotal: { $sum: { $ifNull: ["$duracionSegundos", 0] } },
      },
    },
    { $sort: { sesiones: -1 } },
  ]);

  return data.map((m) => ({
    modulo: m._id,
    sesiones: m.sesiones,
    duracionTotalMinutos: Math.round(m.duracionTotal / 60),
  }));
};

SesionUsoSchema.statics.getEstadisticasPorRol = async function () {
  const data = await this.aggregate([
    { $unwind: { path: "$usuario.roleNames", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$usuario.roleNames",
        usuarios: { $addToSet: "$usuario.username" },
        sesiones: { $sum: 1 },
        duracionTotal: { $sum: { $ifNull: ["$duracionSegundos", 0] } },
      },
    },
    { $sort: { sesiones: -1 } },
  ]);

  return data.map((r) => ({
    rol: r._id || "sin-rol",
    usuariosUnicos: r.usuarios.length,
    sesiones: r.sesiones,
    duracionTotalMinutos: Math.round(r.duracionTotal / 60),
  }));
};

SesionUsoSchema.statics.getEstadisticasPorEntidad = async function () {
  const data = await this.aggregate([
    { $unwind: "$acciones" },
    {
      $group: {
        _id: { entidad: "$acciones.entidad", tipoAccion: "$acciones.tipoAccion" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const porEntidad = {};
  for (const item of data) {
    const entidad = item._id.entidad;
    if (!porEntidad[entidad]) {
      porEntidad[entidad] = { entidad, total: 0, acciones: {} };
    }
    porEntidad[entidad].total += item.count;
    porEntidad[entidad].acciones[item._id.tipoAccion] = item.count;
  }

  return Object.values(porEntidad).sort((a, b) => b.total - a.total);
};

SesionUsoSchema.statics.getSesionesPorDia = async function (dias = 30) {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const data = await this.aggregate([
    { $match: { fechaInicio: { $gte: desde } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$fechaInicio" },
        },
        sesiones: { $sum: 1 },
        duracionTotal: { $sum: { $ifNull: ["$duracionSegundos", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return data.map((d) => ({
    fecha: d._id,
    sesiones: d.sesiones,
    duracionTotalMinutos: Math.round(d.duracionTotal / 60),
  }));
};

SesionUsoSchema.statics.topUsuarios = async function (limite = 10) {
  const data = await this.aggregate([
    {
      $group: {
        _id: { username: "$usuario.username", nombre: "$usuario.nombre", apellidos: "$usuario.apellidos" },
        sesiones: { $sum: 1 },
        duracionTotal: { $sum: { $ifNull: ["$duracionSegundos", 0] } },
        modulos: { $addToSet: "$modulo" },
      },
    },
    { $sort: { sesiones: -1 } },
    { $limit: limite },
  ]);

  return data.map((u) => ({
    usuario: u._id.username,
    nombre: [u._id.nombre, u._id.apellidos].filter(Boolean).join(" ") || u._id.username,
    sesiones: u.sesiones,
    duracionTotalMinutos: Math.round(u.duracionTotal / 60),
    modulosVisitados: u.modulos.length,
  }));
};

SesionUsoSchema.statics.getTodasLasEstadisticas = async function () {
  const [generales, porModulo, porRol, porEntidad, sesionesPorDia, usuarios] =
    await Promise.all([
      this.getEstadisticas(),
      this.getEstadisticasPorModulo(),
      this.getEstadisticasPorRol(),
      this.getEstadisticasPorEntidad(),
      this.getSesionesPorDia(30),
      this.topUsuarios(10),
    ]);

  return {
    generales,
    porModulo,
    porRol,
    porEntidad,
    sesionesPorDia,
    topUsuarios: usuarios,
  };
};

SesionUsoSchema.statics.registrarAccion = async function (
  sesionId,
  entidad,
  tipoAccion,
  entidadId
) {
  return this.findByIdAndUpdate(
    sesionId,
    {
      $push: {
        acciones: {
          entidad,
          tipoAccion,
          entidadId: entidadId || undefined,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  );
};

SesionUsoSchema.statics.limpiarSesionesCerradas = async function (dias = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dias);

  return this.deleteMany({
    activo: false,
    fechaFin: { $lt: cutoffDate },
  }).exec();
};

module.exports = mongoose.model("SesionUso", SesionUsoSchema);