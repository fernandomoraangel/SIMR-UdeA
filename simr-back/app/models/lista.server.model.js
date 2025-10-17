// Invocar el modo javascript 'strict'
"use strict";

const mongoose = require("mongoose");

const ListaSchema = new mongoose.Schema({
  nombre_lista: {
    type: String,
    required: true,
    index: true, // Para búsquedas rápidas
  },
  elementos: {
    type: [String],
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Para listas complejas como nNormalizados
  },
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  fecha_modificacion: {
    type: Date,
    default: Date.now,
  },
  usuario_modifico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Middleware pre-save para actualizar fecha_modificacion
ListaSchema.pre("save", function (next) {
  this.fecha_modificacion = new Date();
  next();
});

// Índice compuesto para búsquedas eficientes
ListaSchema.index({ nombre_lista: 1, fecha_modificacion: -1 });

// Crear el modelo 'Lista' a partir del 'ListaSchema'
mongoose.model("Lista", ListaSchema);
