"use strict";

/**
 * Servicio para mapear metadatos entre diferentes formatos
 * Soporta: SIMR nativo, MARC 21, Dublin Core
 */
angular.module("search").factory("MetadataMapper", [
  function () {
    // Mapeo de campos SIMR a MARC 21
    var marc21Mapping = {
      // Obras musicales
      titulo: { tag: "245", subfield: "a", label: "Título" },
      subtitulo: { tag: "245", subfield: "b", label: "Subtítulo" },
      nombreUniforme: { tag: "240", subfield: "a", label: "Título Uniforme" },
      fechaComposicion: { tag: "260", subfield: "c", label: "Fecha" },
      genero: { tag: "655", subfield: "a", label: "Género" },
      instrumentacion: { tag: "382", subfield: "a", label: "Instrumentación" },
      instrumentos: { tag: "382", subfield: "a", label: "Instrumentos" },
      duracion: { tag: "306", subfield: "a", label: "Duración" },
      tonalidad: { tag: "384", subfield: "a", label: "Tonalidad" },
      compas: { tag: "384", subfield: "b", label: "Compás" },
      actores: { tag: "700", subfield: "a", label: "Actores" },
      obras: { tag: "700", subfield: "t", label: "Obras" },
      materias: { tag: "650", subfield: "a", label: "Materias" },
      idiomas: { tag: "041", subfield: "a", label: "Idiomas" },

      // Actores (personas/organizaciones)
      nombres: { tag: "100", subfield: "a", label: "Nombre" },
      apellidos: { tag: "100", subfield: "a", label: "Apellido" },
      nombreReunion: { tag: "110", subfield: "a", label: "Nombre Corporativo" },
      fechaNacimiento: { tag: "100", subfield: "d", label: "Fecha Nacimiento" },
      fechaMuerte: { tag: "100", subfield: "d", label: "Fecha Muerte" },
      lugarNacimiento: { tag: "370", subfield: "a", label: "Lugar Nacimiento" },

      // Recursos
      tituloRecurso: { tag: "245", subfield: "a", label: "Título Recurso" },
      editorial: { tag: "260", subfield: "b", label: "Editorial" },
      lugarPublicacion: {
        tag: "260",
        subfield: "a",
        label: "Lugar Publicación",
      },
      fechaPublicacion: {
        tag: "260",
        subfield: "c",
        label: "Fecha Publicación",
      },
      isbn: { tag: "020", subfield: "a", label: "ISBN" },
      issn: { tag: "022", subfield: "a", label: "ISSN" },
      recurso: { tag: "245", subfield: "a", label: "Recurso" },

      // Campos generales
      notas: { tag: "500", subfield: "a", label: "Notas Generales" },
      descripcionFisica: {
        tag: "300",
        subfield: "a",
        label: "Descripción Física",
      },
      idioma: { tag: "041", subfield: "a", label: "Idioma" },
      materia: { tag: "650", subfield: "a", label: "Materia" },

      // Colecciones y Fondos
      nombreColeccion: { tag: "710", subfield: "a", label: "Colección" },
      nombreFondo: { tag: "773", subfield: "t", label: "Fondo" },
      fondo: { tag: "773", subfield: "t", label: "Fondo" },
      coleccion: { tag: "710", subfield: "a", label: "Colección" },
      medio: { tag: "340", subfield: "a", label: "Medio" },
      sistema: { tag: "340", subfield: "b", label: "Sistema" },
      proyecto: { tag: "710", subfield: "a", label: "Proyecto" },

      // Metadatos de sistema
      creado: { tag: "583", subfield: "c", label: "Fecha Creación" },
      modificado: { tag: "583", subfield: "c", label: "Fecha Modificación" },
    };

    // Mapeo de campos SIMR a Dublin Core
    var dublinCoreMapping = {
      // Obras musicales
      titulo: { element: "dc:title", label: "Título" },
      subtitulo: {
        element: "dc:title",
        qualifier: "alternative",
        label: "Subtítulo",
      },
      nombreUniforme: {
        element: "dc:title",
        qualifier: "alternative",
        label: "Título Uniforme",
      },
      fechaComposicion: {
        element: "dc:date",
        qualifier: "created",
        label: "Fecha Creación",
      },
      genero: { element: "dc:type", label: "Tipo" },
      instrumentacion: {
        element: "dc:format",
        qualifier: "medium",
        label: "Instrumentación",
      },
      instrumentos: {
        element: "dc:format",
        qualifier: "medium",
        label: "Instrumentos",
      },
      duracion: {
        element: "dc:format",
        qualifier: "extent",
        label: "Duración",
      },
      tonalidad: { element: "dc:subject", label: "Tonalidad" },
      actores: { element: "dc:contributor", label: "Actores" },
      obras: { element: "dc:relation", label: "Obras" },
      materias: { element: "dc:subject", label: "Materias" },
      idiomas: { element: "dc:language", label: "Idiomas" },

      // Actores
      nombres: { element: "dc:creator", label: "Creador" },
      apellidos: { element: "dc:creator", label: "Creador" },
      nombreReunion: { element: "dc:creator", label: "Creador Corporativo" },
      fechaNacimiento: {
        element: "dc:coverage",
        qualifier: "temporal",
        label: "Fecha Nacimiento",
      },
      lugarNacimiento: {
        element: "dc:coverage",
        qualifier: "spatial",
        label: "Lugar Nacimiento",
      },

      // Recursos
      tituloRecurso: { element: "dc:title", label: "Título" },
      editorial: { element: "dc:publisher", label: "Editorial" },
      lugarPublicacion: {
        element: "dc:coverage",
        qualifier: "spatial",
        label: "Lugar Publicación",
      },
      fechaPublicacion: {
        element: "dc:date",
        qualifier: "issued",
        label: "Fecha Publicación",
      },
      isbn: { element: "dc:identifier", qualifier: "isbn", label: "ISBN" },
      issn: { element: "dc:identifier", qualifier: "issn", label: "ISSN" },
      recurso: { element: "dc:relation", label: "Recurso" },

      // Campos generales
      notas: { element: "dc:description", label: "Descripción" },
      descripcionFisica: { element: "dc:format", label: "Formato" },
      idioma: { element: "dc:language", label: "Idioma" },
      materia: { element: "dc:subject", label: "Materia" },

      // Colecciones
      nombreColeccion: {
        element: "dc:relation",
        qualifier: "isPartOf",
        label: "Parte de",
      },
      nombreFondo: {
        element: "dc:relation",
        qualifier: "isPartOf",
        label: "Pertenece a",
      },
      fondo: { element: "dc:relation", qualifier: "isPartOf", label: "Fondo" },
      coleccion: {
        element: "dc:relation",
        qualifier: "isPartOf",
        label: "Colección",
      },
      medio: { element: "dc:format", label: "Medio" },
      sistema: { element: "dc:format", label: "Sistema" },
      proyecto: { element: "dc:relation", label: "Proyecto" },

      // Derechos
      derechos: { element: "dc:rights", label: "Derechos" },

      // Metadatos
      creado: {
        element: "dc:date",
        qualifier: "created",
        label: "Fecha Creación",
      },
      modificado: {
        element: "dc:date",
        qualifier: "modified",
        label: "Fecha Modificación",
      },
    };

    // Función auxiliar para extraer valor de un campo (puede ser primitivo, objeto o array)
    function extractValue(value) {
      if (value === null || value === undefined) {
        return "";
      }

      // Si es un array
      if (Array.isArray(value)) {
        return value
          .map(function (item) {
            return extractValue(item);
          })
          .filter(function (v) {
            return v !== "";
          })
          .join("; ");
      }

      // Si es un objeto (referencia poblada o no poblada)
      if (typeof value === "object") {
        // Intentar extraer el campo más relevante
        if (value.nombre) return value.nombre;
        if (value.titulo) return value.titulo;
        if (value.nombres && value.apellidos)
          return value.nombres + " " + value.apellidos;
        if (value.nombreReunion) return value.nombreReunion;
        if (value.idioma) return value.idioma;
        if (value.numeroEjemplar) return value.numeroEjemplar;
        if (value.actor) return extractValue(value.actor);
        if (value.obra) return extractValue(value.obra);
        if (value.instrumento) return extractValue(value.instrumento);
        if (value.recurso) return extractValue(value.recurso);

        // Si tiene un _id pero no los campos anteriores, intentar mostrar el primer campo útil
        if (value._id) {
          // Buscar el primer campo que no sea _id, __v, etc.
          const usefulFields = [
            "titulo",
            "nombre",
            "nombres",
            "descripcion",
            "numero",
            "idioma",
          ];
          for (const field of usefulFields) {
            if (
              value[field] &&
              typeof value[field] === "string" &&
              value[field].trim()
            ) {
              return value[field];
            }
          }
          // Si no hay campos útiles, intentar poblar desde el cliente
          // Por ahora mostrar el ID sin prefijo
          return value._id.toString();
        }

        return "";
      }

      // Primitivo: string, number, boolean
      return String(value);
    }

    // Función para mapear a MARC 21
    function mapToMARC21(result) {
      var mapped = [];
      var exclude = [
        "_id",
        "__v",
        "_entityType",
        "_searchScore",
        "$hashKey",
        "$$hashKey",
        "creador",
      ];

      for (var key in result) {
        if (
          exclude.indexOf(key) === -1 &&
          result[key] !== undefined &&
          result[key] !== null
        ) {
          var value = extractValue(result[key]);

          // Saltar si el valor está vacío después de la extracción
          if (value === "" || value.trim() === "") {
            continue;
          }

          var mapping = marc21Mapping[key];
          if (mapping) {
            mapped.push({
              tag: mapping.tag,
              subfield: mapping.subfield,
              label: mapping.label,
              value: value,
            });
          } else if (!/id$/i.test(key)) {
            // Campo no mapeado, usar etiqueta genérica (excepto campos que terminan en ID)
            mapped.push({
              tag: "590",
              subfield: "a",
              label: key,
              value: value,
            });
          }
        }
      }

      return mapped;
    }

    // Función para poblar referencias desde el cliente
    function populateReferences(result) {
      // Recopilar todos los IDs de referencias que necesitan ser poblados
      var referenceIds = {};

      // Función recursiva para buscar referencias
      function collectReferences(obj, path) {
        if (obj && typeof obj === "object") {
          if (Array.isArray(obj)) {
            obj.forEach(function (item, index) {
              collectReferences(item, path + "[" + index + "]");
            });
          } else {
            for (var key in obj) {
              if (obj[key] && typeof obj[key] === "object" && obj[key]._id) {
                // Es una referencia no poblada
                var refType = getReferenceType(key, obj[key]);
                if (refType) {
                  if (!referenceIds[refType]) {
                    referenceIds[refType] = [];
                  }
                  referenceIds[refType].push(obj[key]._id);
                }
              }
              collectReferences(obj[key], path + "." + key);
            }
          }
        }
      }

      collectReferences(result, "");
      return referenceIds;
    }

    // Determinar el tipo de referencia basado en el campo y contenido
    function getReferenceType(fieldName, refObj) {
      // Mapeo de campos a tipos de entidades
      var fieldToEntityMap = {
        generosFormas: "Genero",
        GenerosFormasNoMusicales: "GeneroNoMusical",
        materias: "Materia",
        mediosSonoros: "Medio",
        sistemasSonoros: "Sistema",
        idiomas: "Idioma",
        actores: "Actor",
        proyectos: "Proyecto",
        genero: "Genero",
        materia: "Materia",
        medio: "Medio",
        sistema: "Sistema",
        idioma: "Idioma",
        actor: "Actor",
        proyecto: "Proyecto",
        recurso: "Recurso",
        numeroNormalizado: "NumeroNormalizado",
        alias: "Genero",
        elementos: "Lista",
      };

      return fieldToEntityMap[fieldName] || null;
    }

    // Función para mapear a Dublin Core
    function mapToDublinCore(result) {
      var mapped = [];
      var exclude = [
        "_id",
        "__v",
        "_entityType",
        "_searchScore",
        "$hashKey",
        "$$hashKey",
        "creador",
      ];

      for (var key in result) {
        if (
          exclude.indexOf(key) === -1 &&
          result[key] !== undefined &&
          result[key] !== null
        ) {
          var value = extractValue(result[key]);

          // Saltar si el valor está vacío después de la extracción
          if (value === "" || value.trim() === "") {
            continue;
          }

          var mapping = dublinCoreMapping[key];
          if (mapping) {
            var element = mapping.element;
            if (mapping.qualifier) {
              element += ":" + mapping.qualifier;
            }
            mapped.push({
              element: element,
              label: mapping.label,
              value: value,
            });
          } else if (!/id$/i.test(key)) {
            // Campo no mapeado, usar dc:description (excepto campos que terminan en ID)
            mapped.push({
              element: "dc:description",
              label: key,
              value: value,
            });
          }
        }
      }

      return mapped;
    }

    // Función para formato SIMR nativo (tal como está)
    function mapToSIMR(result) {
      var mapped = [];
      var exclude = [
        "_id",
        "__v",
        "_entityType",
        "_searchScore",
        "$hashKey",
        "$$hashKey",
        "creado",
        "modificado",
        "creador",
      ];

      for (var key in result) {
        if (
          exclude.indexOf(key) === -1 &&
          result[key] !== undefined &&
          result[key] !== null &&
          !/id$/i.test(key)
        ) {
          var value = extractValue(result[key]);

          // Saltar si el valor está vacío o es objeto complejo
          if (value !== "" && value.trim() !== "") {
            mapped.push({
              field: key,
              value: value,
            });
          }
        }
      }

      return mapped;
    }

    // API pública del servicio
    return {
      toMARC21: mapToMARC21,
      toDublinCore: mapToDublinCore,
      toSIMR: mapToSIMR,
      populateReferences: populateReferences,
      getReferenceType: getReferenceType,

      // Obtener lista de formatos disponibles
      getAvailableFormats: function () {
        return [
          { value: "simr", label: "SIMR (Nativo)" },
          { value: "marc21", label: "MARC 21" },
          { value: "dublincore", label: "Dublin Core" },
        ];
      },
    };
  },
]);
