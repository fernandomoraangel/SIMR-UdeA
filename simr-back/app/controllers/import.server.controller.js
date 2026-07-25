"use strict";

const XLSX = require("xlsx");
const mongoose = require("mongoose");
const { logAudit } = require("../services/audit.service");

const ENTITY_SCHEMA = {
  Obra: {
    label: "Obra",
    fields: {
      titulo: { label: "Título", type: "string", main: true },
      denominacionRegional: { label: "Denominación Regional", type: "string" },
      tipo: { label: "Tipo", type: "string" },
      descripcion: { label: "Descripción", type: "text" },
      lugarDeCreacion: { label: "Lugar de Creación", type: "string" },
    },
  },
  Actor: {
    label: "Actor",
    fields: {
      nombres: { label: "Nombres", type: "string", main: true },
      apellidos: { label: "Apellidos", type: "string", main: true },
      nombreArtistico: { label: "Nombre Artístico", type: "string" },
      nombreReunion: { label: "Nombre de Reunión", type: "string" },
    },
  },
  Recurso: {
    label: "Recurso",
    fields: {
      titulo: { label: "Título", type: "string", main: true },
      numeroNormalizado: { label: "Número Normalizado", type: "string" },
      faceta: { label: "Faceta", type: "string" },
      descripcion: { label: "Descripción", type: "text" },
      fuente: { label: "Fuente", type: "string" },
    },
  },
  Instrumento: {
    label: "Instrumento",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      clasificacion: { label: "Clasificación HS", type: "string" },
      descripcion: { label: "Descripción", type: "text" },
    },
  },
  Sistema: {
    label: "Sistema Sonoro",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
    },
  },
  Medio: {
    label: "Medio Sonoro",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
    },
  },
  Genero: {
    label: "Género / Forma",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
    },
  },
  GeneroNoMusical: {
    label: "Género No Musical",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
    },
  },
  Materia: {
    label: "Materia",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
    },
  },
  Fondo: {
    label: "Fondo",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      tipo: { label: "Tipo", type: "string" },
      propiedadComodato: { label: "Propiedad/Comodato", type: "string" },
    },
  },
  Coleccion: {
    label: "Colección",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      tipo: { label: "Tipo", type: "string" },
      propiedadComodato: { label: "Propiedad/Comodato", type: "string" },
    },
  },
  Proyecto: {
    label: "Proyecto",
    fields: {
      nombre: { label: "Nombre", type: "string", main: true },
      descripcion: { label: "Descripción", type: "text" },
      estado: { label: "Estado", type: "string" },
    },
  },
  Idioma: {
    label: "Idioma",
    fields: {
      idioma: { label: "Idioma", type: "string", main: true },
      glottocode: { label: "Glottocode", type: "string" },
      isoCode: { label: "Código ISO", type: "string" },
      endonym: { label: "Endónimo", type: "string" },
      exonymSpanish: { label: "Exónimo (Español)", type: "string" },
      linguisticFamily: { label: "Familia Lingüística", type: "string" },
      transmissionMode: { label: "Modo de Transmisión", type: "string" },
      territorialContext: { label: "Contexto Territorial", type: "string" },
    },
  },
  Ejemplar: {
    label: "Ejemplar",
    fields: {
      numeroEjemplar: { label: "Número de Ejemplar", type: "string", main: true },
      disponibilidad: { label: "Disponibilidad", type: "string" },
      procedencia: { label: "Procedencia", type: "string" },
    },
  },
  Diccionario: {
    label: "Diccionario",
    fields: {
      tabla: { label: "Tabla", type: "string", main: true },
      campo: { label: "Campo", type: "string", main: true },
      campoLargo: { label: "Campo (Largo)", type: "text" },
      definicion: { label: "Definición", type: "text" },
    },
  },
};

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(columnName) {
  const norm = normalize(columnName);
  const results = [];
  for (const [entityName, entity] of Object.entries(ENTITY_SCHEMA)) {
    for (const [fieldName, field] of Object.entries(entity.fields)) {
      const fieldNorm = normalize(field.label);
      const keyNorm = normalize(fieldName);
      let score = 0;
      if (norm === fieldNorm || norm === keyNorm) score = 1;
      else if (norm.includes(fieldNorm) || fieldNorm.includes(norm)) score = 0.85;
      else {
        const normWords = norm.split(" ");
        const fieldWords = fieldNorm.split(" ");
        const overlap = normWords.filter((w) => fieldWords.includes(w)).length;
        if (overlap > 0) score = Math.min(0.5 + overlap * 0.15, 0.8);
      }
      if (score > 0) {
        results.push({ entity: entityName, field: fieldName, confidence: Math.round(score * 100) });
      }
    }
  }
  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, 3);
}

