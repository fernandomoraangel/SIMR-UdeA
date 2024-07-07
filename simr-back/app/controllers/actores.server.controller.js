"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Actor = mongoose.model("Actor");

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

// Método para crear los actores
exports.create = async (req, res) => {
  const actor = new Actor(req.body);
  // Configurar la propiedad 'creador'
  actor.creador = req.user;

  //Intentar salvar el actor
  try {
    await actor.save();
    // Enviar una representación JSON del actor
    res.json(actor);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de actores
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de actores
    const actores = await Actor.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(actores);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un actor existente
exports.read = (req, res) => {
  res.json(req.actor);
};

// Método para actualizar un actor existente
exports.update = async (req, res) => {
  // Obtiene el actor usando el objeto 'request'
  const actor = req.actor;

  // Actualiza los campos
  actor.nombres = req.body.nombres;
  actor.apellidos = req.body.apellidos;
  actor.nombreReunion = req.body.nombreReunion;
  actor.contenedor = req.body.contenedor;
  actor.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  actor.descriptores = req.body.descriptores;
  actor.vinculoRelacionado = req.body.vinculoRelacionado;

  // Intenta salvar
  try {
    await actor.save();
    res.json(actor);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener el actor usando el objeto 'request'
  const actor = req.actor;

  try {
    // Usar el método model 'deleteOne' para borrar
    await actor.deleteOne();
    res.json(actor);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un actor existente
exports.actorByID = async (req, res, next, id) => {
  try {
    const actor = await Actor.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!actor) return next(new Error("Fallo al cargar el actor" + id));
    // Si la materia es encontrada, usar el objeto 'request' para pasarla al sgte middleware
    req.actor = actor;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre un actor
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.actor.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
