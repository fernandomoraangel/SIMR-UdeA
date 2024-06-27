"use strict";

// [Texto de prueba 2]

//Cargar dependencias
var mongoose = require("mongoose"),
  Idioma = mongoose.model("Idioma");

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

//Método para crear los diccionarios
exports.create = async function (req, res) {
  try {
    var idioma = new Idioma(req.body);
    //Configurar la propiedad 'creador'
    idioma.creador = req.user;
    //Intentar salvar
    await idioma.save();
    //Enviar una representación JSON de la ejemplar
    res.json(idioma);
  } catch (err) {
    //Si ocurre algún error enviar el mensaje
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de idiomas
exports.list = async function (req, res) {
  try {
    //Usa el método model 'find' para obtener una lista de idiomas
    var idioma = await Idioma.find()
      // .sort("-created")
      .sort("-creado")
      .populate("creador", "idioma")
      .exec();
    res.json(idioma);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

//Método que devuelve una idioma existente
exports.read = function (req, res) {
  res.json(req.idioma);
};

//Método para actualizar un idioma existente
exports.update = async function (req, res) {
  try {
    // var idioma = await Idioma.findByIdAndUpdate(req.idioma.id, req.body, { new: true });

    //Obtiene la ejemplar usando el objeto 'request'
    var idioma = req.idioma;
    //Actualiza los campos
    idioma.idioma = req.body.idioma;

    //Intenta salvar
    await idioma.save();
    res.json(idioma);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

//Método para borrar
exports.delete = async function (req, res) {
  try {
    //Obtener la ejemplar usando el objeto 'request'
    var idioma = req.idioma;
    //Usar el método model 'deleteOne' para borrar
    await idioma.deleteOne();
    res.json(idioma);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

/// Controller middleware para recuperar un idioma existente
exports.idiomaByID = async function (req, res, next, id) {
  try {
    const idioma = await Idioma.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    
    if (!idioma) {
      return next(new Error("Fallo al cargar el idioma: " + id));
    }
    
    // Si el idioma es encontrado, usar el objeto 'request' para pasarla al siguiente middleware
    req.idioma = idioma;
    // Llamar al siguiente middleware
    next();
  } catch (err) {
    return next(err);
  }
};



//Controller middleware para autorizar una operación sobre idioma
exports.hasAuthorization = function (req, res, next) {
  //Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.idioma.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  //Llamar sgte middleware
  next();
};