function getMainFields(entityName) {
  const entity = ENTITY_SCHEMA[entityName];
  if (!entity) return [];
  return Object.entries(entity.fields)
    .filter(([, f]) => f.main)
    .map(([k]) => k);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.preview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se ha proporcionado ningún archivo" });
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return res.status(400).json({ message: "El archivo Excel no contiene hojas" });
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (jsonData.length < 2) return res.status(400).json({ message: "El archivo debe contener al menos un encabezado y una fila de datos" });
    const columns = jsonData[0].map((c) => String(c).trim());
    const rows = jsonData.slice(1).filter((r) => r.some((cell) => String(cell).trim() !== ""));
    const previewRows = rows.slice(0, 5);
    const autoMap = columns.map((col, i) => {
      const suggestions = fuzzyMatch(col);
      return {
        columnIndex: i,
        columnName: col,
        suggestions,
        bestMatch: suggestions.length > 0 && suggestions[0].confidence >= 60 ? suggestions[0] : null,
      };
    });
    res.json({
      success: true,
      data: {
        columns,
        totalRows: rows.length,
        previewRows,
        autoMap,
        sheetName,
        entities: Object.entries(ENTITY_SCHEMA).map(([key, e]) => ({
          name: key,
          label: e.label,
          fields: Object.entries(e.fields).map(([fk, fv]) => ({
            name: fk,
            label: fv.label,
            type: fv.type,
            main: !!fv.main,
          })),
        })),
      },
    });
  } catch (err) {
    console.error("[import preview error]", err);
    res.status(400).json({ message: err.message || "Error al procesar el archivo" });
  }
};

