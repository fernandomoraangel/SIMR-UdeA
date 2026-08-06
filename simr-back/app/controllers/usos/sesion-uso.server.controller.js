"use strict";

const mongoose = require("mongoose");
const { logAudit } = require("../../services/audit.service");
const SesionUso = mongoose.model("SesionUso");

exports.crearSesion = async (req, res) => {
  try {
    const { ip, modulo, ruta } = req.body;
    const user = req.user;

    if (!user || !modulo) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: usuario, modulo",
      });
    }

    await user.populate("roles", "name");

    const sesion = new SesionUso({
      usuario: {
        _id: user._id,
        username: user.username,
        nombre: user.firstName,
        apellidos: user.lastName,
        email: user.email,
        roles: user.roles.map((r) => r._id),
        roleNames: user.roles.map((r) => r.name),
      },
      ip: ip || req.ip,
      modulo,
      ruta,
      fechaInicio: new Date(),
      activo: true,
    });

    await sesion.save();
    await logAudit(req, "uso_creado", "usos", sesion._id, "Sesión creada");

    res.status(201).json({ success: true, data: sesion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cerrarSesion = async (req, res) => {
  try {
    const sesion = await SesionUso.findById(req.params.id);
    if (!sesion) {
      return res.status(404).json({ success: false, message: "Sesión no encontrada" });
    }
    if (!sesion.activo) {
      return res.status(400).json({ success: false, message: "La sesión ya está cerrada" });
    }

    const ahora = new Date();
    sesion.fechaFin = ahora;
    sesion.duracionSegundos = Math.floor((ahora - sesion.fechaInicio) / 1000);
    sesion.activo = false;

    await sesion.save();
    await logAudit(req, "uso_actualizado", "usos", sesion._id, "Sesión cerrada");

    res.json({ success: true, data: sesion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await SesionUso.getTodasLasEstadisticas();
    res.json({ success: true, data: estadisticas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.obtenerSesiones = async (req, res) => {
  try {
    const { pagina = 1, limite = 50, activo, modulo } = req.query;
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === "true";
    if (modulo) filtro.modulo = modulo;

    const [sesiones, total] = await Promise.all([
      SesionUso.find(filtro)
        .sort({ createdAt: -1 })
        .skip((pagina - 1) * limite)
        .limit(parseInt(limite))
        .exec(),
      SesionUso.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      data: sesiones,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.obtenerSesion = async (req, res) => {
  try {
    const sesion = await SesionUso.findById(req.params.id);
    if (!sesion) {
      return res.status(404).json({ success: false, message: "Sesión no encontrada" });
    }
    res.json({ success: true, data: sesion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registrarAccion = async (req, res) => {
  try {
    const { sesionId, entidad, tipoAccion, entidadId } = req.body;
    if (!sesionId || !entidad || !tipoAccion) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos: sesionId, entidad, tipoAccion",
      });
    }

    const sesion = await SesionUso.registrarAccion(sesionId, entidad, tipoAccion, entidadId);
    if (!sesion) {
      return res.status(404).json({ success: false, message: "Sesión no encontrada" });
    }

    res.json({ success: true, data: sesion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.eliminarSesion = async (req, res) => {
  try {
    const sesion = await SesionUso.findByIdAndDelete(req.params.id);
    if (!sesion) {
      return res.status(404).json({ success: false, message: "Sesión no encontrada" });
    }
    await logAudit(req, "uso_eliminado", "usos", sesion._id, "Sesión eliminada");
    res.json({ success: true, message: "Sesión eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.limpiarSesiones = async (req, res) => {
  try {
    const { dias = 30 } = req.query;
    const resultado = await SesionUso.limpiarSesionesCerradas(parseInt(dias));
    res.json({
      success: true,
      message: `Se eliminaron ${resultado.deletedCount} sesiones`,
      eliminadas: resultado.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};