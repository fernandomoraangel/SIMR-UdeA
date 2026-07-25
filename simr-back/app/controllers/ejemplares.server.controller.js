"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const { logAudit } = require("../services/audit.service");
const Ejemplar = mongoose.model("Ejemplar");

// Método para el manejo de errores
const getErrorMessage = (err) => {
  // Definir variable de error message
  let message = "";
  // Si ocurre un error interno de MongoDB
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El registro ya existe";
        break;
      // si un error general ocurre
      default:
        message = "Se ha producido un error";
    }
  } else {
    // Grabar el error en una lista de posibles errores
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  // Devolver el mensaje de error
  return message;
};

// Método para crear las ejemplares
exports.create = async (req, res) => {
  const ejemplar = new Ejemplar(req.body);
  // Configurar la propiedad 'creador'
  ejemplar.creador = req.user;
  try {
    // Intentar salvar la ejemplar
    const savedEjemplar = await ejemplar.save();
    await logAudit(req, "ejemplar_created", "ejemplar", savedEjemplar._id, savedEjemplar.numeroEjemplar);
    // Enviar una representación JSON de la ejemplar
    res.json(savedEjemplar);
  } catch (err) {
    // Si ocurre algún error enviar el mensaje
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de ejemplars
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de ejemplares
    const ejemplares = await Ejemplar.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(ejemplares);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una ejemplar existente
exports.read = (req, res) => {
  res.json(req.ejemplar);
};

// Método para actualizar una ejemplar existente
exports.update = async (req, res) => {
  // Obtiene la ejemplar usando el objeto 'request'
  const ejemplar = req.ejemplar;
  // Actualiza los campos
  ejemplar.recurso = req.body.recurso;
  ejemplar.numeroEjemplar = req.body.numeroEjemplar;
  ejemplar.disponibilidad = req.body.disponibilidad;
  ejemplar.fondo = req.body.fondo;
  ejemplar.coleccion = req.body.coleccion;
  ejemplar.procedencia = req.body.procedencia;
  ejemplar.estados = req.body.estados;
  try {
    // Intenta salvar
    const updatedEjemplar = await ejemplar.save();
    await logAudit(req, "ejemplar_updated", "ejemplar", updatedEjemplar._id, updatedEjemplar.numeroEjemplar);
    res.json(updatedEjemplar);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener la ejemplar usando el objeto 'request'
  const ejemplar = req.ejemplar;
  try {
    await logAudit(req, "ejemplar_deleted", "ejemplar", ejemplar._id, ejemplar.numeroEjemplar);
    await ejemplar.deleteOne();
    res.json(ejemplar);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar una ejemplar existente
exports.ejemplarByID = async (req, res, next, id) => {
  try {
    const ejemplar = await Ejemplar.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!ejemplar) {
      return next(new Error("Fallo al cargar la ejemplar " + id));
    }
    // Si la ejemplar es encontrada, usar el objeto 'request' para pasarla al sgte middleware
    req.ejemplar = ejemplar;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre ejemplar
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual no es el creador, enviar el mensaje de error
  if (req.ejemplar.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
