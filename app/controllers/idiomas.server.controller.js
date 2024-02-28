"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Idioma = mongoose.model("Idioma");

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

//Método para crear los diccionarios
exports.create = function (req, res) {
  var idioma = new Idioma(req.body);
  //Configurar la propiedad 'creador'
  idioma.creador = req.user;
  //Intentar salvar
  idioma.save(function (err) {
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la ejemplar
      res.json(idioma);
    }
  });
};

// Método que recupera una lista de idiomas
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de idiomas
  Idioma.find()
    .sort("-created")
    .populate("creador", "idioma")
    .exec(function (err, idioma) {
      //console.log("Buscando idiomas");
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(idioma);
      }
    });
};

//Método que devuelve una idioma existente
exports.read = function (req, res) {
  res.json(req.idioma);
};

//Método para actualizar un idioma existente
exports.update = function (req, res) {
  //Obtiene la ejemplar usando el objeto 'request'
  var idioma = req.idioma;
  //Actualiza los campos
  idioma.idioma = req.body.idioma;

  //Intenta salvar
  idioma.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(idioma);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la ejemplar usando el objeto 'request'
  var idioma = req.idioma;
  //Usar el método model 'remove' para borrar
  idioma.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(idioma);
    }
  });
};
//Controller middleware para recuperar una idioma existente
exports.idiomaByID = function (req, res, next, id) {
  Idioma.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, idioma) {
      if (err) return next(err);
      if (!idioma) return next(new Error("Fallo al cargar el idioma" + id));
      //Si el idioma es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.idioma = idioma;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre idioma
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.idioma.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
