"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Coleccion = mongoose.model("Coleccion");

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

//Método para crear los coleccions
exports.create = function (req, res) {
  var coleccion = new Coleccion(req.body);
  //Configurar la propiedad 'creador'
  coleccion.creador = req.user;
  if (coleccion.descriptorLibre == "") {
    delete coleccion.descriptorLibre;
  }
  //Intentar salvar la coleccion
  coleccion.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la coleccion
      res.json(coleccion);
    }
  });
};

// Método que recupera una lista de coleccions
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de coleccions
  Coleccion.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, coleccion) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(coleccion);
      }
    });
};

//Método que devuelve una coleccion existente
exports.read = function (req, res) {
  res.json(req.coleccion);
};

//Método para actualizar una coleccion existente
exports.update = function (req, res) {
  //Obtiene la coleccion usando el objeto 'request'
  var coleccion = req.coleccion;
  //Actualiza los campos
  coleccion.nombre = req.body.nombre;
  coleccion.tipo = req.body.tipo;
  coleccion.fechaDeCreacion = req.body.fechaDeCreacion;
  coleccion.precision = req.body.precision;
  coleccion.propiedadComodato = req.body.propiedadComodato;
  //Intenta salvar
  coleccion.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(coleccion);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la coleccion usando el objeto 'request'
  var coleccion = req.coleccion;
  //Usar el método model 'remove' para borrar
  coleccion.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(coleccion);
    }
  });
};
//Controller middleware para recuperar una coleccion existente
exports.coleccionByID = function (req, res, next, id) {
  Coleccion.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, coleccion) {
      if (err) return next(err);
      if (!coleccion)
        return next(new Error("Fallo al cargar la coleccion" + id));
      //Si la coleccion es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.coleccion = coleccion;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre coleccion
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.coleccion.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
