"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Proyecto = mongoose.model("Proyecto");

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

// Método para crear las recursos
exports.create = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  //Configurar la propiedad 'creador'
  proyecto.creador = req.user;

  try {
    // Intentar salvar la proyecto
    await proyecto.save();
    res.json(proyecto);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de proyectos
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de recursos
    const proyectos = await Proyecto.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(proyectos);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una proyecto existente
exports.read = (req, res) => {
  res.json(req.proyecto);
};

// Método para actualizar una proyecto existente
exports.update = async (req, res) => {
  // Obtiene la proyecto usando el objeto 'request'
  const proyecto = req.proyecto;
  // Actualiza los campos
  proyecto.nombre = req.body.nombre;
  proyecto.investigadores = req.body.investigadores;
  proyecto.fechasAsociadas = req.body.fechasAsociadas;
  proyecto.estado = req.body.estado;
  proyecto.descriptoresLibres = req.body.descriptoresLibres;
  proyecto.vinculoRelacionado = req.body.vinculoRelacionado;
  proyecto.archivosAdjuntos = req.body.archivosAdjuntos;
  // Intenta salvar
  try {
    await proyecto.save();
    res.json(proyecto);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }

};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener la proyecto usando el objeto 'request'
  const proyecto = req.proyecto;
  try {
    // Usar el método model 'deleteOne' para borrar
    await proyecto.deleteOne();
    res.json(proyecto);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar un proyecto existente
exports.proyectoByID = async (req, res, next, id) => {
  try {
    const proyecto = await Proyecto.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!proyecto) return next(new Error("Fallo al cargar la proyecto" + id));
    req.proyecto = proyecto;
    next()
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre proyecto
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.proyecto.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
