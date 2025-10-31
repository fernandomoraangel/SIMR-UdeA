"use strict";

// Servicio de búsqueda general para el sistema SIMR
const mongoose = require("mongoose");

// Modelos disponibles para búsqueda
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

// Campos de búsqueda por modelo (campos de texto principales)
const searchableFields = {
  Obra: [
    "titulo",
    "descripcion",
    "denominacionRegional.denominacionRegional",
    "descriptores.etiqueta",
    "descriptores.contenido",
  ],
  Actor: [
    "nombres",
    "apellidos",
    "nombreReunion",
    "descriptores.etiqueta",
    "descriptores.contenido",
  ],
  Recurso: [
    "titulo",
    "descripcion",
    "numeroNormalizado.nombre",
    "numeroNormalizado.numero",
    "descriptorLibre.etiqueta",
    "descriptorLibre.contenido",
  ],
  Genero: [
    "nombre",
    "alias.nombre",
    "descripcion",
    "descriptorLibre.etiqueta",
    "descriptorLibre.contenido",
  ],
  GeneroNoMusical: [
    "nombre",
    "alias.nombre",
    "descripcion",
    "descriptorLibre.etiqueta",
    "descriptorLibre.contenido",
  ],
  Materia: ["nombre", "descripcion"],
  Instrumento: ["nombre", "descripcion"],
  Proyecto: ["titulo", "descripcion"],
  Medio: ["nombre", "descripcion"],
  Sistema: ["nombre", "descripcion"],
  Fondo: ["titulo", "descripcion"],
  Coleccion: ["titulo", "descripcion"],
  Ejemplar: ["titulo", "descripcion"],
  Idioma: ["nombre", "descripcion"],
  Diccionario: ["titulo", "descripcion"],
  Archivo: ["titulo", "descripcion"],
  Lista: ["titulo", "descripcion"],
};

// Parser de consultas booleanas simple
class BooleanQueryParser {
  constructor() {
    this.operators = ["AND", "OR", "NOT", "(", ")"];
  }

  // Tokeniza la consulta
  tokenize(query) {
    const tokens = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < query.length; i++) {
      const char = query[i];

      if (char === '"' && (i === 0 || query[i - 1] !== "\\")) {
        inQuotes = !inQuotes;
        current += char;
      } else if (inQuotes) {
        current += char;
      } else if (char === " " || char === "\t" || char === "\n") {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else if (
        this.operators.includes(char) ||
        char === "(" ||
        char === ")"
      ) {
        if (current) {
          tokens.push(current);
          current = "";
        }
        tokens.push(char);
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  // Convierte tokens a expresión MongoDB
  parseToMongoQuery(tokens, exact = false) {
    const stack = [];
    const output = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        if (stack.length > 0 && stack[stack.length - 1] === "(") {
          stack.pop();
        }
      } else if (this.operators.includes(token)) {
        while (
          stack.length > 0 &&
          this.getPrecedence(stack[stack.length - 1]) >=
            this.getPrecedence(token)
        ) {
          output.push(stack.pop());
        }
        stack.push(token);
      } else {
        // Término de búsqueda
        output.push(this.createSearchTerm(token, exact));
      }
    }

    while (stack.length > 0) {
      output.push(stack.pop());
    }

    return this.evaluateRPN(output);
  }

  getPrecedence(operator) {
    switch (operator) {
      case "NOT":
        return 3;
      case "AND":
        return 2;
      case "OR":
        return 1;
      default:
        return 0;
    }
  }

  createSearchTerm(term, exact) {
    // Remover comillas si existen
    const cleanTerm = term.replace(/^"|"$/g, "");

    if (exact) {
      return { $eq: cleanTerm };
    } else {
      return { $regex: cleanTerm, $options: "i" };
    }
  }

  evaluateRPN(tokens) {
    const stack = [];

    for (const token of tokens) {
      if (typeof token === "object") {
        // Es un término de búsqueda
        stack.push(token);
      } else if (token === "NOT") {
        const operand = stack.pop();
        stack.push({ $nor: [operand] });
      } else if (token === "AND") {
        const right = stack.pop();
        const left = stack.pop();
        stack.push({ $and: [left, right] });
      } else if (token === "OR") {
        const right = stack.pop();
        const left = stack.pop();
        stack.push({ $or: [left, right] });
      }
    }

    return stack.length > 0 ? stack[0] : {};
  }
}

// Servicio principal de búsqueda
class SearchService {
  constructor() {
    this.parser = new BooleanQueryParser();
  }

  // Método principal de búsqueda

