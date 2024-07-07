"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Instrumento = mongoose.model("Instrumento");

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

// Método para crear los instrumentos
exports.create = async (req, res) => {
  const instrumento = new Instrumento(req.body);
  instrumento.creador = req.user;

  try {
    const savedInstrumento = await instrumento.save();
    res.json(savedInstrumento);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de instrumentos
exports.list = async (req, res) => {
  try {
    const instrumentos = await Instrumento.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(instrumentos);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un instrumento existente
exports.read = (req, res) => {
  res.json(req.instrumento);
};

// Método para actualizar un instrumento existente
exports.update = async (req, res) => {
  const instrumento = req.instrumento;
  instrumento.nombre = req.body.nombre;
  instrumento.clasificacion = req.body.clasificacion;
  instrumento.alias = req.body.alias;
  instrumento.proyectosAsociados = req.body.proyectosAsociados;
  instrumento.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  instrumento.descriptorLibre = req.body.descriptorLibre;
  instrumento.vinculoRelacionado = req.body.vinculoRelacionado;

  try {
    const updatedInstrumento = await instrumento.save();
    res.json(updatedInstrumento);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar un instrumento
exports.delete = async (req, res) => {
  const instrumento = req.instrumento;

  try {
    await Instrumento.deleteOne({ _id: instrumento._id });
    res.json(instrumento);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un instrumento existente
exports.instrumentoByID = async (req, res, next, id) => {
  try {
    const instrumento = await Instrumento.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!instrumento) {
      return next(new Error("Fallo al cargar el instrumento " + id));
    }
    req.instrumento = instrumento;
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre un instrumento
exports.hasAuthorization = (req, res, next) => {
  if (req.instrumento.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  next();
};
