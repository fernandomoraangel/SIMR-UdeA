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

var vinculoRelacionado = new Schema({
  etiqueta: {},
  url: {},
});

var proyectoAsociado = new Schema({
  proyecto: {
    type: Schema.ObjectId,
    ref: "Proyecto",
  },
});

var sistemaAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Sistema",
  },
});

var medioAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Medio",
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

var alias = new Schema({
  nombre: {
    type: String,
  },
});

var descriptorLibre = new Schema({
  etiqueta: {
    type: String,
    trim: true,
    require: true,
  },
  contenido: {
    type: String,
    require: true,
  },
});
var GeneroRelacionado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Genero",
  },
});

var idiomas = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Idioma",
  },
});

var GeneroSchema = new Schema({
  nombre: {
    type: String,
    trim: true,
    unique: true,
    require: true,
  },
  alias: [alias],
  GeneroRelacionado:[GeneroRelacionado],
  padres: [GeneroRelacionado],
  hijos: [GeneroRelacionado],
  descripcion: {
    type: String,
  },
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  idioma: [idiomas],
  sistemasSonoros: [sistemaAsociado],
  mediosSonoros: [medioAsociado],
  proyectosAsociados: [proyectoAsociado],
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
});

//Configura el 'UserSchema' para usar getters y virtuals cuando se transforme a JSON
GeneroSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Genero", GeneroSchema);
