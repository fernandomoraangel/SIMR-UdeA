"use strict";

// Servicio para generar datos del grafo de base de datos
const mongoose = require("mongoose");

// Importar todos los modelos
const models = {
  Obra: mongoose.model("Obra"),
  Actor: mongoose.model("Actor"),
  Recurso: mongoose.model("Recurso"),
  Genero: mongoose.model("Genero"),
  GeneroNoMusical: mongoose.model("GeneroNoMusical"),
  Materia: mongoose.model("Materia"),
  Instrumento: mongoose.model("Instrumento"),
  Proyecto: mongoose.model("Proyecto"),
  Medio: mongoose.model("Medio"),
  Sistema: mongoose.model("Sistema"),
  Fondo: mongoose.model("Fondo"),
  Coleccion: mongoose.model("Coleccion"),
  Ejemplar: mongoose.model("Ejemplar"),
  Idioma: mongoose.model("Idioma"),
  Diccionario: mongoose.model("Diccionario"),
  Archivo: mongoose.model("Archivo"),
  Lista: mongoose.model("Lista"),
};

// Mapa de relaciones por modelo (campos que referencian otros modelos)
const relationshipMap = {
  Obra: {
    actores: { target: "Actor", field: "actores.id" },
    materias: { target: "Materia", field: "materias.id" },
    mediosSonoros: { target: "Medio", field: "mediosSonoros.id" },
    sistemasSonoros: { target: "Sistema", field: "sistemasSonoros.id" },
    idiomas: { target: "Idioma", field: "idiomas.id" },
    generosFormas: { target: "Genero", field: "generosFormas.id" },
    GenerosFormasNoMusicales: {
      target: "GeneroNoMusical",
      field: "GenerosFormasNoMusicales.id",
    },
    proyectos: { target: "Proyecto", field: "proyectos.id" },
    contenedores: { target: "Obra", field: "contenedores.id" },
    asientoLigado: { target: "Obra", field: "asientoLigado.id" },
  },
  Recurso: {
    obrasRelacionadas: { target: "Obra", field: "obrasRelacionadas.id" },
    materia: { target: "Materia", field: "materia.id" },
    idiomas: { target: "Idioma", field: "idiomas.id" },
    proyectos: { target: "Proyecto", field: "proyectos.id" },
    contenedores: { target: "Recurso", field: "contenedores.id" },
  },
  Actor: {
    contenedor: { target: "Actor", field: "contenedor.id" },
  },
  Ejemplar: {
    recurso: { target: "Recurso", field: "recurso" },
    fondo: { target: "Fondo", field: "fondo" },
    coleccion: { target: "Coleccion", field: "coleccion" },
  },
  Proyecto: {},
  Fondo: {},
  Coleccion: {},
  Genero: {},
  GeneroNoMusical: {},
  Materia: {},
  Instrumento: {},
  Medio: {},
  Sistema: {},
  Idioma: {},
  Diccionario: {},
  Archivo: {},
  Lista: {},
};

// Paleta de colores para los nodos (D3 category colors)
const nodeColors = {
  Obra: "#1f77b4", // azul
  Actor: "#ff7f0e", // naranja
  Recurso: "#2ca02c", // verde
  Genero: "#d62728", // rojo
  GeneroNoMusical: "#9467bd", // púrpura
  Materia: "#8c564b", // marrón
  Instrumento: "#e377c2", // rosa
  Proyecto: "#7f7f7f", // gris
  Medio: "#bcbd22", // amarillo verdoso
  Sistema: "#17becf", // cian
  Fondo: "#ff9896", // rosa claro
  Coleccion: "#c5b0d5", // lavanda
  Ejemplar: "#c49c94", // marrón claro
  Idioma: "#f7b6d2", // rosa pálido
  Diccionario: "#c7c7c7", // gris claro
  Archivo: "#dbdb8d", // amarillo pálido
  Lista: "#9edae5", // azul pálido
};

