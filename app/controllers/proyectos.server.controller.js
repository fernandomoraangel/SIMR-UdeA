"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Proyecto = mongoose.model("Proyecto");

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
  var proyecto = new Proyecto(req.body);
  //Configurar la propiedad 'creador'
  proyecto.creador = req.user;

  //Intentar salvar la proyecto
  proyecto.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la proyecto
      res.json(proyecto);
    }
  });
};

// Método que recupera una lista de proyectos
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de recursos
  Proyecto.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, proyecto) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(proyecto);
      }
    });
};

//Método que devuelve una proyecto existente
exports.read = function (req, res) {
  res.json(req.proyecto);
};

//Método para actualizar una proyecto existente
exports.update = function (req, res) {
  //Obtiene la proyecto usando el objeto 'request'
  var proyecto = req.proyecto;
  //Actualiza los campos
  proyecto.nombre = req.body.nombre;
  proyecto.investigadores = req.body.investigadores;
  proyecto.fechasAsociadas = req.body.fechasAsociadas;
  proyecto.estado = req.body.estado;
  proyecto.descriptoresLibres = req.body.descriptoresLibres;
  proyecto.vinculoRelacionado = req.body.vinculoRelacionado;

  //Intenta salvar
  proyecto.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(proyecto);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la proyecto usando el objeto 'request'
  var proyecto = req.proyecto;
  //Usar el método model 'remove' para borrar
  proyecto.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(proyecto);
    }
  });
};
//Controller middleware para recuperar una proyecto existente
exports.proyectoByID = function (req, res, next, id) {
  Proyecto.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, proyecto) {
      if (err) return next(err);
      if (!proyecto) return next(new Error("Fallo al cargar la proyecto" + id));
      //Si el proyecto es encontrado, usar el objeto 'request' para pasarla al sgte middleware
      req.proyecto = proyecto;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre proyecto
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.proyecto.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
