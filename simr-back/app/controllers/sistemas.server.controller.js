"use Strict";

// Cargar dependencias
const mongoose = require("mongoose");
const Sistema = mongoose.model("Sistema");


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
  const sistema = new Sistema(req.body);
  // Configurar la propiedad 'creador'
  sistema.creador = req.user;

  try {
    await sistema.save();
    // Enviar una representación JSON de la sistema
    res.json(sistema);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que recupera una lista de sistemas
exports.list = async (req, res) => {
  try {
    // Usa el método model 'find' para obtener una lista de recursos
    const sistemas = await Sistema.find()
      .sort("-created")
      .populate("creador", "nombre")
      .exec();
    res.json(sistemas);
  } catch (err) {
    return res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método que devuelve una sistema existente
exports.read = (req, res) => {
  res.json(req.sistema);
};

// Método para actualizar una sistema existente
exports.update = async (req, res) => {
  // Obtiene la sistema usando el objeto 'request'
  const sistema = req.sistema;

  // Actualiza los campos
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

  try {
    // Intenta salvar
    await sistema.save();
    res.json(sistema);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Método para borrar
exports.delete = async (req, res) => {
  // Obtener la sistema usando el objeto 'request'
  const sistema = req.sistema;
  try {
    // Usar el método model 'deleteOne' para borrar
    await sistema.deleteOne();
    res.json(sistema);
  } catch (err) {
    res.status(400).send({
      message: getErrorMessage(err),
    });
  }
};

// Controller middleware para recuperar una sistema existente
exports.sistemaByID = async (req, res, next, id) => {
  try {
    const sistema = await Sistema.findById(id)
      .populate("creador", "firstName lastName fullName")
      .exec();
    if (!sistema) return next(new Error("Fallo al cargar la sistema" + id));
    // Si el sistema es encontrado, usar el objeto 'request' para pasarlo al sgte middleware
    req.sistema = sistema;
    // Llamar al sgte middleware
    next();
  } catch (err) {
    next(err);
  }
};

// Controller middleware para autorizar una operación sobre sistema
exports.hasAuthorization = (req, res, next) => {
  // Si el usuario actual, no es el creador, enviar el mensaje de error
  if (req.sistema.creador.id !== req.user.id) {
    return res.status(403).send({
      message: "Usuario no autorizado",
    });
  }
  // Llamar sgte middleware
  next();
};
