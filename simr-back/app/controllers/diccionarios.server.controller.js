"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Diccionario = mongoose.model("Diccionario");

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

// Método para crear los diccionarios
exports.create = async (req, res) => {
  const diccionario = new Diccionario(req.body);
  // Configurar la propiedad 'creador'
  diccionario.creador = req.user;
  // Intentar salvar
  try {
    await diccionario.save();
    // Enviar una representación JSON del ejemplar
    res.json(diccionario);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de diccionarios
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de diccionarios
    const diccionarios = await Diccionario.find()
      .sort("campo")
      .populate("creador", "campo")
      .exec();
    res.json(diccionarios);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un diccionario existente
exports.read = (req, res) => {
  res.json(req.diccionario);
};

// Método para actualizar un diccionario existente
exports.update = async (req, res) => {
  // Obtiene la ejemplar usando el objeto 'request'
  const diccionario = req.diccionario;

  // Actualiza los campos
  diccionario.tabla = req.body.tabla;
  diccionario.campo = req.body.campo;
  diccionario.definicion = req.body.definicion;
  diccionario.campoLargo = req.body.campoLargo;

  // Intenta salvar
  try {
    await diccionario.save();
    res.json(diccionario);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener el ejemplar usando el objeto 'request'
  const diccionario = req.diccionario;

  try {
    // Usar el método model 'deleteOne' para borrar
    await diccionario.deleteOne();
    res.json(diccionario);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar diccionario existente
exports.diccionarioByID = async (req, res, next, id) => {
  try {
    const diccionario = await Diccionario.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!diccionario) return next(new Error("Fallo al cargar la materia" + id));
    // Si la materia es encontrada, usar el objeto 'request' para pasarla al sgte middleware
    req.diccionario = diccionario;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre diccionario
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.diccionario.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
