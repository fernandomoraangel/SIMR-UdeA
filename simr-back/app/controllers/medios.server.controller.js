"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Medio = mongoose.model("Medio");

// Método para el manejo de errores
const getErrorMessage = (err) => {
  let message = "";
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El registro ya existe";
        break;
      default:
        message = "Se ha producido un error";
    }
  } else {
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message;
};

// Método para crear los medios
exports.create = async (req, res) => {
  const medio = new Medio(req.body);
  medio.creador = req.user;

  try {
    const savedMedio = await medio.save();
    res.json(savedMedio);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de medios
exports.list = async (req, res) => {
  try {
    const medios = await Medio.find()
      .sort("-created")
      .populate("creador", "firstName lastName")
      .populate("proyectosAsociados.proyecto", "nombre")
      .populate("instrumentos.instrumento", "nombre")
      .exec();
    res.json(medios);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un medio existente
exports.read = (req, res) => {
  res.json(req.medio);
};

// Método para actualizar un medio existente
exports.update = async (req, res) => {
  const medio = req.medio;
  medio.nombre = req.body.nombre;
  medio.alias = req.body.alias;
  medio.instrumentos = req.body.instrumentos;
  medio.proyectosAsociados = req.body.proyectosAsociados;
  medio.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  medio.descriptorLibre = req.body.descriptorLibre;
  medio.vinculoRelacionado = req.body.vinculoRelacionado;
  medio.archivosAdjuntos = req.body.archivosAdjuntos;

  try {
    const updatedMedio = await medio.save();
    res.json(updatedMedio);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar un medio
exports.delete = async (req, res) => {
  const medio = req.medio;

  try {
    await Medio.deleteOne({ _id: medio._id });
    res.json(medio);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un medio existente
exports.medioByID = async (req, res, next, id) => {
  try {
    const medio = await Medio.findById(id)
      .populate("creador", "firstName lastName")
      .populate("proyectosAsociados.proyecto", "nombre")
      .populate("instrumentos.instrumento", "nombre")
      .exec();
    if (!medio) {
      return next(new Error("Fallo al cargar el medio " + id));
    }
    req.medio = medio;
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre medio
exports.hasAuthorization = (req, res, next) => {
  if (req.medio.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  next();
};
