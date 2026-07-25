"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const { logAudit } = require("../services/audit.service");
const GeneroNoMusical = mongoose.model("GeneroNoMusical");

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

// Método para crear los géneros no musicales
exports.create = async (req, res) => {
  const generoNoMusical = new GeneroNoMusical(req.body);
  generoNoMusical.creador = req.user;

  try {
    const savedGeneroNoMusical = await generoNoMusical.save();
    await logAudit(req, "genero_nomusical_created", "genero_nomusical", savedGeneroNoMusical._id, savedGeneroNoMusical.nombre);
    res.json(savedGeneroNoMusical);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de géneros no musicales
exports.list = async (req, res) => {
  try {
    const generosNoMusicales = await GeneroNoMusical.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(generosNoMusicales);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un género no musical existente
exports.read = (req, res) => {
  res.json(req.generoNoMusical);
};

// Método para actualizar un género no musical existente
exports.update = async (req, res) => {
  const generoNoMusical = req.generoNoMusical;
  generoNoMusical.nombre = req.body.nombre;
  generoNoMusical.alias = req.body.alias;
  generoNoMusical.padres = req.body.padres;
  generoNoMusical.hijos = req.body.hijos;
  generoNoMusical.descripcion = req.body.descripcion;
  generoNoMusical.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  generoNoMusical.idioma = req.body.idioma;
  generoNoMusical.proyectosAsociados = req.body.proyectosAsociados;
  generoNoMusical.descriptorLibre = req.body.descriptorLibre;
  generoNoMusical.vinculoRelacionado = req.body.vinculoRelacionado;
  generoNoMusical.archivosAdjuntos = req.body.archivosAdjuntos;

  try {
    const updatedGeneroNoMusical = await generoNoMusical.save();
    await logAudit(req, "genero_nomusical_updated", "genero_nomusical", updatedGeneroNoMusical._id, updatedGeneroNoMusical.nombre);
    res.json(updatedGeneroNoMusical);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  const generoNoMusical = req.generoNoMusical;
  try {
    await GeneroNoMusical.deleteOne({ _id: generoNoMusical._id });
    await logAudit(req, "genero_nomusical_deleted", "genero_nomusical", generoNoMusical._id, generoNoMusical.nombre);
    res.json(generoNoMusical);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un género no musical existente
exports.generoNoMusicalByID = async (req, res, next, id) => {
  try {
    const generoNoMusical = await GeneroNoMusical.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!generoNoMusical) {
      return next(new Error("Fallo al cargar el género no musical " + id));
    }
    req.generoNoMusical = generoNoMusical;
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre género
exports.hasAuthorization = (req, res, next) => {
  if (req.generoNoMusical.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  next();
};
