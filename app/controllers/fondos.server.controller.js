"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Fondo = mongoose.model("Fondo");

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

// Método para crear los fondos
exports.create = async (req, res) => {
  const fondo = new Fondo(req.body);
  // Configurar la propiedad 'creador'
  fondo.creador = req.user;
  if (fondo.descriptorLibre == "") {
    delete fondo.descriptorLibre;
  }
  try {
    // Intentar salvar la fondo
    const savedFondo = await fondo.save();
    // Enviar una representación JSON de la fondo
    res.json(savedFondo);
  } catch (err) {
    // Si ocurre algún error enviar el mensaje
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de fondos
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de fondos
    const fondos = await Fondo.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(fondos);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un fondo existente
exports.read = (req, res) => {
  res.json(req.fondo);
};

// Método para actualizar un fondo existente
exports.update = async (req, res) => {
  // Obtiene el fondo usando el objeto 'request'
  const fondo = req.fondo;
  // Actualiza los campos
  fondo.nombre = req.body.nombre;
  fondo.tipo = req.body.tipo;
  fondo.propiedadComodato = req.body.propiedadComodato;
  fondo.fechaDeCreacion = req.body.fechaDeCreacion;
  fondo.precision = req.body.precision;
  try {
    // Intenta salvar
    const updatedFondo = await fondo.save();
    res.json(updatedFondo);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener el fondo usando el objeto 'request'
  const fondo = req.fondo;
  try {
    // Usar el método model 'deleteOne' para borrar
    await Fondo.deleteOne({ _id: fondo._id });
    res.json(fondo);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un fondo existente
exports.fondoByID = async (req, res, next, id) => {
  try {
    const fondo = await Fondo.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!fondo) {
      return next(new Error("Fallo al cargar el fondo " + id));
    }
    // Si el fondo es encontrado, usar el objeto 'request' para pasarla al sgte middleware
    req.fondo = fondo;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre fondo
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual no es el creador, enviar el mensaje de error
  if (req.fondo.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
