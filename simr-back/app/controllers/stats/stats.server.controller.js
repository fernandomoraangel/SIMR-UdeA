"use strict";

const mongoose = require("mongoose");
const searchService = require("../../services/search.service");

const ENTITIES = [
  { name: "Obra", label: "Obras" },
  { name: "Actor", label: "Actores" },
  { name: "Recurso", label: "Recursos" },
  { name: "Genero", label: "Géneros" },
  { name: "GeneroNoMusical", label: "Géneros no musicales" },
  { name: "Materia", label: "Materias" },
  { name: "Instrumento", label: "Instrumentos" },
  { name: "Proyecto", label: "Proyectos" },
  { name: "Medio", label: "Medios" },
  { name: "Sistema", label: "Sistemas" },
  { name: "Fondo", label: "Fondos" },
  { name: "Coleccion", label: "Colecciones" },
  { name: "Ejemplar", label: "Ejemplares" },
  { name: "Idioma", label: "Idiomas" },
  { name: "Diccionario", label: "Diccionarios" },
  { name: "User", label: "Usuarios" },
];

const ANALYZABLE_FIELDS = {
  Obra: [
    "titulo", "descripcion", "tipo",
    "generosFormas", "materias", "mediosSonoros", "sistemasSonoros",
    "idiomas", "actores", "proyectos",
    "vinculosRelacionados", "archivosAdjuntos", "descriptores",
    "denominacionRegional",
  ],
  Actor: [
    "nombres", "apellidos", "nombreReunion", "contenedor",
    "descriptores", "vinculoRelacionado", "archivosAdjuntos",
  ],
  Recurso: [
    "titulo", "descripcion", "faceta",
    "numeroNormalizado", "mencionResponsabilidad", "fuente",
    "tiposDeRecurso", "materia", "idiomas", "descripcionTecnica",
    "materialAcompanante", "mencionDeSerie", "proyectos",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
  ],
  Genero: [
    "nombre", "alias", "descripcion", "idioma",
    "sistemasSonoros", "mediosSonoros", "proyectosAsociados",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
    "generosRelacionados",
  ],
  GeneroNoMusical: [
    "nombre", "alias", "descripcion", "idioma",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
    "generosRelacionados",
  ],
  Materia: [
    "nombre", "alias", "descripcion",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
    "materiasRelacionadas",
  ],
  Instrumento: [
    "nombre", "clasificacion", "alias",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
    "proyectosAsociados",
  ],
  Proyecto: [
    "nombre", "estado", "investigadores", "fechasAsociadas",
    "descriptoresLibres", "vinculoRelacionado", "archivosAdjuntos",
  ],
  Medio: [
    "nombre", "alias", "instrumentos",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
    "proyectosAsociados",
  ],
  Sistema: [
    "nombre", "descripcion", "alias", "sistemasRelacionados",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
    "proyectosAsociados",
  ],
  Fondo: [
    "nombre", "tipo", "propiedadComodato", "fechaDeCreacion", "precision",
  ],
  Coleccion: [
    "nombre", "tipo", "propiedadComodato", "fechaDeCreacion", "precision",
  ],
  Ejemplar: [
    "recurso", "numeroEjemplar", "disponibilidad", "fondo", "coleccion",
    "procedencia", "estados",
  ],
  Idioma: [
    "idioma", "glottocode", "isoCode", "endonym", "exonymSpanish",
    "linguisticFamily", "transmissionMode", "territorialContext",
    "descriptorLibre", "vinculoRelacionado", "archivosAdjuntos",
  ],
  Diccionario: [
    "tabla", "campo", "campoLargo", "definicion",
  ],
  User: [
    "username", "email", "firstName", "lastName",
  ],
};

function isEntitySelected(entities, name) {
  if (!entities) return true;
  const selected = entities.split(",").map((e) => e.trim().toLowerCase());
  return selected.includes(name.toLowerCase());
}

async function getEntityCount(Model, filter) {
  try {
    return await Model.countDocuments(filter || {});
  } catch {
    return 0;
  }
}

async function getFieldStats(Model, fields, filter) {
  const stats = {};
  const match = filter || {};

  const pipeline = [];
  pipeline.push({ $match: match });
  pipeline.push({ $project: buildFieldProjection(fields) });

  const results = await Model.aggregate(pipeline);

  if (results.length === 0) {
    for (const f of fields) stats[f] = { filled: 0, null: 0, pct: 0 };
    return stats;
  }

  const doc = results[0];
  for (const f of fields) {
    const filled = doc[f]?.filled ?? 0;
    const empty = doc[f]?.empty ?? 0;
    const total = filled + empty;
    stats[f] = {
      filled,
      null: empty,
      pct: total > 0 ? Math.round((filled / total) * 100) : 0,
    };
  }
  return stats;
}

function buildFieldProjection(fields) {
  const project = {};
  for (const f of fields) {
    project[f] = {
      $cond: [
        {
          $and: [
            { $ne: [{ $type: `$${f}` }, "missing"] },
            { $ne: [`$${f}`, null] },
            { $ne: [`$${f}`, ""] },
            { $ne: [{ $ifNull: [{ $size: { $ifNull: [`$${f}`, []] } }, -1] }, 0] },
          ],
        },
        { filled: 1, empty: 0 },
        { filled: 0, empty: 1 },
      ],
    };
  }
  return project;
}

