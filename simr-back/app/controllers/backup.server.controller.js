"use strict";

const mongoose = require("mongoose");
const { logAudit } = require("../services/audit.service");

const ENTITY_NAMES = [
  "Obra", "Actor", "Recurso", "Instrumento", "Sistema", "Medio",
  "Genero", "GeneroNoMusical", "Materia", "Fondo", "Coleccion",
  "Proyecto", "Idioma", "Ejemplar", "Diccionario", "Lista",
  "SupportTicket", "NubeArchivo", "Role", "User",
];

exports.listEntities = async (req, res) => {
  try {
    const entities = [];
    for (const name of ENTITY_NAMES) {
      const model = mongoose.models[name];
      if (!model) continue;
      try {
        const count = await model.countDocuments();
        const collectionName = model.collection.name;
        const schemaPaths = Object.keys(model.schema.paths).filter(
          (p) => !p.startsWith("_") && p !== "__v"
        );
        entities.push({ name, collection: collectionName, count, fields: schemaPaths.length });
      } catch {
        entities.push({ name, collection: "?", count: 0, fields: 0 });
      }
    }
    res.json({ success: true, data: entities });
  } catch (err) {
    console.error("[backup list entities error]", err);
    res.status(500).json({ message: err.message });
  }
};

exports.exportBackup = async (req, res) => {
  try {
    const { entities } = req.body;
    if (!entities || !Array.isArray(entities) || entities.length === 0) {
      return res.status(400).json({ message: "Selecciona al menos una entidad" });
    }
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      exportedBy: req.user?.username || req.user?._id?.toString() || "unknown",
      counts: {},
      data: {},
    };
    for (const name of entities) {
      const model = mongoose.models[name];
      if (!model) {
        backup.data[name] = [];
        backup.counts[name] = 0;
        continue;
      }
      const docs = await model.find().lean();
      backup.data[name] = docs;
      backup.counts[name] = docs.length;
    }
    await logAudit(req, "backup_exported", "backup", null,
      `Entidades: ${entities.join(", ")}`);
    res.json({ success: true, data: backup });
  } catch (err) {
    console.error("[backup export error]", err);
    res.status(500).json({ message: err.message });
  }
};

exports.restorePreview = async (req, res) => {
  try {
    const { backup } = req.body;
    if (!backup || !backup.data || !backup.version) {
      return res.status(400).json({ message: "Archivo de respaldo inválido" });
    }
    const preview = [];
    for (const [name, docs] of Object.entries(backup.data)) {
      const model = mongoose.models[name];
      const currentCount = model ? await model.countDocuments() : 0;
      preview.push({
        name,
        incomingCount: Array.isArray(docs) ? docs.length : 0,
        currentCount,
        willDrop: currentCount > 0,
      });
    }
    res.json({ success: true, data: preview });
  } catch (err) {
    console.error("[backup restore preview error]", err);
    res.status(500).json({ message: err.message });
  }
};

exports.restoreBackup = async (req, res) => {
  try {
    const { backup, entities } = req.body;
    if (!backup || !backup.data || !entities || !Array.isArray(entities)) {
      return res.status(400).json({ message: "Datos de restauración inválidos" });
    }
    const results = [];
    for (const name of entities) {
      const docs = backup.data[name];
      if (!docs || !Array.isArray(docs)) {
        results.push({ name, status: "skipped", message: "Sin datos en el respaldo" });
        continue;
      }
      const model = mongoose.models[name];
      if (!model) {
        results.push({ name, status: "error", message: `Modelo ${name} no encontrado` });
        continue;
      }
      try {
        const prevCount = await model.countDocuments();
        if (prevCount > 0) {
          await model.collection.drop();
          await model.createCollection();
        }
        if (docs.length > 0) {
          await model.insertMany(docs, { ordered: false });
        }
        try { await model.syncIndexes(); } catch {}
        const newCount = await model.countDocuments();
        results.push({
          name,
          status: "success",
          message: `${prevCount} eliminados, ${newCount} insertados`,
          dropped: prevCount > 0,
          count: newCount,
        });
      } catch (err) {
        results.push({ name, status: "error", message: err.message });
      }
    }
    await logAudit(req, "backup_restored", "backup", null,
      `Entidades: ${entities.join(", ")}`);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("[backup restore error]", err);
    res.status(500).json({ message: err.message });
  }
};
