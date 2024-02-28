"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Instrumento = mongoose.model("Instrumento");

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

//Método para crear las obras
exports.create = function (req, res) {
  var instrumento = new Instrumento(req.body);
  //Configurar la propiedad 'creador'
  instrumento.creador = req.user;
  //Intentar salvar la instrumento
  instrumento.save(function (err) {
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la instrumento
      res.json(instrumento);
    }
  });
};

// Método que recupera una lista de obras
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de obras
  Instrumento.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, instrumento) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(instrumento);
      }
    });
};

//Método que devuelve una instrumento existente
exports.read = function (req, res) {
  res.json(req.instrumento);
};

//Método para actualizar una instrumento existente
exports.update = function (req, res) {
  //Obtiene la instrumento usando el objeto 'request'
  var instrumento = req.instrumento;
  //Actualiza los campos
  instrumento.nombre = req.body.nombre;
  instrumento.clasificacion = req.body.clasificacion;
  instrumento.alias = req.body.alias;
  instrumento.proyectosAsociados = req.body.proyectosAsociados;
  instrumento.anotacionCartograficoTemporal =
    req.body.anotacionCartograficoTemporal;
  instrumento.descriptorLibre = req.body.descriptorLibre;
  instrumento.vinculoRelacionado = req.body.vinculoRelacionado;
  instrumento.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(instrumento);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la instrumento usando el objeto 'request'
  var instrumento = req.instrumento;
  //Usar el método model 'remove' para borrar
  instrumento.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(instrumento);
    }
  });
};
//Controller middleware para recuperar una instrumento existente
exports.instrumentoByID = function (req, res, next, id) {
  Instrumento.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, instrumento) {
      if (err) return next(err);
      if (!instrumento)
        return next(new Error("Fallo al cargar la instrumento" + id));
      //Si la instrumento es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.instrumento = instrumento;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre instrumento
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.instrumento.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