exports.execute = async (req, res) => {
  try {
    const { columns, rows, mappings, actions } = req.body;
    if (!columns || !rows || !mappings || !actions) {
      return res.status(400).json({ message: "Faltan datos requeridos: columns, rows, mappings, actions" });
    }
    const results = [];
    let created = 0, updated = 0, skipped = 0, errors = 0;
    for (const action of actions) {
      const { rowIndex, rowAction, matchId } = action;
      const row = rows[rowIndex];
      if (!row) {
        results.push({ rowIndex, status: "error", message: "Fila no encontrada" });
        errors++;
        continue;
      }
      if (rowAction === "skip") {
        results.push({ rowIndex, status: "skipped", message: "Omitida por el usuario" });
        skipped++;
        continue;
      }
      const activeMappings = mappings.filter((m) => !m.ignore && m.entity && m.field);
      if (activeMappings.length === 0) {
        results.push({ rowIndex, status: "error", message: "No hay mapeos activos para esta fila" });
        errors++;
        continue;
      }
      const entityNames = [...new Set(activeMappings.map((m) => m.entity))];
      if (entityNames.length > 1) {
        results.push({ rowIndex, status: "error", message: `Múltiples entidades en una fila: ${entityNames.join(", ")}` });
        errors++;
        continue;
      }
      const entityName = entityNames[0];
      if (!mongoose.models[entityName]) {
        results.push({ rowIndex, status: "error", message: `Modelo no encontrado: ${entityName}` });
        errors++;
        continue;
      }
      const Model = mongoose.model(entityName);
      try {
        if (rowAction === "create") {
          const docData = { creador: req.user?._id };
          const descriptorData = [];
          for (const m of activeMappings) {
            const val = row[m.columnIndex];
            if (val == null || String(val).trim() === "") continue;
            if (m.asDescriptor) {
              descriptorData.push({ etiqueta: m.descriptorKey || m.columnName, contenido: String(val) });
            } else {
              docData[m.field] = String(val);
            }
          }
          if (docData.titulo != null && ENTITY_SCHEMA[entityName]?.fields?.nombre != null) {
            docData.nombre = docData.titulo;
          }
          if (descriptorData.length > 0) {
            docData.descriptorLibre = descriptorData;
            if (!docData.descriptorLibre) docData.descriptorLibre = [];
          }
          const doc = new Model(docData);
          const saved = await doc.save();
          const title = saved.titulo || saved.nombre || saved.idioma || saved.numeroEjemplar || saved._id;
          await logAudit(req, `${entityName.toLowerCase()}_created`, entityName.toLowerCase(), saved._id, String(title));
          results.push({ rowIndex, status: "success", message: `${ENTITY_SCHEMA[entityName]?.label || entityName} "${title}" creado`, docId: saved._id.toString() });
          created++;
        } else if (rowAction === "update" && matchId) {
          const existing = await Model.findById(matchId);
          if (!existing) {
            results.push({ rowIndex, status: "error", message: `Registro ${matchId} no encontrado para actualizar` });
            errors++;
            continue;
          }
          const descriptorData = existing.descriptorLibre ? [...existing.descriptorLibre] : [];
          for (const m of activeMappings) {
            const val = row[m.columnIndex];
            if (val == null || String(val).trim() === "") continue;
            if (m.asDescriptor) {
              descriptorData.push({ etiqueta: m.descriptorKey || m.columnName, contenido: String(val) });
            } else {
              existing[m.field] = String(val);
            }
          }
          if (descriptorData.length > (existing.descriptorLibre?.length || 0)) {
            existing.descriptorLibre = descriptorData;
          }
          const saved = await existing.save();
          const title = saved.titulo || saved.nombre || saved.idioma || saved.numeroEjemplar || saved._id;
          await logAudit(req, `${entityName.toLowerCase()}_updated`, entityName.toLowerCase(), saved._id, String(title));
          results.push({ rowIndex, status: "success", message: `${ENTITY_SCHEMA[entityName]?.label || entityName} "${title}" actualizado`, docId: saved._id.toString() });
          updated++;
        } else {
          results.push({ rowIndex, status: "skipped", message: "Acción no reconocida" });
          skipped++;
        }
      } catch (err) {
        results.push({ rowIndex, status: "error", message: err.message || "Error al procesar fila" });
        errors++;
      }
    }
    res.json({
      success: true,
      data: { results, summary: { created, updated, skipped, errors, total: results.length } },
    });
    await logAudit(req, "import_executed", "import", null, `Creados: ${created}, Actualizados: ${updated}, Omitidos: ${skipped}, Errores: ${errors}`);
  } catch (err) {
    console.error("[import execute error]", err);
    res.status(400).json({ message: err.message || "Error al ejecutar la importación" });
  }
};

exports.dedup = async (req, res) => {
  try {
    const { columns, rows, mappings } = req.body;
    if (!columns || !rows || !mappings) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }
    const validations = [];
    const activeMappings = mappings.filter((m) => !m.ignore && m.entity && m.field);
    const entityGroups = {};
    for (const m of activeMappings) {
      if (!entityGroups[m.entity]) entityGroups[m.entity] = [];
      entityGroups[m.entity].push(m);
    }
    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      let matchFound = false, matchId = null, matchTitle = null, matchConfidence = 0;
      for (const [entityName, emappings] of Object.entries(entityGroups)) {
        if (!mongoose.models[entityName]) continue;
        const Model = mongoose.model(entityName);
        const mainFields = getMainFields(entityName);
        const mainMappings = emappings.filter((m) => mainFields.includes(m.field));
        if (mainMappings.length === 0) continue;
        const queryConditions = [];
        for (const m of mainMappings) {
          const val = row[m.columnIndex];
          if (val != null && String(val).trim()) {
            queryConditions.push({ [m.field]: { $regex: new RegExp(`^${escapeRegex(String(val).trim())}$`, "i") } });
          }
        }
        if (queryConditions.length === 0) continue;
        const match = await Model.findOne({ $or: queryConditions }).lean().exec();
        if (match) {
          matchFound = true;
          matchId = match._id.toString();
          matchTitle = match.titulo || match.nombre || match.idioma || match.numeroEjemplar || match._id;
          matchConfidence = 90;
          break;
        }
      }
      validations.push({
        rowIndex: ri,
        data: row,
        matchFound,
        matchId,
        matchTitle: matchTitle ? String(matchTitle) : null,
        matchConfidence,
        suggestedAction: matchFound ? "update" : "create",
        selected: true,
      });
    }
    res.json({ success: true, data: validations });
  } catch (err) {
    console.error("[import dedup error]", err);
    res.status(400).json({ message: err.message || "Error al validar datos" });
  }
};
