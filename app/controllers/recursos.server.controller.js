"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Recurso = mongoose.model("Recurso");

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
  var recurso = new Recurso(req.body);
  //Configurar la propiedad 'creador'
  recurso.creador = req.user;
  if (recurso.descriptorLibre == "") {
    delete recurso.descriptorLibre;
  }
  //Intentar salvar la recurso
  recurso.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la recurso
      res.json(recurso);
    }
  });
};

// Método que recupera una lista de recursos
exports.list = function (req, res) {
  //console.log("Buscando recursos...")
  //Usa el método model 'find' para obtener una lista de recursos
  Recurso.find()
    .sort("-created")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, recurso) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(recurso);
      }
    });
};

//Método que devuelve una recurso existente
exports.read = function (req, res) {
  res.json(req.recurso);
};

//Método para actualizar una recurso existente
exports.update = function (req, res) {
  //Obtiene la recurso usando el objeto 'request'
  var recurso = req.recurso;
  //Actualiza los campos
  recurso.titulo = req.body.titulo;
  recurso.obrasRelacionadas = req.body.obrasRelacionadas;
  recurso.numeroNormalizado = req.body.numeroNormalizado;
  recurso.faceta = req.body.faceta;
  recurso.mencionResponsabilidad = req.body.mencionResponsabilidad;
  recurso.descripcion = req.body.descripcion;
  recurso.contenedores = req.body.contenedores;
  recurso.fuente = req.body.fuente;
  recurso.tiposDeRecurso = req.body.tiposDeRecurso;
  recurso.anotacionCartograficoTemporal =
    req.body.anotacionCartograficoTemporal;
  recurso.materia = req.body.materia;
  recurso.idiomas = req.body.idiomas;
  recurso.descripcionTecnica = req.body.descripcionTecnica;
  recurso.materialAcompanante = req.body.materialAcompanante;
  recurso.mencionDeSerie = req.body.mencionDeSerie;
  recurso.proyectos = req.body.proyectos;
  recurso.vinculoRelacionado = req.body.vinculoRelacionado;
  recurso.descriptorLibre = req.body.descriptorLibre;
  //Intenta salvar
  recurso.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(recurso);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la recurso usando el objeto 'request'
  var recurso = req.recurso;
  //Usar el método model 'remove' para borrar
  recurso.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(recurso);
    }
  });
};
//Controller middleware para recuperar una recurso existente
exports.recursoByID = function (req, res, next, id) {
  Recurso.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, recurso) {
      if (err) return next(err);
      if (!recurso) return next(new Error("Fallo al cargar la recurso" + id));
      //Si la recurso es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.recurso = recurso;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre recurso
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.recurso.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
