"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Diccionario = mongoose.model("Diccionario");

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

//Método para crear los idiomas
exports.create = function (req, res) {
  var diccionario = new Diccionario(req.body);
  //Configurar la propiedad 'creador'
  diccionario.creador = req.user;
  //Intentar salvar
  diccionario.save(function (err) {
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la ejemplar
      res.json(diccionario);
    }
  });
};

// Método que recupera una lista de diccionarios
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de diccionarios
  Diccionario.find()
    .sort("campo")
    .populate("creador", "campo")
    .exec(function (err, diccionario) {
      //console.log("Buscando diccionarios");
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(diccionario);
      }
    });
};

//Método que devuelve una diccionario existente
exports.read = function (req, res) {
  res.json(req.diccionario);
};

//Método para actualizar un diccionario existente
exports.update = function (req, res) {
  //Obtiene la ejemplar usando el objeto 'request'
  var diccionario = req.diccionario;
  //Actualiza los campos
  diccionario.tabla = req.body.tabla;
  diccionario.campo = req.body.campo;
  diccionario.definicion = req.body.definicion;
  diccionario.campoLargo = req.body.campoLargo;

  //Intenta salvar
  diccionario.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(diccionario);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la ejemplar usando el objeto 'request'
  var diccionario = req.diccionario;
  //Usar el método model 'remove' para borrar
  diccionario.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(diccionario);
    }
  });
};
//Controller middleware para recuperar diccionario existente
exports.diccionarioByID = function (req, res, next, id) {
  Diccionario.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, diccionario) {
      if (err) return next(err);
      if (!diccionario)
        return next(new Error("Fallo al cargar el diccionario" + id));
      //Si el diccionario es encontrado, usar el objeto 'request' para pasarla al sgte middleware
      req.diccionario = diccionario;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre idioma
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.diccionario.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
