"use Strict";

//Cargar dependencias
var mongoose = require("mongoose"),
  Sistema = mongoose.model("Sistema");

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
  var sistema = new Sistema(req.body);
  //Configurar la propiedad 'creador'
  sistema.creador = req.user;

  //Intentar salvar la sistema
  sistema.save(function (err) {
    //alert("Salvando")
    if (err) {
      //Si ocurre algún error enviar el mensaje
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      //Enviar una representación JSON de la sistema
      res.json(sistema);
    }
  });
};

// Método que recupera una lista de sistemas
exports.list = function (req, res) {
  //Usa el método model 'find' para obtener una lista de recursos
  Sistema.find()
    .sort("-created")
    .populate("creador", "nombre")
    .exec(function (err, sistema) {
      if (err) {
        return res.status(400).send({
          message: getErrorMessage(err),
        });
      } else {
        res.json(sistema);
      }
    });
};

//Método que devuelve una sistema existente
exports.read = function (req, res) {
  res.json(req.sistema);
};

//Método para actualizar una sistema existente
exports.update = function (req, res) {
  //Obtiene la sistema usando el objeto 'request'
  var sistema = req.sistema;
  //Actualiza los campos
  sistema.nombre = req.body.nombre;
  sistema.descripcion = req.body.descripcion;
  sistema.alias = req.body.alias;
  sistema.sistemasRelacionados = req.body.sistemasRelacionados;
  sistema.padres = req.body.padres;
  sistema.hijos = req.body.hijos;
  sistema.proyectosAsociados = req.body.proyectosAsociados;
  sistema.anotacionCartograficoTemporal =
    req.body.anotacionCartograficoTemporal;
  sistema.vinculoRelacionado = req.body.vinculoRelacionado;

  //Intenta salvar
  sistema.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(sistema);
    }
  });
};
//Método para borrar
exports.delete = function (req, res) {
  //Obtener la sistema usando el objeto 'request'
  var sistema = req.sistema;
  //Usar el método model 'remove' para borrar
  sistema.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err),
      });
    } else {
      res.json(sistema);
    }
  });
};
//Controller middleware para recuperar una sistema existente
exports.sistemaByID = function (req, res, next, id) {
  Sistema.findById(id)
    .populate("creador", "firstName lastName fullName")
    .exec(function (err, sistema) {
      if (err) return next(err);
      if (!sistema) return next(new Error("Fallo al cargar la sistema" + id));
      //Si la sistema es encontrada, usar el objeto 'request' para pasarla al sgte middleware
      req.sistema = sistema;
      //Llamar al sgte middleware
      next();
    });
};

//Controller middleware para autorizar una operación sobre sistema
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.sistema.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
