"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Actor = mongoose.model("Actor");

//Método para el manejo de errores
var getErrorMessage = function (err) {
  //Definir variable de error message
  var message = "";
  //Si ocurre un error interno de MongoDB
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El registro ya existe";
        break;
      //si un error general ocurre
      default:
        message = "Se ha producido un error";
    }
  } else {
    //Grabar el error en una lista de posibles errores
    for (var errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  //Devolver el mensaje de error
  return message;
};

//Método para crear los actores
exports.create = function (req, res) {
  var actor = new Actor(req.body);
  //Configurar la propiedad 'creador'
  actor.creador = req.user;
  //Intentar salvar el actor
  actor.save(function (err) {
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON del actor
      res.json(actor);
    }
  });
};

// Método que recupera una lista de actores
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de actores
  Actor.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, actor) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(actor);
      }
    });
};

//Método que devuelve un actor existente
exports.read = function (req, res) {
  res.json(req.actor);
};

//Método para actualizar un actor existente
exports.update = function (req, res) {
  //Obtiene el actor usando el objeto 'request'
  var actor = req.actor;
  //Actualiza los campos
  actor.nombres = req.body.nombres;
  actor.apellidos = req.body.apellidos;
  actor.nombreReunion = req.body.nombreReunion;
  actor.contenedor = req.body.contenedor;
  actor.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  actor.descriptores = req.body.descriptores;
  actor.vinculoRelacionado = req.body.vinculoRelacionado;

  //Intenta salvar
  actor.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(actor);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener el actor usando el objeto 'request'
  var actor = req.actor;
  //Usar el método model 'remove' para borrar
  actor.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(actor);
    }
  });
};
//Controller middleware para recuperar un actor existente
exports.actorByID = function (req, res, next, id) {
  Actor.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, actor) {
      if (err) return next(err);
      if (!actor) return next(new Error("Fallo al cargar el actor" + id));
      //Si el actor es encontrado, usar el objeto 'request' para pasarla al sgte middleware
      req.actor = actor;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre un actor
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.actor.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
