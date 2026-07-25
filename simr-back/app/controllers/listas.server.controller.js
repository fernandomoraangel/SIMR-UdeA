"use strict";

const Lista = require("mongoose").model("Lista");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelpers");

// Manejador de errores
const getErrorMessage = (err) => {
  let message = "";
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "La lista ya existe";
        break;
      default:
        message = "Se ha producido un error";
    }
  } else {
    for (let errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message;
};

//* LIST - Obtener todas las listas
exports.list = async (req, res, next) => {
  try {
    const listas = await Lista.find({})
      .populate("usuario_modifico", "username firstName lastName")
      .sort({ nombre_lista: 1 });

    // Para AngularJS $resource, devolver directamente el array
    res.json(listas);
  } catch (err) {
    console.error("Error al recuperar listas:", err);
    return next(err);
  }
};

//* READ BY NAME - Obtener elementos de una lista específica
exports.readByName = async (req, res, next) => {
  try {
    const { nombre_lista } = req.params;

    const lista = await Lista.findOne({ nombre_lista }).populate(
      "usuario_modifico",
      "username firstName lastName"
    );

    if (!lista) {
      return errorResponse(res, "Lista no encontrada", 404);
    }

    successResponse(res, "Lista recuperada exitosamente", 200, lista);
  } catch (err) {
    console.error("Error al recuperar lista:", err);
    return next(err);
  }
};

//* CREATE - Crear una nueva lista
exports.create = async (req, res, next) => {
  try {
    const listaData = {
      ...req.body,
      usuario_modifico: req.user._id,
    };

    const lista = new Lista(listaData);
    await lista.save();
    await logAudit(req, "lista_creada", "lista", lista._id, lista.nombre_lista);

    await lista.populate("usuario_modifico", "username firstName lastName");

    successResponse(res, "Lista creada exitosamente", 201, lista);
  } catch (err) {
    console.error("Error al crear lista:", err);
    errorResponse(res, getErrorMessage(err), 400, {
      error: err.message || "Error al crear lista",
    });
  }
};

//* UPDATE - Actualizar una lista
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      fecha_modificacion: new Date(),
      usuario_modifico: req.user._id,
    };

    const lista = await Lista.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("usuario_modifico", "username firstName lastName");

    if (!lista) {
      return errorResponse(res, "Lista no encontrada", 404);
    }

    successResponse(res, "Lista actualizada exitosamente", 200, lista);
  } catch (err) {
    console.error("Error al actualizar lista:", err);
    errorResponse(res, getErrorMessage(err), 400, {
      error: err.message || "Error al actualizar lista",
    });
  }
};

//* DELETE - Eliminar una lista
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lista = await Lista.findByIdAndDelete(id);

    if (!lista) {
      return errorResponse(res, "Lista no encontrada", 404);
    }

    successResponse(res, "Lista eliminada exitosamente", 200);
  } catch (err) {
    console.error("Error al eliminar lista:", err);
    errorResponse(res, "Error al eliminar lista", 500, {
      error: err.message || "Error interno del servidor",
    });
  }
};

//* ADD ELEMENT - Agregar un elemento a una lista existente
exports.addElement = async (req, res, next) => {
  try {
    const { nombre_lista } = req.params;
    const { elemento, metadata } = req.body;

    if (!elemento) {
      return errorResponse(res, "Elemento requerido", 400);
    }

    const lista = await Lista.findOne({ nombre_lista });

    if (!lista) {
      return errorResponse(res, "Lista no encontrada", 404);
    }

    // Verificar si el elemento ya existe
    if (lista.elementos.includes(elemento)) {
      return errorResponse(res, "El elemento ya existe en la lista", 400);
    }

    lista.elementos.push(elemento);

    // Si la lista tiene metadata y se proporciona metadata, agregarla
    if (metadata && (lista.metadata || nombre_lista === "nNormalizados")) {
      if (!lista.metadata) {
        lista.metadata = [];
      }
      lista.metadata.push(metadata);
    }

    lista.fecha_modificacion = new Date();
    lista.usuario_modifico = req.user._id;

    await lista.save();
    await logAudit(req, "lista_elemento_actualizado", "lista", lista._id, lista.nombre_lista);
    await lista.populate("usuario_modifico", "username firstName lastName");

    successResponse(res, "Elemento agregado exitosamente", 200, lista);
  } catch (err) {
    console.error("Error al agregar elemento:", err);
    errorResponse(res, "Error al agregar elemento", 500, {
      error: err.message || "Error interno del servidor",
    });
  }
};

//* UPDATE ELEMENT - Actualizar un elemento específico
exports.updateElement = async (req, res, next) => {
  try {
    const { lista_id, elemento_index } = req.params;
    const { elemento, metadata } = req.body;

    if (!elemento) {
      return errorResponse(res, "Elemento requerido", 400);
    }

    const lista = await Lista.findById(lista_id);

    if (!lista) {
      return errorResponse(res, "Lista no encontrada", 404);
    }

    const index = parseInt(elemento_index);
    if (isNaN(index) || index < 0 || index >= lista.elementos.length) {
      return errorResponse(res, "Índice de elemento inválido", 400);
    }

    lista.elementos[index] = elemento;

    // Si la lista tiene metadata y se proporciona metadata, actualizarla
    if (metadata && lista.metadata && lista.metadata[index]) {
      lista.metadata[index] = metadata;
    }

    lista.fecha_modificacion = new Date();
    lista.usuario_modifico = req.user._id;

    await lista.save();
    await logAudit(req, "lista_elemento_modificado", "lista", lista._id, lista.nombre_lista);
        await lista.populate("usuario_modifico", "username firstName lastName");

    successResponse(res, "Elemento actualizado exitosamente", 200, lista);
  } catch (err) {
    console.error("Error al actualizar elemento:", err);
    errorResponse(res, "Error al actualizar elemento", 500, {
      error: err.message || "Error interno del servidor",
    });
  }
};

//* DELETE ELEMENT - Eliminar un elemento específico
exports.deleteElement = async (req, res, next) => {
  try {
    const { lista_id, elemento_index } = req.params;

    const lista = await Lista.findById(lista_id);

    if (!lista) {
      return errorResponse(res, "Lista no encontrada", 404);
    }

    const index = parseInt(elemento_index);
    if (isNaN(index) || index < 0 || index >= lista.elementos.length) {
      return errorResponse(res, "Índice de elemento inválido", 400);
    }

    lista.elementos.splice(index, 1);

    // Si la lista tiene metadata, también eliminar el metadata correspondiente
    if (lista.metadata && lista.metadata[index]) {
      lista.metadata.splice(index, 1);
    }

    lista.fecha_modificacion = new Date();
    lista.usuario_modifico = req.user._id;

    await lista.save();
    await logAudit(req, "lista_elemento_modificado", "lista", lista._id, lista.nombre_lista);
        await lista.populate("usuario_modifico", "username firstName lastName");

    successResponse(res, "Elemento eliminado exitosamente", 200, lista);
  } catch (err) {
    console.error("Error al eliminar elemento:", err);
    errorResponse(res, "Error al eliminar elemento", 500, {
      error: err.message || "Error interno del servidor",
    });
  }
};

//* LISTA BY ID - Middleware para recuperar una lista por ID
exports.listaByID = async (req, res, next, id) => {
  try {
    const lista = await Lista.findById(id);
    if (!lista) {
      return next(new Error("Error al cargar lista " + id));
    }

    req.lista = lista;
    next();
  } catch (err) {
    return next(err);
  }
};
