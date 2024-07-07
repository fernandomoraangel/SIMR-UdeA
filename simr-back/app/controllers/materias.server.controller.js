"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Materia = mongoose.model("Materia");

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
    for (let errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  // Devolver el mensaje de error
  return message;
};

// Método para crear los recursos
exports.create = async (req, res) => {
  const materia = new Materia(req.body);
  // Configurar la propiedad 'creador'
  materia.creador = req.user;

  //Intentar salvar la materia
  try {
    await materia.save();
    // Enviar una representación JSON de la materia
    res.json(materia);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de materias
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de recursos
    const materias = await Materia.find()
      .sort("-created")
      .populate("creador", "nombre")
      .exec();
    res.json(materias);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una materia existente
exports.read = (req, res) => {
  res.json(req.materia);
};

// Método para actualizar una materia existente
exports.update = async (req, res) => {
  // Obtiene la materia usando el objeto 'request'
  const materia = req.materia;

  // Actualiza los campos
  materia.nombre = req.body.nombre;
  materia.descripcion = req.body.descripcion;
  materia.alias = req.body.alias;
  materia.materiasRelacionadas = req.body.materiasRelacionadas;
  materia.padres = req.body.padres;
  materia.hijos = req.body.hijos;
  materia.descriptorLibre = req.body.descriptorLibre;
  materia.vinculoRelacionado = req.body.vinculoRelacionado;

  // Intenta salvar
  try {
    await materia.save();
    res.json(materia);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener la materia usando el objeto 'request'
  const materia = req.materia;

  try {
    // Usar el método model 'deleteOne' para borrar
    await materia.deleteOne();
    res.json(materia);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar una materia existente
exports.materiaByID = async (req, res, next, id) => {
  try {
    const materia = await Materia.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!materia) return next(new Error("Fallo al cargar la materia" + id));
    // Si la materia es encontrada, usar el objeto 'request' para pasarla al sgte middleware
    req.materia = materia;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre materia
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.materia.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
