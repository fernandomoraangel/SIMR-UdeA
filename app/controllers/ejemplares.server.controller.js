"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Ejemplar = mongoose.model("Ejemplar");

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

//Método para crear las ejemplars
exports.create = function (req, res) {
  var ejemplar = new Ejemplar(req.body);
  //Configurar la propiedad 'creador'
  ejemplar.creador = req.user;
  //Intentar salvar la ejemplar
  ejemplar.save(function (err) {
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la ejemplar
      res.json(ejemplar);
    }
  });
};

// Método que recupera una lista de ejemplars
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de ejemplares
  Ejemplar.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, ejemplar) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(ejemplar);
      }
    });
};

//Método que devuelve una ejemplar existente
exports.read = function (req, res) {
  res.json(req.ejemplar);
};

//Método para actualizar una ejemplar existente
exports.update = function (req, res) {
  //Obtiene la ejemplar usando el objeto 'request'
  var ejemplar = req.ejemplar;
  //Actualiza los campos
  ejemplar.recurso = req.body.recurso;
  ejemplar.numeroEjemplar = req.body.numeroEjemplar;
  ejemplar.disponibilidad = req.body.disponibilidad;
  ejemplar.fondo = req.body.fondo;
  ejemplar.coleccion = req.body.coleccion;
  ejemplar.procedencia = req.body.procedencia;
  ejemplar.estados = req.body.estados;
  //Intenta salvar
  ejemplar.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(ejemplar);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la ejemplar usando el objeto 'request'
  var ejemplar = req.ejemplar;
  //Usar el método model 'remove' para borrar
  ejemplar.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(ejemplar);
    }
  });
};
//Controller middleware para recuperar una ejemplar existente
exports.ejemplarByID = function (req, res, next, id) {
  Ejemplar.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, ejemplar) {
      if (err) return next(err);
      if (!ejemplar) return next(new Error("Fallo al cargar la ejemplar" + id));
      //Si la ejemplar es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.ejemplar = ejemplar;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre ejemplar
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.ejemplar.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
