"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Medio = mongoose.model("Medio");

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

//Método para crear las recursos
exports.create = function (req, res) {
  var medio = new Medio(req.body);
  //Configurar la propiedad 'creador'
  medio.creador = req.user;

  //Intentar salvar la medio
  medio.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la medio
      res.json(medio);
    }
  });
};

// Método que recupera una lista de medios
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de recursos
  Medio.find()
    .sort("-created")
    .populate("creador", "nombre")
    .exec(function (err, medio) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(medio);
      }
    });
};

//Método que devuelve una medio existente
exports.read = function (req, res) {
  res.json(req.medio);
};

//Método para actualizar una medio existente
exports.update = function (req, res) {
  //Obtiene la medio usando el objeto 'request'
  var medio = req.medio;
  //Actualiza los campos
  medio.nombre = req.body.nombre;
  medio.alias = req.body.alias;
  medio.instrumentos = req.body.instrumentos;
  medio.proyectosAsociados = req.body.proyectosAsociados;
  medio.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  medio.descriptorLibre = req.body.descriptorLibre;
  medio.vinculoRelacionado = req.body.vinculoRelacionado;

  //Intenta salvar
  medio.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(medio);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la medio usando el objeto 'request'
  var medio = req.medio;
  //Usar el método model 'remove' para borrar
  medio.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(medio);
    }
  });
};
//Controller middleware para recuperar una medio existente
exports.medioByID = function (req, res, next, id) {
  Medio.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, medio) {
      if (err) return next(err);
      if (!medio) return next(new Error("Fallo al cargar el medio" + id));
      //Si el medio es encontrado, usar el objeto 'request' para pasarla al sgte middleware
      req.medio = medio;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre medio
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.medio.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
