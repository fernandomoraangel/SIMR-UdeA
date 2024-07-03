"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Genero = mongoose.model("Genero");

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

// Método para crear los géneros
exports.create = async (req, res) => {
  const genero = new Genero(req.body);
  genero.creador = req.user;

  try {
    const savedGenero = await genero.save();
    res.json(savedGenero);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de géneros
exports.list = async (req, res) => {
  try {
    const generos = await Genero.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(generos);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un género existente
exports.read = (req, res) => {
  res.json(req.genero);
};

// Método para actualizar un género existente
exports.update = async (req, res) => {
  const genero = req.genero;
  genero.nombre = req.body.nombre;
  genero.descripcion = req.body.descripcion;
  genero.alias = req.body.alias;
  genero.GeneroRelacionado = req.body.GeneroRelacionado;
  genero.padres = req.body.padres;
  genero.hijos = req.body.hijos;
  genero.mediosSonoros = req.body.mediosSonoros;
  genero.sistemasSonoros = req.body.sistemasSonoros;
  genero.idioma = req.body.idioma;
  genero.proyectosAsociados = req.body.proyectosAsociados;
  genero.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  genero.descriptorLibre = req.body.descriptorLibre;
  genero.vinculoRelacionado = req.body.vinculoRelacionado;

  try {
    const updatedGenero = await genero.save();
    res.json(updatedGenero);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  const genero = req.genero;
  try {
    await Genero.deleteOne({ _id: genero._id });
    res.json(genero);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un género existente
exports.generoByID = async (req, res, next, id) => {
  try {
    const genero = await Genero.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!genero) {
      return next(new Error("Fallo al cargar el género " + id));
    }
    req.genero = genero;
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre género
exports.hasAuthorization = (req, res, next) => {
  if (req.genero.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  next();
};
