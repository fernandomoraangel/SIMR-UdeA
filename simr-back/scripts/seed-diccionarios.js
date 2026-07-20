#!/usr/bin/env node

/**
 * Script para poblar la colección de Diccionarios desde el archivo de
 * migración ubicado en la carpeta "Migración/diccionarios.json" (formato
 * MongoDB Extended JSON).
 *
 * Ejecutar dentro del contenedor (simr-back_dev):
 *   docker cp "Migración/diccionarios.json" simr-back_dev:/app/scripts/diccionarios.json
 *   docker exec -w /app simr-back_dev node scripts/seed-diccionarios.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const connectDB = async () => {
  try {
    console.log('Using MongoDB URI:', config.db);
    await mongoose.connect(config.db);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Convertir valores de MongoDB Extended JSON a tipos nativos de Mongoose.
const fromExtended = (value) => {
  if (value && typeof value === 'object') {
    if (value.$oid) return new mongoose.Types.ObjectId(value.$oid);
    if (value.$date) {
      const ms =
        typeof value.$date === 'object' && value.$date.$numberLong
          ? Number(value.$date.$numberLong)
          : new Date(value.$date).getTime();
      return new Date(ms);
    }
  }
  return value;
};

const seedDiccionarios = async () => {
  const filePath = path.join(__dirname, 'diccionarios.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ No se encontró ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const docs = JSON.parse(raw);

  require('../app/models/diccionario.server.model');
  const Diccionario = mongoose.model('Diccionario');

  let insertados = 0;
  let omitidos = 0;

  for (const doc of docs) {
    const registro = {
      tabla: doc.tabla,
      campo: doc.campo,
      campoLargo: doc.campoLargo,
      definicion: doc.definicion,
      creador: doc.creador ? fromExtended(doc.creador) : undefined,
      creado: doc.creado ? fromExtended(doc.creado) : undefined,
    };

    const existe = await Diccionario.findOne({
      tabla: registro.tabla,
      campo: registro.campo,
    });

    if (existe) {
      omitidos++;
      continue;
    }

    await Diccionario.create(registro);
    insertados++;
  }

  console.log(`✅ Diccionarios insertados: ${insertados}`);
  console.log(`⚠️  Diccionarios omitidos (ya existían): ${omitidos}`);
};

const main = async () => {
  await connectDB();
  await seedDiccionarios();
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
  process.exit(0);
};

if (require.main === module) {
  main();
}

module.exports = { seedDiccionarios };
