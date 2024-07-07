"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Coleccion = mongoose.model("Coleccion");

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

// Método para crear los coleccions
exports.create = async (req, res) => {
  const coleccion = new Coleccion(req.body);
  // Configurar la propiedad 'creador'
  coleccion.creador = req.user;
  if (coleccion.descriptorLibre == "") {
    delete coleccion.descriptorLibre;
  }
  try {
    // Intentar salvar la coleccion
    const savedColeccion = await coleccion.save();
    // Enviar una representación JSON de la coleccion
    res.json(savedColeccion);
  } catch (err) {
    // Si ocurre algún error enviar el mensaje
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de coleccions
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de coleccions
    const colecciones = await Coleccion.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(colecciones);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una coleccion existente
exports.read = (req, res) => {
  res.json(req.coleccion);
};

// Método para actualizar una coleccion existente
exports.update = async (req, res) => {
  // Obtiene la coleccion usando el objeto 'request'
  const coleccion = req.coleccion;
  // Actualiza los campos
  coleccion.nombre = req.body.nombre;
  coleccion.tipo = req.body.tipo;
  coleccion.fechaDeCreacion = req.body.fechaDeCreacion;
  coleccion.precision = req.body.precision;
  coleccion.propiedadComodato = req.body.propiedadComodato;
  try {
    // Intenta salvar
    const updatedColeccion = await coleccion.save();
    res.json(updatedColeccion);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener la coleccion usando el objeto 'request'
  const coleccion = req.coleccion;
  try {
    // Usar el método model 'deleteOne' para borrar
    await coleccion.deleteOne();
    res.json(coleccion);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar una coleccion existente
exports.coleccionByID = async (req, res, next, id) => {
  try {
    const coleccion = await Coleccion.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!coleccion) {
      return next(new Error("Fallo al cargar la coleccion " + id));
    }
    // Si la coleccion es encontrada, usar el objeto 'request' para pasarla al sgte middleware
    req.coleccion = coleccion;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre coleccion
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual no es el creador, enviar el mensaje de error
  if (req.coleccion.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
