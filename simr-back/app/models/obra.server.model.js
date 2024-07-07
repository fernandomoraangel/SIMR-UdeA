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

var idiomas = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Idioma",
  },
});

var contenedorAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Obra",
  },
});

var asientoLigado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Obra",
  },
  tipoDeRelacion: {
    type: String,
  },
  direccionDeRelacion: {
    type: String,
  },
  fuenteAutorRelacion: {
    type: String,
  },
  notaGeneral: {
    type: String,
  },
  proyectoRelacionado: {
    type: Schema.ObjectId,
    ref: "Proyecto",
  },
});

var actorAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Actor",
  },
  rol: {
    type: String,
  },
});

var materiaAsociada = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Materia",
  },
});

var vinculoRelacionado = new Schema({
  etiqueta: {},
  url: {},
});

var proyectoAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Proyecto",
  },
});

var sistemaAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Sistema",
  },
  centro: {
    type: String,
  },
});

var medioAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Medio",
  },
});

var generoFormaAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Genero",
  },
});

var generoFormaNoMusical = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "GeneroNoMusical",
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

var denominacionRegional = new Schema({
  denominacionRegional: {
    type: String,
    trim: true,
    require: true,
  },
  fuenteDenominacion: {
    type: String,
    require: true,
  },
});

var ObraSchema = new Schema({
  // Título uniforme
  titulo: {
    type: String,
    trim: true,
    unique: true,
    required: "El título no puede estar en blanco",
  },
  //Denominación(es) regional-socio-cultural
  denominacionRegional: [denominacionRegional],
  descripcion: {
    type: String,
    default: "",
  },
  //Tipo de obra
  tipo: {
    type: String,
    default: "",
  },
  contenedores: [contenedorAsociado],
  asientoLigado: [asientoLigado],
  //Término de indexación género-especie-forma musical
  generosFormas: [generoFormaAsociado],
  //Término de indexación género-forma no-musical
  GenerosFormasNoMusicales: [generoFormaNoMusical],
  materias: [materiaAsociada],
  mediosSonoros: [medioAsociado],
  sistemasSonoros: [sistemaAsociado],
  idiomas: [idiomas],
  actores: [actorAsociado],
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  descriptores: [descriptorLibre],
  //Proyectos relacionados
  proyectos: [proyectoAsociado],
  vinculosRelacionados: [vinculoRelacionado],
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

ObraSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Obra", ObraSchema);
