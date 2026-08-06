"use strict";

const mongoose = require("mongoose");
const { logAudit } = require("../services/audit.service");

const MODEL_NAMES = [
  "Obra",
  "Actor",
  "Recurso",
  "Instrumento",
  "Sistema",
  "Medio",
  "Genero",
  "GeneroNoMusical",
  "Materia",
  "Fondo",
  "Coleccion",
  "Proyecto",
  "Idioma",
  "Ejemplar",
  "SupportTicket",
  "Lista",
  "Role",
  "User",
  "Diccionario"
];

exports.searchDb = async (req, res) => {
  try {
    const { term } = req.body;
    if (!term || typeof term !== "string" || !term.trim()) {
      return res.status(400).send({ message: "El término de búsqueda es obligatorio" });
    }

    const searchTerm = term.trim();
    const regex = new RegExp(searchTerm, "i");
    const results = [];

    for (const modelName of MODEL_NAMES) {
      if (!mongoose.models[modelName]) continue;
      const Model = mongoose.model(modelName);
      
      const schemaPaths = Model.schema.paths;
      const stringFields = [];
      for (const path in schemaPaths) {
        if (schemaPaths[path].instance === "String") {
          stringFields.push(path);
        }
      }

      if (stringFields.length === 0) continue;

      const $or = stringFields.map((field) => ({ [field]: regex }));
      const docs = await Model.find({ $or }).limit(100).lean();

      for (const doc of docs) {
        for (const field of stringFields) {
          const val = doc[field];
          if (typeof val === "string" && regex.test(val)) {
            results.push({
              modelName,
              documentId: doc._id.toString(),
              title: doc.titulo || doc.nombre || doc.subject || doc.nombre_lista || doc.username || doc.campo || doc._id.toString(),
              fieldPath: field,
              currentValue: val,
            });
          }
        }
      }
    }

    res.json({ success: true, data: results });
    await logAudit(req, "db_search", "db_utils", null, "Busqueda en BD");
  } catch (err) {
    console.error("[db-search error]", err);
    res.status(400).send({ message: err.message || "Error al buscar en la base de datos" });
  }
};

exports.replaceDb = async (req, res) => {
  try {
    const { items, searchTerm, replaceTerm } = req.body;
    if (!items || !Array.isArray(items) || searchTerm === undefined || replaceTerm === undefined) {
      return res.status(400).send({ message: "Parámetros inválidos" });
    }

    let modifiedCount = 0;
    const grouped = {};
    for (const item of items) {
      const { modelName, documentId, fieldPath } = item;
      if (!modelName || !documentId || !fieldPath) continue;
      if (!grouped[modelName]) grouped[modelName] = {};
      if (!grouped[modelName][documentId]) grouped[modelName][documentId] = [];
      grouped[modelName][documentId].push(fieldPath);
    }

    for (const modelName of Object.keys(grouped)) {
      if (!mongoose.models[modelName]) continue;
      const Model = mongoose.model(modelName);

      for (const documentId of Object.keys(grouped[modelName])) {
        const fields = grouped[modelName][documentId];
        const doc = await Model.findById(documentId);
        if (!doc) continue;

        let changed = false;
        for (const field of fields) {
          const val = doc.get(field);
          if (typeof val === "string" && val.includes(searchTerm)) {
            doc.set(field, val.replaceAll(searchTerm, replaceTerm));
            changed = true;
          }
        }

        if (changed) {
          await doc.save();
          modifiedCount++;
        }
      }
    }

    res.json({ success: true, modifiedCount });
    await logAudit(req, "db_replace", "db_utils", null, "Reemplazo en BD");
  } catch (err) {
    console.error("[db-replace error]", err);
    res.status(400).send({ message: err.message || "Error al reemplazar en la base de datos" });
  }
};