function isStringField(fieldName) {
  const stringFieldNames = [
    "titulo", "descripcion", "nombre", "tipo", "faceta", "estado",
    "clasificacion", "propiedadComodato", "precision",
    "numeroEjemplar", "disponibilidad", "procedencia",
    "idioma", "glottocode", "isoCode", "endonym", "exonymSpanish",
    "linguisticFamily", "transmissionMode", "territorialContext",
    "tabla", "campo", "campoLargo", "definicion",
    "username", "email", "firstName", "lastName",
    "nombres", "apellidos", "nombreReunion",
    "materialAcompanante", "mencionDeSerie",
  ];
  return stringFieldNames.includes(fieldName);
}

async function getSearchStats(Model, fields, term) {
  const fieldResults = {};
  let totalMatches = 0;

  for (const f of fields) {
    if (!isStringField(f)) continue;

    let filter = {};
    filter[f] = { $regex: term, $options: "i" };

    try {
      const count = await Model.countDocuments(filter);
      fieldResults[f] = count;
      totalMatches += count;
    } catch {
      fieldResults[f] = 0;
    }
  }

  return { matches: totalMatches, fields: fieldResults };
}

async function getFieldStatsForModel(modelName, label, entitiesParam) {
  const Model = mongoose.model(modelName);
  const fields = ANALYZABLE_FIELDS[modelName];
  if (!fields) return [];

  const total = await getEntityCount(Model, {});

  const result = {
    key: modelName.toLowerCase(),
    label,
    total,
    fields: {},
  };

  for (const f of fields) {
    const isArray = [
      "generosFormas", "materias", "mediosSonoros", "sistemasSonoros",
      "idiomas", "actores", "proyectos", "contenedor",
      "numeroNormalizado", "mencionResponsabilidad", "fuente",
      "tiposDeRecurso", "descripcionTecnica", "alias",
      "instrumentos", "sistemasRelacionados", "investigadores",
      "fechasAsociadas", "estados", "archivosAdjuntos",
      "descriptores", "descriptorLibre", "vinculoRelacionado",
      "descriptoresLibres", "vinculosRelacionados",
      "generosRelacionados", "materiasRelacionadas",
      "generoRelacionado", "denominacionRegional",
    ].includes(f);

    const pipeline = [];

    if (isArray) {
      pipeline.push({
        $addFields: {
          _filled: {
            $cond: [
              { $and: [
                { $ne: [{ $type: `$${f}` }, "missing"] },
                { $ne: [`$${f}`, null] },
                { $gt: [{ $size: { $ifNull: [`$${f}`, []] } }, 0] },
              ]},
              1, 0,
            ],
          },
        },
      });
    } else {
      pipeline.push({
        $addFields: {
          _filled: {
            $cond: [
              { $and: [
                { $ne: [{ $type: `$${f}` }, "missing"] },
                { $ne: [`$${f}`, null] },
                { $ne: [`$${f}`, ""] },
              ]},
              1, 0,
            ],
          },
        },
      });
    }

    pipeline.push({
      $group: { _id: null, filled: { $sum: "$_filled" }, total: { $sum: 1 } },
    });

    try {
      const agg = await Model.aggregate(pipeline);
      const row = agg[0] || { filled: 0, total: 0 };
      result.fields[f] = {
        filled: row.filled,
        null: row.total - row.filled,
        pct: row.total > 0 ? Math.round((row.filled / row.total) * 100) : 0,
      };
    } catch {
      result.fields[f] = { filled: 0, null: total, pct: 0 };
    }
  }

  return result;
}

async function getSearchStatsForModel(modelName, term) {
  const fields = ANALYZABLE_FIELDS[modelName];
  if (!fields) return null;

  const textFields = fields.filter(isStringField);
  if (textFields.length === 0) return null;

  const Model = mongoose.model(modelName);
  const total = await getEntityCount(Model, {});
  const fieldCounts = {};
  let totalMatches = 0;

  for (const f of textFields) {
    try {
      const count = await Model.countDocuments({ [f]: { $regex: term, $options: "i" } });
      fieldCounts[f] = count;
      totalMatches += count;
    } catch {
      fieldCounts[f] = 0;
    }
  }

  return {
    total,
    matches: totalMatches,
    pct: total > 0 ? Math.round((totalMatches / total) * 100) : 0,
    fields: fieldCounts,
  };
}

exports.getAll = async (req, res) => {
  try {
    const { entities, fields: showFields, search } = req.query;
    const selectedModels = entities ? entities.split(",").map((e) => e.trim().toLowerCase()) : null;

    const models = ENTITIES.filter(
      (m) => !selectedModels || selectedModels.includes(m.name.toLowerCase())
    );

    const entityCounts = await Promise.all(
      models.map(async (m) => {
        try {
          const Model = mongoose.model(m.name);
          const count = await Model.countDocuments({});
          return { key: m.name.toLowerCase(), label: m.label, count };
        } catch {
          return { key: m.name.toLowerCase(), label: m.label, count: 0 };
        }
      })
    );

    const result = { entityCounts };

    if (showFields === "true" && models.length > 0) {
      result.fieldStats = {};
      for (const m of models) {
        const stats = await getFieldStatsForModel(m.name, m.label, entities);
        result.fieldStats[m.name.toLowerCase()] = stats;
      }
    }

    if (search) {
      result.searchStats = {};
      for (const m of models) {
        const s = await getSearchStatsForModel(m.name, search);
        if (s) result.searchStats[m.name.toLowerCase()] = { ...s, label: m.label };
      }
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
