"use strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Obra = mongoose.model("Obra");

//Método para el manejo de errores
/* var getErrorMessage = function (err) {
  if (err.errors) {
    for (var errName in err.errors) {
      if (err.errors[errName].message) return err.errors[errName].message;
    }
  } else {
  }
  return message;
}; */

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

//Método para crear las obras
exports.create = function (req, res) {
  var obra = new Obra(req.body);
  //Configurar la propiedad 'creador'
  obra.creador = req.user;
  //Intentar salvar la obra
  obra.save(function (err) {
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la obra
      res.json(obra);
    }
  });
};

// Método que recupera una lista de obras
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de obras
  Obra.find()
    .sort("titulo")
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, obra) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(obra);
      }
    });
};

//Método que devuelve una obra existente
exports.read = function (req, res) {
  res.json(req.obra);
};

//Método para actualizar una obra existente
exports.update = function (req, res) {
  //Obtiene la obra usando el objeto 'request'
  var obra = req.obra;
  //Actualiza los campos
  obra.titulo = req.body.titulo;
  obra.denominacionRegional = req.body.denominacionRegional;
  obra.descripcion = req.body.descripcion;
  obra.tipo = req.body.tipo;
  obra.contenedores = req.body.contenedores;
  obra.asientoLigado = req.body.asientoLigado;
  obra.ObraDerivadaDe = req.body.ObraDerivadaDe;
  obra.parteOSeccionDe = req.body.parteOSeccionDe;
  obra.generosFormas = req.body.generosFormas;
  obra.GenerosFormasNoMusicales = req.body.GenerosFormasNoMusicales;
  obra.materias = req.body.materias;
  obra.mediosSonoros = req.body.mediosSonoros;
  obra.sistemasSonoros = req.body.sistemasSonoros;
  obra.idiomas = req.body.idiomas;
  obra.actores = req.body.actores;
  obra.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  obra.descriptores = req.body.descriptores;
  obra.proyectos = req.body.proyectos;
  obra.vinculosRelacionados = req.body.vinculosRelacionados;
  //Intenta salvar
  obra.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(obra);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la obra usando el objeto 'request'
  var obra = req.obra;
  //Usar el método model 'remove' para borrar
  obra.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(obra);
    }
  });
};
//Controller middleware para recuperar una obra existente
exports.obraByID = function (req, res, next, id) {
  Obra.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, obra) {
      if (err) return next(err);
      if (!obra) return next(new Error("Fallo al cargar la obra" + id));
      //Si la obra es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.obra = obra;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre obra
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.obra.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
