const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archivoAdjunto = require('../schemas/archivo-adjunto.server.schema');
const anotacionCartograficoTemporal = require('../schemas/anotacion-cartografica-temporal.server.schema');

var vinculoRelacionado = new Schema({
  etiqueta: {},
  url: {},
});

var descriptorLibre = new Schema({
  etiqueta: { type: String, trim: true, require: true },
  contenido: { type: String, require: true },
});

var IdiomasSchema = new Schema({
  idioma: {
    type: String,
    unique: true,
    require: true,
  },
  glottocode: {
    type: String,
    unique: true,
    sparse: true,
  },
  isoCode: {
    type: String,
  },
  endonym: {
    type: String,
  },
  exonymSpanish: {
    type: String,
  },
  linguisticFamily: {
    type: String,
  },
  transmissionMode: {
    type: String,
  },
  territorialContext: {
    type: String,
  },
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  descriptorLibre: [descriptorLibre],
  vinculoRelacionado: [vinculoRelacionado],
  archivosAdjuntos: [archivoAdjunto],
  creador: {
    type: Schema.ObjectId,
    ref: 'User',
  },
  creado: {
    type: Date,
    default: Date.now,
  },
});

IdiomasSchema.set('toJSON', {
  getters: true,
  virtuals: true,
});

module.exports = mongoose.model('Idioma', IdiomasSchema);
