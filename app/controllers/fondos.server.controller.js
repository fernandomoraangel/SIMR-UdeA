"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Fondo = mongoose.model("Fondo");

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

//Método para crear los fondos
exports.create = function (req, res) {
  var fondo = new Fondo(req.body);
  //Configurar la propiedad 'creador'
  fondo.creador = req.user;
  if (fondo.descriptorLibre == "") {
    delete fondo.descriptorLibre;
  }
  //Intentar salvar la fondo
  fondo.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la fondo
      res.json(fondo);
    }
  });
};

// Método que recupera una lista de fondos
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de fondos
  Fondo.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, fondo) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(fondo);
      }
    });
};

//Método que devuelve una fondo existente
exports.read = function (req, res) {
  res.json(req.fondo);
};

//Método para actualizar una fondo existente
exports.update = function (req, res) {
  //Obtiene la fondo usando el objeto 'request'
  var fondo = req.fondo;
  //Actualiza los campos
  fondo.nombre = req.body.nombre;
  fondo.tipo = req.body.tipo;
  fondo.propiedadComodato = req.body.propiedadComodato;
  fondo.fechaDeCreacion = req.body.fechaDeCreacion;
  fondo.precision = req.body.precision;
  //Intenta salvar
  fondo.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(fondo);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la fondo usando el objeto 'request'
  var fondo = req.fondo;
  //Usar el método model 'remove' para borrar
  fondo.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(fondo);
    }
  });
};
//Controller middleware para recuperar una fondo existente
exports.fondoByID = function (req, res, next, id) {
  Fondo.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, fondo) {
      if (err) return next(err);
      if (!fondo) return next(new Error("Fallo al cargar  fondo" + id));
      //Si la fondo es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.fondo = fondo;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre fondo
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.fondo.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
