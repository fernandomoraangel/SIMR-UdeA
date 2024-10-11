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

var fuenteAsociada = new Schema({
  //fabricante, distribuidor,editorial
  tipoFuente: {
    type: String,
  },
  lugar: {
    type: String,
  },
  nombre: {
    type: String,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  precision: {
    type: String,
    //Década Año Mes Día Hora
  },
});

var proyectoAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Proyecto",
  },
});

var descripcionTecnica = new Schema({
  criterio: {},
  valor: {},
});

var vinculoRelacionado = new Schema({
  etiqueta: {},
  url: {},
});

var mencionResponsabilidad = new Schema({
  actor: {},
  tipoDeMencion: {
    type: String,
  },
});

var obraRelacionada = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Obra",
  },
});

var numeroNormalizado = new Schema({
  nombre: {
    type: String,
    required: "El campo es requerido",
  },
  numero: {
    type: String,
    required: "El campo es requerido",
  },
});

var actor = new Schema({
  actor: {
    type: Schema.ObjectId,
    ref: "Actor",
  },
  rol: {},
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

var materiaAsociada = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Materia",
  },
});

var contenedorAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Recurso",
  },
});

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

var tipoDeRecurso = new Schema({
  id: {
    type: String,
  },
});

var idiomas = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Idioma",
  },
});

var RecursoSchema = new Schema({
  titulo: {
    type: String,
    unique: true,
    required: "El campo es requerido",
  },
  obrasRelacionadas: [obraRelacionada],
  numeroNormalizado: [numeroNormalizado],
  faceta: {
    type: String,
    unique: true,
  },
  mencionResponsabilidad: [mencionResponsabilidad],
  descripcion: {
    type: String,
  },
  contenedores: [contenedorAsociado],
  fuente: [fuenteAsociada],
  tiposDeRecurso: [tipoDeRecurso],
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  materia: [materiaAsociada],
  idiomas: [idiomas],
  descripcionTecnica: [descripcionTecnica],
  materialAcompanante: {
    type: String,
  },
  mencionDeSerie: {
    type: String,
  },
  proyectos: [proyectoAsociado],
  vinculoRelacionado: [vinculoRelacionado],
  archivosAdjuntos: [archivoAdjunto],
  descriptorLibre: [descriptorLibre],
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
//Configura el 'UserSchema' para usar getters y virtuals cuando se transforme a JSON
RecursoSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Recurso", RecursoSchema);
