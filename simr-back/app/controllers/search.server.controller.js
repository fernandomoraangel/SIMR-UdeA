"use strict";

// Controlador para el sistema de búsqueda general
const searchService = require("../services/search.service");

// Método para manejar errores
const getErrorMessage = (err) => {
  let message = "";
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "Error en la búsqueda";
        break;
      default:
        message = "Se ha producido un error en la búsqueda";
    }
  } else {
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message;
};

// Buscar en todas las entidades
exports.search = async (req, res) => {
  try {
    const {
      q: query,
      entities,
      fields,
      exact,
      limit = 50,
      skip = 0,
      sort,
    } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Se requiere un término de búsqueda (parámetro q)",
        results: [],
        total: 0,
      });
    }

    // Parsear entidades (si se especifican)
    let searchEntities = null;
    if (entities) {
      searchEntities = Array.isArray(entities) ? entities : entities.split(",");
      // Validar que las entidades existan
      const availableEntities = searchService.getAvailableEntities();
      searchEntities = searchEntities.filter((entity) =>
        availableEntities.includes(entity)
      );
    }

    // Parsear campos (si se especifican)
    let searchFields = null;
    if (fields) {
      searchFields = Array.isArray(fields) ? fields : fields.split(",");
    }

    // Parsear opciones booleanas
    const exactMatch = exact === "true" || exact === "1";

    // Parsear paginación
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Máximo 100 resultados
    const skipNum = parseInt(skip) || 0;

    // Parsear ordenamiento
    let sortOption = { _searchScore: -1 }; // Por defecto ordenar por relevancia
    if (sort) {
      try {
        sortOption = JSON.parse(sort);
      } catch (e) {
        // Si no es JSON válido, ignorar
      }
    }

    const options = {
      entities: searchEntities,
      fields: searchFields,
      exact: exactMatch,
      limit: limitNum,
      skip: skipNum,
      sort: sortOption,
    };

    const results = await searchService.search(query, options);

    res.json(results);
  } catch (err) {
    console.error("Search controller error:", err);
    res.status(500).json({
      success: false,
      message: getErrorMessage(err),
      results: [],
      total: 0,
    });
  }
};

// Buscar en entidad específica
exports.searchEntity = async (req, res) => {
  try {
    const { entity } = req.params;
    const { q: query, fields, exact, limit = 50, skip = 0, sort } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Se requiere un término de búsqueda (parámetro q)",
        results: [],
        total: 0,
      });
    }

    // Validar que la entidad existe
    const availableEntities = searchService.getAvailableEntities();
    if (!availableEntities.includes(entity)) {
      return res.status(400).json({
        success: false,
        message: `Entidad '${entity}' no encontrada. Entidades disponibles: ${availableEntities.join(
          ", "
        )}`,
        results: [],
        total: 0,
      });
    }

    // Parsear campos
    let searchFields = null;
    if (fields) {
      searchFields = Array.isArray(fields) ? fields : fields.split(",");
    }

    // Parsear opciones booleanas
    const exactMatch = exact === "true" || exact === "1";

    // Parsear paginación
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const skipNum = parseInt(skip) || 0;

    // Parsear ordenamiento
    let sortOption = { _searchScore: -1 };
    if (sort) {
      try {
        sortOption = JSON.parse(sort);
      } catch (e) {
        // Si no es JSON válido, ignorar
      }
    }

    const options = {
      entities: [entity],
      fields: searchFields,
      exact: exactMatch,
      limit: limitNum,
      skip: skipNum,
      sort: sortOption,
    };

    const results = await searchService.search(query, options);

    res.json(results);
  } catch (err) {
    console.error("Search entity controller error:", err);
    res.status(500).json({
      success: false,
      message: getErrorMessage(err),
      results: [],
      total: 0,
    });
  }
};

// Obtener metadatos de búsqueda
exports.getSearchMetadata = async (req, res) => {
  try {
    const availableEntities = searchService.getAvailableEntities();
    const metadata = {};

    // Obtener campos searchables para cada entidad
    for (const entity of availableEntities) {
      metadata[entity] = {
        searchableFields: searchService.getSearchableFields(entity),
      };
    }

    res.json({
      success: true,
      entities: availableEntities,
      metadata: metadata,
      operators: ["AND", "OR", "NOT", "(", ")"],
      examples: [
        "bachata",
        "bachata AND salsa",
        "bachata OR salsa",
        "NOT bachata",
        "(bachata OR salsa) AND colombia",
        '"bachata moderna"',
      ],
    });
  } catch (err) {
    console.error("Search metadata error:", err);
    res.status(500).json({
      success: false,
      message: getErrorMessage(err),
    });
  }
};

// Validar consulta de búsqueda
exports.validateQuery = async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query) {
      return res.json({
        valid: false,
        message: "Se requiere un término de búsqueda (parámetro q)",
      });
    }

    const isValid = searchService.validateQuery(query);

    res.json({
      valid: isValid,
      query: query,
      message: isValid ? "Consulta válida" : "Consulta inválida",
    });
  } catch (err) {
    console.error("Validate query error:", err);
    res.status(500).json({
      valid: false,
      message: getErrorMessage(err),
    });
  }
};
