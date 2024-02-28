"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Genero = mongoose.model("Genero");

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
  var genero = new Genero(req.body);
  //Configurar la propiedad 'creador'
  genero.creador = req.user;

  //Intentar salvar la genero
  genero.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la genero
      res.json(genero);
    }
  });
};

// Método que recupera una lista de recursos
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de recursos
  Genero.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, genero) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(genero);
      }
    });
};

//Método que devuelve una genero existente
exports.read = function (req, res) {
  res.json(req.genero);
};

//Método para actualizar una genero existente
exports.update = function (req, res) {
  //Obtiene la genero usando el objeto 'request'
  var genero = req.genero;
  //Actualiza los campos
  genero.nombre = req.body.nombre;
  genero.descripcion = req.body.descripcion;
  genero.alias = req.body.alias;
  genero.GeneroRelacionado = req.body.GeneroRelacionado;
  genero.padres = req.body.padres;
  genero.hijos = req.body.hijos;
  genero.mediosSonoros = req.body.mediosSonoros;
  genero.sistemasSonoros = req.body.sistemasSonoros;
  genero.idioma = req.body.idioma;
  genero.proyectosAsociados = req.body.proyectosAsociados;
  genero.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  genero.descriptorLibre = req.body.descriptorLibre;
  genero.vinculoRelacionado = req.body.vinculoRelacionado;

  //Intenta salvar
  genero.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(genero);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la genero usando el objeto 'request'
  var genero = req.genero;
  //Usar el método model 'remove' para borrar
  genero.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(genero);
    }
  });
};
//Controller middleware para recuperar una genero existente
exports.generoByID = function (req, res, next, id) {
  Genero.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, genero) {
      if (err) return next(err);
      if (!genero) return next(new Error("Fallo al cargar la genero" + id));
      //Si la genero es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.genero = genero;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre genero
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.genero.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
