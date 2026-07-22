const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archivoAdjunto = require('../schemas/archivo-adjunto.server.schema');

//Auditoría (borrado o edición de algún campo o registro completo)
var registroOperacion = new Schema({
  tipoDeOperacion: {
    type: String,
    //A partir de lista
  },
  registroBorrado: {
    type: Boolean,
    default: false,
  },
  campo: {
    //Uno o varios
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  usuario: {
    type: Schema.ObjectId,
    ref: "User",
  },
});

const anotacionCartograficoTemporal = require('../schemas/anotacion-cartografica-temporal.server.schema');

var descriptorLibre = new Schema({
  etiqueta: {
    type: String,
    trim: true,
    required: true,
  },
  contenido: {
    type: String,
    required: "El campo es requerido",
  },
});

var vinculoRelacionado = new Schema({
  etiqueta: {},
  url: {},
});

var alias = new Schema({
  nombre: {
    type: String,
  },
});

var proyectoAsociado = new Schema({
  proyecto: {
    type: Schema.ObjectId,
    ref: "Proyecto",
  },
});

var InstrumentoSchema = new Schema({
  nombre: {
    type: String,
    unique: true,
    required: "El nombre no puede estar en blanco",
  },
  clasificacion: {
    type: String,
  },
  alias: [alias],
  proyectosAsociados: [proyectoAsociado],
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  descriptorLibre: [descriptorLibre],
  vinculoRelacionado: [vinculoRelacionado],
  archivosAdjuntos: [archivoAdjunto],
  creador: {
    type: Schema.ObjectId,
    ref: "User",
  },
  creado: {
    type: Date,
    default: Date.now,
  },
  registroOperacion: [registroOperacion],
});

InstrumentoSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

module.exports = mongoose.model("Instrumento", InstrumentoSchema);
