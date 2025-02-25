"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Propiedad = mongoose.model("Propiedad");

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

// Método para crear la lista
exports.create = async (req, res) => {
  try {
    const propiedad = new Propiedad(req.body);
    // Configurar la propiedad 'creador'
    propiedad.creador = req.user;
    // Intentar salvar
    await propiedad.save();
    // Enviar una representación JSON de la ejemplar
    res.json(propiedad);
  } catch (err) {
    // Si ocurre algún error enviar el mensaje
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de listas
exports.propiedad = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de propiedades
    const propiedad = await Propiedad.find()
      // .sort("-creado")
      .sort("-created")
      .populate("creador", "rol")
      .exec();
    res.json(propiedad);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una propiedad existente
exports.read = (req, res) => {
  res.json(req.propiedad);
};

// Método para actualizar una propiedad existente
exports.update = async (req, res) => {
  try {
    // var propiedad = await Propiedad.findByIdAndUpdate(req.propiedad.id, req.body, { new: true });

    // Obtiene la propiedad usando el objeto 'request'
    const propiedad = req.propiedad;

    // Actualiza los campos
    propiedad.propiedad = req.body.propiedad;

    // Intenta salvar
    await propiedad.save();
    res.json(propiedad);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  try {
    // Obtener la ejemplar usando el objeto 'request'
    const propiedad = req.propiedad;
    // Usar el método model 'deleteOne' para borrar
    await propiedad.deleteOne();
    res.json(propiedad);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un rol existente
exports.propiedadByID = async (req, res, next, id) => {
  try {
    const propiedad = await Propiedad.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();

    if (!propiedad) {
      return next(new Error("Fallo al cargar la propiedad: " + id));
    }

    // Si el rol es encontrado, usar el objeto 'request' para pasarla al siguiente middleware
    req.propiedad = propiedad;
    // Llamar al siguiente middleware
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre rol
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.propiedad.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
