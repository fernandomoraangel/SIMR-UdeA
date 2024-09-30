"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Archivo = mongoose.model("Archivo");

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

// Método para crear los archivos
exports.create = async (req, res) => {
  const archivo = new Archivo(req.body);
  // Configurar la propiedad 'creador'
  archivo.creador = req.user;

  //Intentar salvar el archivo
  try {
    await archivo.save();
    // Enviar una representación JSON del archivo
    res.json(archivo);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de archivos
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de archivos
    const archivos = await Archivo.find()
      .sort("-created")
      .populate("creador", "originalName mimetype")
      .exec();
    res.json(archivos);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve un archivo existente
exports.read = (req, res) => {
  res.json(req.archivo);
};

// Método para actualizar un archivo existente
exports.update = async (req, res) => {
  // Obtiene el archivo usando el objeto 'request'
  const archivo = req.archivo;

  // Actualiza los campos
  archivo.filename = req.body.archivo.filename
  archivo.originalName = req.body.originalName
  archivo.mimetype = req.body.mimetype
  archivo.size = req.body.size
  archivo.uploadDate = req.body.uploadDate
  archivo.minioObjectName = req.body.minioObjectName

  // Intenta salvar
  try {
    await archivo.save();
    res.json(archivo);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener el archivo usando el objeto 'request'
  const archivo = req.archivo;

  try {
    // Usar el método model 'deleteOne' para borrar
    await archivo.deleteOne();
    res.json(archivo);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un archivo existente
exports.archivoByID = async (req, res, next, id) => {
  try {
    const archivo = await Archivo.findById(id)
      .populate("creador", "originalName mimetype")
      .exec();
    if (!archivo) return next(new Error("Fallo al cargar el archivo" + id));
    // Si el archivo es encontrado, usar el objeto 'request' para pasarla al sgte middleware
    req.archivo = archivo;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre un archivo
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.archivo.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
