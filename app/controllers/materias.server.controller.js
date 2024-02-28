"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Materia = mongoose.model("Materia");

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
  var materia = new Materia(req.body);
  //Configurar la propiedad 'creador'
  materia.creador = req.user;

  //Intentar salvar la materia
  materia.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la materia
      res.json(materia);
    }
  });
};

// Método que recupera una lista de materias
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de recursos
  Materia.find()
    .sort("-created")
    .populate("creador", "nombre")
    .exec(function (err, materia) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(materia);
      }
    });
};

//Método que devuelve una materia existente
exports.read = function (req, res) {
  res.json(req.materia);
};

//Método para actualizar una materia existente
exports.update = function (req, res) {
  //Obtiene la materia usando el objeto 'request'
  var materia = req.materia;
  //Actualiza los campos
  materia.nombre = req.body.nombre;
  materia.descripcion = req.body.descripcion;
  materia.alias = req.body.alias;
  materia.materiasRelacionadas = req.body.materiasRelacionadas;
  materia.padres = req.body.padres;
  materia.hijos = req.body.hijos;
  materia.descriptorLibre = req.body.descriptorLibre;
  materia.vinculoRelacionado = req.body.vinculoRelacionado;
  //Intenta salvar
  materia.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(materia);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la materia usando el objeto 'request'
  var materia = req.materia;
  //Usar el método model 'remove' para borrar
  materia.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(materia);
    }
  });
};
//Controller middleware para recuperar una materia existente
exports.materiaByID = function (req, res, next, id) {
  Materia.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, materia) {
      if (err) return next(err);
      if (!materia) return next(new Error("Fallo al cargar la materia" + id));
      //Si la materia es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.materia = materia;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre materia
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.materia.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
