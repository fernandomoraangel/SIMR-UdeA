"use strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Recurso = mongoose.model("Recurso");

// Método para el manejo de errores
const getErrorMessage = (err) => {
  // Definir variable de error message
  let message = "";

  // Si ocurre un error interno de MongoDB
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "El registro ya existe";
        break;
      // si un error general ocurre
      default:
        message = "Se ha producido un error";
    }
  } else {
    // Grabar el error en una lista de posibles errores
    for (let errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  // Devolver el mensaje de error
  return message;
};

// Método para crear las recursos
exports.create = async (req, res) => {
  const recurso = new Recurso(req.body);
  // Configurar la propiedad 'creador'
  recurso.creador = req.user;
  if (recurso.descriptorLibre == "") {
    delete recurso.descriptorLibre;
  }

  try {
    // Intentar salvar la recurso
    await recurso.save();
    // Enviar una representación JSON de la recurso
    res.json(recurso);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de recursos
exports.list = async (req, res) => {
  try {
    // console.log("Buscando recursos...")
    // Usa el método model 'find' para obtener una lista de recursos
    const recursos = await Recurso.find()
      .sort("-created")
      .populate("creador", "firstName lastName fullName")
      .exec();
    res.json(recursos);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una recurso existente
exports.read = (req, res) => {
  res.json(req.recurso);
};

// Método para actualizar una recurso existente
exports.update = async (req, res) => {
  // Obtiene la recurso usando el objeto 'request'
  const recurso = req.recurso;

  // Actualiza los campos
  recurso.titulo = req.body.titulo;
  recurso.obrasRelacionadas = req.body.obrasRelacionadas;
  recurso.numeroNormalizado = req.body.numeroNormalizado;
  recurso.faceta = req.body.faceta;
  recurso.mencionResponsabilidad = req.body.mencionResponsabilidad;
  recurso.descripcion = req.body.descripcion;
  recurso.contenedores = req.body.contenedores;
  recurso.fuente = req.body.fuente;
  recurso.tiposDeRecurso = req.body.tiposDeRecurso;
  recurso.anotacionCartograficoTemporal = req.body.anotacionCartograficoTemporal;
  recurso.materia = req.body.materia;
  recurso.idiomas = req.body.idiomas;
  recurso.descripcionTecnica = req.body.descripcionTecnica;
  recurso.materialAcompanante = req.body.materialAcompanante;
  recurso.mencionDeSerie = req.body.mencionDeSerie;
  recurso.proyectos = req.body.proyectos;
  recurso.vinculoRelacionado = req.body.vinculoRelacionado;
  recurso.descriptorLibre = req.body.descriptorLibre;
  recurso.archivosAdjuntos = req.body.archivosAdjuntos;

  // Intenta salvar
  try {
    await recurso.save();
    res.json(recurso);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener la recurso usando el objeto 'request'
  const recurso = req.recurso;

  try {
    // Usar el método model 'deleteOne' para borrar
    await recurso.deleteOne();
    res.json(recurso);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar una recurso existente
exports.recursoByID = async (req, res, next, id) => {
  try {
    const recurso = await Recurso.findById(id)
      .populate("creador", "firstName lastName fullName")
      .populate("mencionResponsabilidad.actor", "nombres apellidos")
      .exec();
    if (!recurso) return next(new Error("Fallo al cargar la recurso" + id));
    // Si la recurso es encontrada, usar el objeto 'request' para pasarla al sgte middleware
    req.recurso = recurso;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre recurso
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.recurso.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
