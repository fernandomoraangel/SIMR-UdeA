"use strict";

// Controlador para el módulo de grafo de base de datos
const graphService = require("../services/graph.service");

// Método para manejar errores
const getErrorMessage = (err) => {
  let message = "";
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = "Error en la consulta del grafo";
        break;
      default:
        message = "Se ha producido un error al generar el grafo";
    }
  } else {
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }
  return message || err.message || "Error desconocido";
};

// Obtener datos del grafo
exports.getGraphData = async (req, res) => {
  try {
    const { entities, query, limit = 100 } = req.query;

    // Parsear entidades (si se especifican)
    let searchEntities = null;
    if (entities) {
      searchEntities = Array.isArray(entities)
        ? entities
        : entities.split(",").map((e) => e.trim());
    }

    // Parsear límite
    const limitNum = Math.min(parseInt(limit) || 100, 500); // Máximo 500 nodos

    const options = {
      entities: searchEntities,
      query: query || null,
      limit: limitNum,
    };

    const graphData = await graphService.getGraphData(options);

    res.json({
      success: true,
      data: graphData,
    });
  } catch (err) {
    console.error("Error obteniendo datos del grafo:", err);
    res.status(500).json({
      success: false,
      message: getErrorMessage(err),
      data: null,
    });
  }
};

// Obtener metadatos del grafo
exports.getGraphMetadata = async (req, res) => {
  try {
    const metadata = await graphService.getGraphMetadata();

    res.json({
      success: true,
      metadata: metadata,
    });
  } catch (err) {
    console.error("Error obteniendo metadatos del grafo:", err);
    res.status(500).json({
      success: false,
      message: getErrorMessage(err),
      metadata: null,
    });
  }
};

// Obtener estadísticas del grafo
exports.getGraphStats = async (req, res) => {
  try {
    const stats = await graphService.getGraphStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas del grafo:", err);
    res.status(500).json({
      success: false,
      message: getErrorMessage(err),
      stats: null,
    });
  }
};
