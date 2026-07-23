"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SesionUsoSchema = new Schema(
  {
    usuario: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      nombre: {
        type: String,
      },
      apellidos: {
        type: String,
      },
      email: {
        type: String,
        trim: true,
      },
      roles: [
        {
          type: Schema.Types.ObjectId,
          ref: "Role",
        },
      ],
    },
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    modulo: {
      type: String,
      required: true,
      trim: true,
    },
    ruta: {
      type: String,
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fechaFin: {
      type: Date,
    },
    duracionSegundos: {
      type: Number,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

SesionUsoSchema.index({ usuario: 1, modulo: 1, fechaInicio: -1 });
SesionUsoSchema.index({ ip: 1, fechaInicio: -1 });
SesionUsoSchema.index({ modulo: 1, activo: 1 });
SesionUsoSchema.index({ createdAt: -1 });

SesionUsoSchema.statics.getEstadisticas = async function () {
  const totalSesiones = await this.countDocuments();
  const sesionesActivas = await this.countDocuments({ activo: true });

  const totalDuracion = await this.aggregate([
    { $match: { duracionSegundos: { $exists: true, $ne: null } } },
    { $group: { _id: null, total: { $sum: "$duracionSegundos" } } },
  ]);

  const promedioDuracionSegundos = totalDuracion.length > 0 
    ? totalDuracion[0].total / totalSesiones 
    : 0;

  const sesionesPorModulo = await this.aggregate([
    { $match: { activo: true } },
    { $group: { _id: "$modulo", cantidad: { $sum: 1 } } },
    { $sort: { cantidad: -1 } },
  ]);

  const usuariosTop = await this.aggregate([
    { $match: { activo: true } },
    { $group: { _id: "$usuario.username", sesiones: { $sum: 1 } } },
    { $sort: { sesiones: -1 } },
    { $limit: 10 },
  ]);

  const sesionesRecientes = await this.find({ activo: true })
    .sort({ createdAt: -1 })
    .limit(20)
    .exec();

  return {
    totalSesiones,
    sesionesActivas,
    promedioDuracionMinutos: promedioDuracionSegundos / 60,
    sesionesPorModulo: sesionesPorModulo.map(s => ({
      modulo: s._id,
      cantidad: s.cantidad,
    })),
    usuariosTop: usuariosTop.map(u => ({
      usuario: u._id,
      sesiones: u.sesiones,
    })),
    sesionesRecientes,
  };
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