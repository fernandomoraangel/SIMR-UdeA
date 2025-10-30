"use strict";

// Script para crear índices de búsqueda en MongoDB
const mongoose = require("../config/mongoose");

// Modelos disponibles para indexación
const models = {
  Obra: require("../app/models/obra.server.model"),
  Actor: require("../app/models/actor.server.model"),
  Recurso: require("../app/models/recurso.server.model"),
  Genero: require("../app/models/genero.server.model"),
  GeneroNoMusical: require("../app/models/generonomusical.server.model"),
  Materia: require("../app/models/materia.server.model"),
  Instrumento: require("../app/models/instrumento.server.model"),
  Proyecto: require("../app/models/proyecto.server.model"),
  Medio: require("../app/models/medio.server.model"),
  Sistema: require("../app/models/sistema.server.model"),
  Fondo: require("../app/models/fondo.server.model"),
  Coleccion: require("../app/models/coleccion.server.model"),
  Ejemplar: require("../app/models/ejemplar.server.model"),
  Idioma: require("../app/models/idioma.server.model"),
  Diccionario: require("../app/models/diccionario.server.model"),
  Archivo: require("../app/models/archivo.server.model"),
  Lista: require("../app/models/lista.server.model"),
};

// Campos de búsqueda por modelo para indexación
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

async function createSearchIndexes() {
  try {
    console.log("🚀 Iniciando creación de índices de búsqueda...");

    for (const [modelName, Model] of Object.entries(models)) {
      const fields = searchableFields[modelName];

      if (!fields || fields.length === 0) {
        console.log(`⚠️  Saltando ${modelName} - no hay campos configurados`);
        continue;
      }

      console.log(`📝 Creando índices para ${modelName}...`);

      // Crear índices de texto para cada campo
      const indexPromises = fields.map(async (field) => {
        try {
          const indexSpec = {};
          indexSpec[field] = "text";

          await Model.collection.createIndex(indexSpec, {
            name: `${modelName}_${field.replace(/\./g, "_")}_text_index`,
            background: true, // Crear en background para no bloquear
          });

          console.log(`✅ Índice creado: ${modelName}.${field}`);
        } catch (error) {
          console.warn(
            `⚠️  Error creando índice para ${modelName}.${field}:`,
            error.message
          );
        }
      });

      await Promise.all(indexPromises);

      // Crear índice compuesto de texto para todos los campos de búsqueda
      try {
        const compoundIndexSpec = {};
        fields.forEach((field) => {
          compoundIndexSpec[field] = "text";
        });

        await Model.collection.createIndex(compoundIndexSpec, {
          name: `${modelName}_compound_text_index`,
          background: true,
        });

        console.log(`✅ Índice compuesto creado para ${modelName}`);
      } catch (error) {
        console.warn(
          `⚠️  Error creando índice compuesto para ${modelName}:`,
          error.message
        );
      }
    }

    console.log("🎉 ¡Índices de búsqueda creados exitosamente!");
    console.log("\n💡 Sugerencias de uso:");
    console.log(
      "- Los índices de texto permiten búsquedas eficientes con $text operator"
    );
    console.log("- Para búsquedas exactas, usa expresiones regulares");
    console.log(
      "- Los índices se crearon en background para no afectar el rendimiento"
    );
  } catch (error) {
    console.error("❌ Error creando índices de búsqueda:", error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSearchIndexes();
}

module.exports = { createSearchIndexes };
