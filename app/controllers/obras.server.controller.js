"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Obra = mongoose.model("Obra");

// Método para el manejo de errores
const getErrorMessage = (err) => {
  let message = "";
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El registro ya existe";
        break;
      default:
        message = "Se ha producido un error";
    }
  } else {
    //Grabar el error en una lista de posibles errores
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  // Devolver el mensaje de error
  return message;
};

// Método para crear las obras
exports.create = async (req, res) => {
  const obra = new Obra(req.body);
  obra.creador = req.user;
  //Intentar salvar la obra
  try {
    const savedObra = await obra.save();
    res.json(savedObra);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de obras
exports.list = async (req, res) => {
  try {
    const obras = await Obra.find()
      .sort("titulo")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(obras);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una obra existente
exports.read = (req, res) => {
  res.json(req.obra);
};

// Método para actualizar una obra existente
exports.update = async (req, res) => {
  const obra = req.obra;
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

  try {
    const updatedObra = await obra.save();
    res.json(updatedObra);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar una obra
exports.delete = async (req, res) => {
  const obra = req.obra;

  try {
    await Obra.deleteOne({ _id: obra._id });
    res.json(obra);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar una obra existente
exports.obraByID = async (req, res, next, id) => {
  try {
    const obra = await Obra.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!obra) {
      return next(new Error("Fallo al cargar la obra " + id));
    }
    req.obra = obra;
    next();
  } catch (err) {
    return next(err);
  }
};

// Controller middleware para autorizar una operación sobre obra
exports.hasAuthorization = (req, res, next) => {
  if (req.obra.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
