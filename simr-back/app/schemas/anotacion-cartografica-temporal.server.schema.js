const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const anotacionCartograficoTemporal = new Schema({
  lugar: {},
  coordenadas: {
    type: [Number],
    index: "2dsphere",
  },
  evento: {
    type: String,
  },
  coberturaAmplitud: {},
  fechaInicio: {
    type: Date,
  },
  fechaFin: {
    type: Date,
  },
  precisionInicio: {
    type: String,
    enum: ['', 'A', 'M', 'D', 'AM', 'AD', 'MD', 'AMD'],
  },
  precisionFin: {
    type: String,
    enum: ['', 'A', 'M', 'D', 'AM', 'AD', 'MD', 'AMD'],
  },
  evidencia: {},
});

module.exports = anotacionCartograficoTemporal;
