"use strict";

const mongoose = require("mongoose");
const SesionUso = mongoose.model("SesionUso");

exports.crearSesion = async (req, res) => {
  try {
    const { usuario, ip, modulo, ruta } = req.body;
    
    if (!usuario || !ip || !modulo) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos: usuario, ip, modulo",
      });
    }

    const sesion = new SesionUso({
      usuario: {
        _id: usuario._id,
        username: usuario.username,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        roles: usuario.roles,
      },
      ip,
      modulo,
      ruta,
      fechaInicio: new Date(),
      activo: true,
    });

    await sesion.save();

    res.status(201).json({
      success: true,
      data: sesion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cerrarSesion = async (req, res) => {
  try {
    const { id } = req.params;

    const sesion = await SesionUso.findById(id);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada",
      });
    }

    if (!sesion.activo) {
      return res.status(400).json({
        success: false,
        message: "La sesión ya está cerrada",
      });
    }

    const ahora = new Date();
    const duracionMilisegundos = ahora - sesion.fechaInicio;
    const duracionSegundos = Math.floor(duracionMilisegundos / 1000);

    sesion.fechaFin = ahora;
    sesion.duracionSegundos = duracionSegundos;
    sesion.activo = false;

    await sesion.save();

    res.json({
      success: true,
      data: sesion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await SesionUso.getEstadisticas();
    res.json({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.obtenerSesiones = async (req, res) => {
  try {
    const { pagina = 1, limite = 50, activo, modulo } = req.query;
    const skip = (pagina - 1) * limite;

    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === "true";
    if (modulo) filtro.modulo = modulo;

    const [sesiones, total] = await Promise.all([
      SesionUso.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.obtenerSesion = async (req, res) => {
  try {
    const { id } = req.params;

    const sesion = await SesionUso.findById(id);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada",
      });
    }

    res.json({
      success: true,
      data: sesion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.eliminarSesion = async (req, res) => {
  try {
    const { id } = req.params;

    const sesion = await SesionUso.findByIdAndDelete(id);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Sesión eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};