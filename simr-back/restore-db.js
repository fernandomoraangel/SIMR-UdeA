// Script para restaurar la base de datos desde backup JSON
// Ejecutar con: node restore-db.js

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function restoreDatabase() {
  console.log("🔄 Iniciando restauración de base de datos...");

  try {
    // Cargar configuración
    const config = require("./config/config");

    // Si MONGO_URI usa el hostname 'mongodb', reemplazar por localhost para ejecución desde host
    let mongoUri = config.db;
    if (mongoUri.includes("mongodb:27017")) {
      mongoUri = mongoUri.replace("mongodb:27017", "localhost:27017");
      console.log("🔧 Usando localhost:27017 para conexión desde host");
    }

    // Usar MongoClient directamente para limpiar índices
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    console.log("✅ Conectado a MongoDB (MongoClient)");

    const db = mongoClient.db();

    // Conectar con Mongoose para modelos
    console.log("🔌 Conectando a MongoDB (Mongoose)...");
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB (Mongoose)");

    // Cargar modelos explícitamente
    require("./app/models/user.server.model");
    require("./app/models/actor.server.model");
    require("./app/models/obra.server.model");
    require("./app/models/recurso.server.model");
    require("./app/models/genero.server.model");
    require("./app/models/generonomusical.server.model");
    require("./app/models/materia.server.model");
    require("./app/models/instrumento.server.model");
    require("./app/models/proyecto.server.model");
    require("./app/models/medio.server.model");
    require("./app/models/sistema.server.model");
    require("./app/models/fondo.server.model");
    require("./app/models/coleccion.server.model");
    require("./app/models/ejemplar.server.model");
    require("./app/models/user.server.model");
    require("./app/models/idioma.server.model");
    require("./app/models/diccionario.server.model");
    require("./app/models/archivo.server.model");
    require("./app/models/role.server.model");
    require("./app/models/auditlog.server.model");
    require("./app/models/lista.server.model");
    require("./app/models/sesion-uso.server.model");
    require("./app/models/support-ticket.server.model");
    require("./app/models/nube-archivo.server.model");

    // Leer el archivo de backup
    const backupPath = path.join(__dirname, "..", "BDBackup", "simr-backup-2026-07-25.json");
    console.log("📄 Leyendo backup desde:", backupPath);

    if (!fs.existsSync(backupPath)) {
      console.error("❌ Archivo de backup no encontrado:", backupPath);
      process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    console.log("✅ Backup leído correctamente");
    console.log("📊 Colecciones a restaurar:", Object.keys(backupData.data));

    // Obtener modelos de mongoose
    const modelNames = mongoose.modelNames();
    console.log("📦 Modelos disponibles:", modelNames);

    // Mapeo de colecciones del backup a modelos
    const collectionMapping = {
      "Obra": "Obra",
      "Actor": "Actor",
      "Recurso": "Recurso",
      "Instrumento": "Instrumento",
      "Sistema": "Sistema",
      "Medio": "Medio",
      "Genero": "Genero",
      "GeneroNoMusical": "GeneroNoMusical",
      "Materia": "Materia",
      "Fondo": "Fondo",
      "Coleccion": "Coleccion",
      "Proyecto": "Proyecto",
      "Idioma": "Idioma",
      "Ejemplar": "Ejemplar",
      "Diccionario": "Diccionario",
      "Lista": "Lista",
      "SupportTicket": "SupportTicket",
      "NubeArchivo": "NubeArchivo",
      "Role": "Role",
      "User": "User",
    };

    // Limpiar y poblar colecciones
    let totalInserted = 0;

    for (const [collectionName, modelName] of Object.entries(collectionMapping)) {
      if (!backupData.data[collectionName]) {
        console.log(`⚠️  Colección ${collectionName} no encontrada en backup`);
        continue;
      }

      try {
        const docs = backupData.data[collectionName];

        console.log(`\n🗑️  Limpiando ${modelName} (${docs.length} documentos)`);

        // Usar MongoClient directamente para limpiar (más eficiente)
        const collectionNameLower = modelName.toLowerCase() + 's';
        try {
          const collection = db.collection(collectionNameLower);
          await collection.drop();
          console.log(`  ✅ Colección ${modelName} eliminada (incluyendo índices)`);
        } catch (dropError) {
          // Si falla el drop, intentar con Mongoose
          const Model = mongoose.model(modelName);
          await Model.deleteMany({});
          console.log(`  ✅ Colección ${modelName} limpiada (deleteMany)`);
        }

        console.log(`  ✅ Colección ${modelName} limpiada`);

        if (docs.length > 0) {
          const Model = mongoose.model(modelName);
          await Model.insertMany(docs, { ordered: false });
          console.log(`  ✅ Insertados ${docs.length} documentos en ${modelName}`);
          totalInserted += docs.length;
        }
      } catch (error) {
        console.error(`  ❌ Error procesando ${modelName}:`, error.message);
      }
    }

    console.log(`\n✅ Restauración completada: ${totalInserted} documentos insertados`);

    // Cerrar MongoClient
    await mongoClient.close();
    console.log("✅ MongoClient cerrado");

  } catch (error) {
    console.error("❌ Error durante la restauración:", error);
  } finally {
    console.log("\n🔄 Cerrando conexión Mongoose...");
    await mongoose.disconnect();
    console.log("✅ Conexión Mongoose cerrada");
    process.exit(0);
  }
}

// Ejecutar el script
restoreDatabase();