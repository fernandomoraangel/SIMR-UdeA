var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

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

var anotacionCartograficoTemporal = new Schema({
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
  },
  precisionFin: {
    type: String,
  },
  //fuente de los datos
  evidencia: {},
});

var proyectoAsociado = new Schema({
  proyecto: {
    type: Schema.ObjectId,
    ref: "Proyecto",
  },
});

var alias = new Schema({
  nombre: {
    type: String,
  },
});

var sistemaRelacionado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Sistema",
  },
  centro: {
    type: String,
  },
});

var descriptorLibre = new Schema({
  etiqueta: {
    type: String,
    trim: true,
    required: "El campo es requerido",
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

var SistemaSchema = new Schema({
  nombre: {
    type: String,
    unique: true,
    required: "El campo no puede estar en blanco",
  },
  descripcion: {
    type: String,
  },
  alias: [alias],
  sistemasRelacionados: [sistemaRelacionado],
  padres: [sistemaRelacionado],
  hijos: [sistemaRelacionado],
  proyectosAsociados: [proyectoAsociado],
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  descriptorLibre: [descriptorLibre],
  vinculoRelacionado: [vinculoRelacionado],
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

SistemaSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Sistema", SistemaSchema);