class GraphService {
  // Obtener datos del grafo con filtros opcionales
  async getGraphData(options = {}) {
    const {
      entities = Object.keys(models),
      query = null,
      limit = 100,
    } = options;

    try {
      const nodes = [];
      const links = [];
      const nodeMap = new Map(); // Para evitar duplicados

      // Filtrar entidades válidas
      const validEntities = entities.filter((e) => models[e]);

      // Si hay query de búsqueda, usar el servicio de búsqueda
      let searchResults = null;
      if (query) {
        const searchService = require("./search.service");
        const results = await searchService.search(query, {
          entities: validEntities,
          limit: limit * 2, // Obtener más para asegurar suficientes nodos
        });
        searchResults = results.results;
      }

      // Recopilar nodos de las entidades seleccionadas
      for (const entityName of validEntities) {
        const Model = models[entityName];
        let items;

        if (searchResults) {
          // Usar resultados de búsqueda filtrados por entidad
          items = searchResults.filter((r) => r._entityType === entityName);
        } else {
          // Obtener muestra aleatoria de la base de datos
          const totalCount = await Model.countDocuments();
          const skip = Math.max(
            0,
            Math.floor(Math.random() * (totalCount - limit))
          );
          items = await Model.find()
            .limit(limit / validEntities.length)
            .skip(skip)
            .lean();
        }

        // Agregar nodos
        for (const item of items) {
          const nodeId = `${entityName}_${item._id}`;
          if (!nodeMap.has(nodeId)) {
            nodeMap.set(nodeId, {
              id: nodeId,
              entityId: item._id.toString(),
              entityType: entityName,
              label: this.getNodeLabel(item, entityName),
              color: nodeColors[entityName] || "#999",
              data: item,
            });
            nodes.push(nodeMap.get(nodeId));
          }
        }
      }

      // Recopilar enlaces basados en relaciones
      for (const node of nodes) {
        const entityName = node.entityType;
        const relationships = relationshipMap[entityName] || {};

        for (const [relName, relInfo] of Object.entries(relationships)) {
          const relData = this.getNestedValue(node.data, relInfo.field);

          if (relData) {
            // Manejar arrays de relaciones
            const ids = Array.isArray(relData)
              ? relData.map((item) => (item._id || item).toString())
              : [(relData._id || relData).toString()];

            for (const targetId of ids) {
              const targetNodeId = `${relInfo.target}_${targetId}`;
              if (nodeMap.has(targetNodeId)) {
                links.push({
                  source: node.id,
                  target: targetNodeId,
                  type: relName,
                });
              }
            }
          }
        }
      }

      return {
        nodes: nodes.slice(0, limit), // Limitar nodos finales
        links,
        metadata: {
          totalNodes: nodes.length,
          totalLinks: links.length,
          entityTypes: validEntities,
          colors: nodeColors,
        },
      };
    } catch (error) {
      console.error("Error generando datos del grafo:", error);
      throw error;
    }
  }

  // Obtener metadatos del grafo
  async getGraphMetadata() {
    try {
      const metadata = {
        availableEntities: Object.keys(models),
        colors: nodeColors,
        relationships: relationshipMap,
        totalCounts: {},
      };

      // Obtener conteos totales
      for (const [entityName, Model] of Object.entries(models)) {
        metadata.totalCounts[entityName] = await Model.countDocuments();
      }

      return metadata;
    } catch (error) {
      console.error("Error obteniendo metadatos del grafo:", error);
      throw error;
    }
  }

  // Obtener estadísticas del grafo
  async getGraphStats() {
    try {
      const stats = {
        entities: {},
        totalEntities: 0,
        totalRelationships: 0,
      };

      for (const [entityName, Model] of Object.entries(models)) {
        const count = await Model.countDocuments();
        stats.entities[entityName] = count;
        stats.totalEntities += count;
      }

      return stats;
    } catch (error) {
      console.error("Error obteniendo estadísticas del grafo:", error);
      throw error;
    }
  }

  // Obtener etiqueta del nodo
  getNodeLabel(item, entityType) {
    switch (entityType) {
      case "Obra":
        return item.titulo || "Sin título";
      case "Actor":
        return (
          `${item.nombres || ""} ${item.apellidos || ""}`.trim() || "Sin nombre"
        );
      case "Recurso":
        return item.titulo || "Sin título";
      case "Genero":
      case "GeneroNoMusical":
      case "Materia":
      case "Instrumento":
      case "Medio":
      case "Sistema":
      case "Proyecto":
      case "Fondo":
      case "Coleccion":
        return item.nombre || "Sin nombre";
      case "Ejemplar":
        return item.numeroEjemplar || `Ejemplar ${item._id}`;
      case "Idioma":
        return item.idioma || "Sin nombre";
      case "Diccionario":
      case "Archivo":
      case "Lista":
        return item.titulo || item.nombre || "Sin título";
      default:
        return item.nombre || item.titulo || `${entityType} ${item._id}`;
    }
  }

  // Obtener valor anidado de un objeto
  getNestedValue(obj, path) {
    if (!path) return null;
    return path.split(".").reduce((current, key) => {
      if (Array.isArray(current)) {
        return current.map((item) => item && item[key]).filter(Boolean);
      }
      return current && current[key];
    }, obj);
  }
}

module.exports = new GraphService();