  async search(query, options = {}) {
    const {
      entities = Object.keys(models), // Todas las entidades por defecto
      fields = null, // Campos específicos o null para todos
      exact = false, // Búsqueda exacta o inexacta
      limit = 50,
      skip = 0,
      sort = { _searchScore: -1 },
    } = options;

    // Asegurar que entities sea iterable y filtrar solo entidades válidas
    let searchEntities = Array.isArray(entities)
      ? entities
      : entities
      ? [entities]
      : Object.keys(models);
    // Filtrar entidades inválidas
    searchEntities = searchEntities.filter((e) => models[e]);

    // DEBUG: Log entities and fields
    console.log("[SEARCH DEBUG] Entities to search:", searchEntities);
    if (fields) {
      console.log("[SEARCH DEBUG] Custom fields:", fields);
    }

    try {
      // Parsear la consulta booleana
      const tokens = this.parser.tokenize(query);
      const mongoQuery = this.parser.parseToMongoQuery(tokens, exact);

      if (!mongoQuery || Object.keys(mongoQuery).length === 0) {
        return {
          success: false,
          message: "Consulta inválida",
          results: [],
          total: 0,
        };
      }

      // Calcular el total real de resultados ANTES de paginar
      let totalResults = 0;
      let entityTotals = [];
      for (const entityName of searchEntities) {
        if (!models[entityName]) continue;
        const Model = models[entityName];
        const entityFields = fields || searchableFields[entityName] || [];
        if (entityFields.length === 0) continue;
        const entityQuery = this.buildEntityQuery(mongoQuery, entityFields);
        let entityTotal = await Model.countDocuments(entityQuery);
        entityTotals.push({
          entityName,
          entityTotal,
          entityQuery,
          entityFields,
        });
        totalResults += entityTotal;
      }

      // Ahora aplicar paginación global sobre el conjunto combinado
      let allResults = [];
      let remaining = limit;
      let currentSkip = skip;
      for (const {
        entityName,
        entityTotal,
        entityQuery,
        entityFields,
      } of entityTotals) {
        if (entityTotal === 0) continue;
        if (currentSkip >= entityTotal) {
          currentSkip -= entityTotal;
          continue;
        }
        let entityLimit = Math.min(remaining, entityTotal - currentSkip);
        const Model = models[entityName];
        const entityResults = await Model.find(entityQuery)
          .sort(sort)
          .skip(currentSkip)
          .limit(entityLimit)
          .populate("creador", "firstName lastName fullName")
          .exec();
        entityResults.forEach((result) => {
          let plain =
            typeof result.toObject === "function"
              ? result.toObject()
              : { ...result };
          plain._entityType = entityName;
          plain._searchScore = this.calculateBasicScore(
            plain,
            query,
            entityFields
          );
          allResults.push(plain);
        });
        remaining -= entityResults.length;
        currentSkip = 0;
        if (remaining <= 0) break;
      }
      // Ordenar los resultados de la página por score
      allResults.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
      return {
        success: true,
        query: query,
        results: allResults,
        total: totalResults,
        entities: searchEntities,
        exact: exact,
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        success: false,
        message: error.message,
        results: [],
        total: 0,
      };
    }
  }

  // Construir consulta específica para una entidad
  buildEntityQuery(mongoQuery, fields) {
    const orConditions = [];

    // Para cada campo searchable, crear condición OR
    for (const field of fields) {
      const fieldQuery = {};

      // Manejar campos anidados (con punto)
      if (field.includes(".")) {
        // Para campos anidados en arrays, necesitamos usar $elemMatch
        const parts = field.split(".");
        if (parts.length === 2) {
          // Ejemplo: descriptores.etiqueta -> { descriptores: { $elemMatch: { etiqueta: mongoQuery } } }
          fieldQuery[parts[0]] = { $elemMatch: { [parts[1]]: mongoQuery } };
        } else {
          this.setNestedField(fieldQuery, field, mongoQuery);
        }
      } else {
        fieldQuery[field] = mongoQuery;
      }

      orConditions.push(fieldQuery);
    }

    return orConditions.length > 1
      ? { $or: orConditions }
      : orConditions[0] || {};
  }

  // Establecer valor en campo anidado
  setNestedField(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  // Calcular score básico para resultados
  calculateBasicScore(document, query, fields) {
    let score = 0;
    const searchTerm = query.toLowerCase();

    // Verificar cada campo searchable
    for (const field of fields) {
      try {
        const value = this.getNestedValue(document, field);
        if (value && typeof value === "string") {
          const fieldValue = value.toLowerCase();
          if (fieldValue.includes(searchTerm)) {
            score += 1;
            // Bonus por coincidencia exacta
            if (fieldValue === searchTerm) {
              score += 2;
            }
          }
        }
      } catch (error) {
        // Ignorar errores en campos individuales
      }
    }

    return score;
  }

  // Obtener valor de campo anidado
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      if (Array.isArray(current)) {
        // Si es un array, buscar en todos los elementos
        return current
          .map((item) => item && item[key])
          .filter(Boolean)
          .join(" ");
      }
      return current && current[key];
    }, obj);
  }

  // Obtener lista de entidades disponibles
  getAvailableEntities() {
    return Object.keys(models);
  }

  // Obtener campos searchables de una entidad
  getSearchableFields(entity) {
    return searchableFields[entity] || [];
  }

  // Validar consulta
  validateQuery(query) {
    try {
      const tokens = this.parser.tokenize(query);
      return tokens.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new SearchService();
