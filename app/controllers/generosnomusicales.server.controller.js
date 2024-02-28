"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  GeneroNoMusical = mongoose.model("GeneroNoMusical");

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
  var generoNoMusical = new GeneroNoMusical(req.body);
  //Configurar la propiedad 'creador'
  generoNoMusical.creador = req.user;

  //Intentar salvar la genero
  generoNoMusical.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la genero
      res.json(generoNoMusical);
    }
  });
};

// Método que recupera una lista de recursos
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de recursos
  GeneroNoMusical.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, generoNoMusical) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(generoNoMusical);
      }
    });
};

//Método que devuelve una genero existente
exports.read = function (req, res) {
  res.json(req.generoNoMusical);
};

//Método para actualizar una genero existente
exports.update = function (req, res) {
  //Obtiene la genero usando el objeto 'request'
  var generoNoMusical = req.generoNoMusical;
  //Actualiza los campos
  generoNoMusical.nombre = req.body.nombre;
  generoNoMusical.alias = req.body.alias;
  generoNoMusical.padres = req.body.padres;
  generoNoMusical.hijos = req.body.hijos;
  generoNoMusical.descripcion = req.body.descripcion;
  generoNoMusical.anotacionCartograficoTemporal =
    req.body.anotacionCartograficoTemporal;
  generoNoMusical.idioma = req.body.idioma;
  generoNoMusical.proyectosAsociados = req.body.proyectosAsociados;
  generoNoMusical.descriptorLibre = req.body.descriptorLibre;
  generoNoMusical.vinculoRelacionado = req.body.vinculoRelacionado;
  //Intenta salvar
  generoNoMusical.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(generoNoMusical);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la genero usando el objeto 'request'
  var generoNoMusical = req.generoNoMusical;
  //Usar el método model 'remove' para borrar
  generoNoMusical.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(generoNoMusical);
    }
  });
};
//Controller middleware para recuperar una genero existente
exports.generoNoMusicalByID = function (req, res, next, id) {
  GeneroNoMusical.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, generoNoMusical) {
      if (err) return next(err);
      if (!generoNoMusical)
        return next(new Error("Fallo al cargar la genero no musical" + id));
      //Si el genero no musical es encontrado, usar el objeto 'request' para pasarla al sgte middleware
      req.generoNoMusical = generoNoMusical;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre genero
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.generoNoMusical.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
