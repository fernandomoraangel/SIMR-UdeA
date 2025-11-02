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
  Proyecto: ["nombre", "estado", "descriptoresLibres.contenido"],
  Medio: ["nombre", "descripcion"],
  Sistema: ["nombre", "descripcion"],
  Fondo: ["nombre", "tipo", "propiedadComodato"],
  Coleccion: ["nombre", "tipo", "propiedadComodato"],
  Ejemplar: ["numeroEjemplar", "procedencia"],
  Idioma: ["idioma"],
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
      // Búsqueda aproximada: generar patrón regex tolerante a errores
      const fuzzyPattern = this.createFuzzyPattern(cleanTerm);
      return { $regex: fuzzyPattern, $options: "i" };
    }
  }

  // Crear patrón regex para búsqueda aproximada (fuzzy)
  createFuzzyPattern(term) {
    // Para términos muy cortos (< 3 caracteres), usar búsqueda normal
    if (term.length < 3) {
      return this.escapeRegex(term);
    }

    // Construir patrón flexible con sustituciones comunes
    return this.createFlexiblePattern(term);
  }

  // Crear patrón flexible permitiendo errores tipográficos comunes
  createFlexiblePattern(term) {
    // Variaciones comunes de caracteres por errores tipográficos
    const commonSubs = {
      b: "[bv]",
      v: "[bv]",
      c: "[ckq]",
      k: "[ckq]",
      q: "[ckq]",
      s: "[sz]",
      z: "[sz]",
      i: "[ieíí]",
      y: "[iy]",
      e: "[ei]",
      o: "[ou]",
      u: "[ou]",
      h: "h?", // h opcional
      n: "[nñ]",
      ñ: "[nñ]",
    };

    // Construir patrón con sustituciones comunes
    let flexPattern = "";
    for (let i = 0; i < term.length; i++) {
      const char = term[i].toLowerCase();

      if (commonSubs[char]) {
        flexPattern += commonSubs[char];
      } else {
        // Para otros caracteres, usar tal cual (escapado)
        flexPattern += this.escapeRegex(char);
      }
    }

    return flexPattern;
  }

  // Escapar caracteres especiales de regex
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      entities = Object.keys(models),
      fields = null,
      exact = false,
      limit = 50,
      skip = 0,
      sort = { _searchScore: -1 },
    } = options;

    let searchEntities = Array.isArray(entities)
      ? entities
      : entities
      ? [entities]
      : Object.keys(models);
    searchEntities = searchEntities.filter((e) => models[e]);

    console.log("[SEARCH DEBUG] Entities to search:", searchEntities);
    if (fields) {
      console.log("[SEARCH DEBUG] Custom fields:", fields);
    }

    try {
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

      console.log(
        "[SEARCH DEBUG] Parsed query:",
        JSON.stringify(mongoQuery, null, 2)
      );

      let totalResults = 0;
      let entityTotals = [];
      for (const entityName of searchEntities) {
        if (!models[entityName]) continue;
        const Model = models[entityName];
        const entityFields = fields || searchableFields[entityName] || [];
        if (entityFields.length === 0) continue;
        const entityQuery = this.buildEntityQuery(mongoQuery, entityFields);
        console.log(
          `[SEARCH DEBUG] ${entityName} query:`,
          JSON.stringify(entityQuery, null, 2)
        );
        let entityTotal = await Model.countDocuments(entityQuery);
        entityTotals.push({
          entityName,
          entityTotal,
          entityQuery,
          entityFields,
        });
        totalResults += entityTotal;
      }

      let allResults = [];
      let remaining = limit;
      let currentSkip = skip;
      // Diccionario de campos a aplanar por entidad
      const flattenMap = {
        Obra: [
          "contenedores",
          "asientoLigado",
          "generosFormas",
          "GenerosFormasNoMusicales",
          "materias",
          "mediosSonoros",
          "sistemasSonoros",
          "idiomas",
          "actores",
          "proyectos",
        ],
        Recurso: ["obrasRelacionadas", "proyectos", "materia", "idiomas"],
        Genero: [
          "padres",
          "hijos",
          "idioma",
          "sistemasSonoros",
          "mediosSonoros",
          "proyectosAsociados",
        ],
        GeneroNoMusical: ["padres", "hijos", "idioma"],
        Materia: ["padres", "hijos"],
        Instrumento: ["proyectosAsociados"],
        Proyecto: ["investigadores"],
        Medio: ["instrumentos", "proyectosAsociados"],
        Sistema: ["padres", "hijos", "proyectosAsociados"],
        Ejemplar: ["estados"],
      };
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
        let queryExec = Model.find(entityQuery)
          .sort(sort)
          .skip(currentSkip)
          .limit(entityLimit);

        // Populate campos referenciados según el tipo de entidad (si es necesario)
        queryExec = this.addPopulateForEntity(queryExec, entityName);

        const entityResults = await queryExec.exec();
        entityResults.forEach((result) => {
          let plain =
            typeof result.toObject === "function"
              ? result.toObject()
              : { ...result };
          // Aplanar arrays de subdocumentos con campo id poblado
          const flattenFields = flattenMap[entityName] || [];
          for (const field of flattenFields) {
            if (
              Array.isArray(plain[field]) &&
              plain[field].length > 0 &&
              plain[field][0] &&
              typeof plain[field][0] === "object" &&
              "id" in plain[field][0]
            ) {
              // Si el id está poblado, reemplazar el array por el array de ids poblados
              plain[field] = plain[field].map((item) =>
                item.id && typeof item.id === "object" ? item.id : item
              );
            }
          }
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
    // Si mongoQuery es una expresión booleana, expandirla para cada campo
    if (this.isBooleanExpression(mongoQuery)) {
      return this.expandBooleanForFields(mongoQuery, fields);
    }

    // Para términos simples, crear condición OR entre todos los campos
    const orConditions = [];

    for (const field of fields) {
      const fieldCondition = this.applyConditionToField(field, mongoQuery);
      if (fieldCondition) {
        orConditions.push(fieldCondition);
      }
    }

    return orConditions.length > 1
      ? { $or: orConditions }
      : orConditions[0] || {};
  }

  // Verificar si mongoQuery es una expresión booleana
  isBooleanExpression(query) {
    if (!query || typeof query !== "object") return false;
    const keys = Object.keys(query);
    return keys.some((key) => ["$and", "$or", "$nor"].includes(key));
  }

  // Expandir expresión booleana para múltiples campos
  expandBooleanForFields(mongoQuery, fields) {
    const operator = Object.keys(mongoQuery).find((k) =>
      ["$and", "$or", "$nor"].includes(k)
    );

    if (!operator) {
      // No es una expresión booleana válida
      return this.buildEntityQuery(mongoQuery, fields);
    }

    const conditions = mongoQuery[operator];

    if (!Array.isArray(conditions) || conditions.length === 0) {
      return {};
    }

    // Para cada término en la expresión booleana, crear un OR de todos los campos
    const expandedConditions = conditions.map((condition) => {
      if (this.isBooleanExpression(condition)) {
        // Recursivo para expresiones anidadas
        return this.expandBooleanForFields(condition, fields);
      } else {
        // Crear OR de todos los campos para este término
        return this.createFieldsOrCondition(condition, fields);
      }
    });

    return { [operator]: expandedConditions };
  }

  // Crear condición OR para un término en todos los campos
  createFieldsOrCondition(condition, fields) {
    const orConditions = [];

    for (const field of fields) {
      const fieldCondition = this.applyConditionToField(field, condition);
      if (fieldCondition) {
        orConditions.push(fieldCondition);
      }
    }

    return orConditions.length > 1
      ? { $or: orConditions }
      : orConditions[0] || {};
  }

  // Aplicar una condición simple a un campo específico
  applyConditionToField(field, condition) {
    const fieldQuery = {};

    // Manejar campos anidados (con punto)
    if (field.includes(".")) {
      const parts = field.split(".");
      if (parts.length === 2) {
        // Para arrays con subdocumentos
        fieldQuery[parts[0]] = { $elemMatch: { [parts[1]]: condition } };
      } else {
        this.setNestedField(fieldQuery, field, condition);
      }
    } else {
      fieldQuery[field] = condition;
    }

    return fieldQuery;
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

  // Agregar populates específicos según el tipo de entidad
  addPopulateForEntity(query, entityName) {
    // Diccionario de campos a poblar por entidad (solo rutas válidas y existentes)
    const populateMap = {
      Obra: [
        { path: "contenedores.id", model: "Obra" },
        { path: "asientoLigado.id", model: "Obra" },
        { path: "asientoLigado.proyectoRelacionado", model: "Proyecto" },
        { path: "generosFormas.id", model: "Genero" },
        { path: "GenerosFormasNoMusicales.id", model: "GeneroNoMusical" },
        { path: "materias.id", model: "Materia" },
        { path: "mediosSonoros.id", model: "Medio" },
        { path: "sistemasSonoros.id", model: "Sistema" },
        { path: "idiomas.id", model: "Idioma" },
        { path: "actores.id", model: "Actor" },
        { path: "proyectos.id", model: "Proyecto" },
        { path: "creador", model: "User" },
      ],
      Actor: [{ path: "creador", model: "User" }],
      Recurso: [
        { path: "obrasRelacionadas.id", model: "Obra" },
        { path: "proyectos.id", model: "Proyecto" },
        { path: "materia.id", model: "Materia" },
        { path: "idiomas.id", model: "Idioma" },
        { path: "creador", model: "User" },
      ],
      Genero: [
        { path: "padres.id", model: "Genero" },
        { path: "hijos.id", model: "Genero" },
        { path: "idioma.id", model: "Idioma" },
        { path: "sistemasSonoros.id", model: "Sistema" },
        { path: "mediosSonoros.id", model: "Medio" },
        { path: "proyectosAsociados.proyecto", model: "Proyecto" },
        { path: "creador", model: "User" },
      ],
      GeneroNoMusical: [
        { path: "padres.id", model: "GeneroNoMusical" },
        { path: "hijos.id", model: "GeneroNoMusical" },
        { path: "idioma.id", model: "Idioma" },
        { path: "creador", model: "User" },
      ],
      Materia: [
        { path: "padres.id", model: "Materia" },
        { path: "hijos.id", model: "Materia" },
        { path: "creador", model: "User" },
      ],
      Instrumento: [
        { path: "proyectosAsociados.proyecto", model: "Proyecto" },
        { path: "creador", model: "User" },
      ],
      Proyecto: [
        { path: "investigadores.id", model: "Actor" },
        { path: "creador", model: "User" },
      ],
      Medio: [
        { path: "instrumentos.instrumento", model: "Instrumento" },
        { path: "proyectosAsociados.proyecto", model: "Proyecto" },
        { path: "creador", model: "User" },
      ],
      Sistema: [
        { path: "padres.id", model: "Sistema" },
        { path: "hijos.id", model: "Sistema" },
        { path: "proyectosAsociados.proyecto", model: "Proyecto" },
        { path: "creador", model: "User" },
      ],
      Fondo: [{ path: "creador", model: "User" }],
      Coleccion: [{ path: "creador", model: "User" }],
      Ejemplar: [
        { path: "recurso", model: "Recurso" },
        { path: "fondo", model: "Fondo" },
        { path: "coleccion", model: "Coleccion" },
        { path: "creador", model: "User" },
      ],
      Idioma: [{ path: "creador", model: "User" }],
      Diccionario: [{ path: "creador", model: "User" }],
      Archivo: [{ path: "creador", model: "User" }],
      Lista: [{ path: "usuario_modifico", model: "User" }],
      User: [{ path: "roles", model: "Role" }],
    };

    const populates = populateMap[entityName] || [];
    let populatedQuery = query;
    for (const pop of populates) {
      try {
        populatedQuery = populatedQuery.populate(pop);
      } catch (err) {
        // Si hay error de populate, ignorar ese path
        console.warn(
          `[SEARCH DEBUG] Error al poblar '${pop.path}':`,
          err.message
        );
      }
    }
    return populatedQuery;
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
