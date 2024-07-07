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

var FechasAsociadas = new Schema({
  fecha: {
    type: Date,
    required: "El campo no puede estar en blanco",
  },
  evento: {
    type: String,
  },
  precision: {
    type: String,
    //Año Mes Día Hora
  },
});

var Investigador = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Actor",
  },
  rol: {
    type: String,
  },
  activoDesde: {
    type: Date,
  },
  precisionActivoDesde: {
    type: String,
    //Año Mes Día Hora
  },

  activoHasta: {
    type: Date,
  },
  precisionActivoHasta: {
    type: String,
    //Año Mes Día Hora
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

var ProyectoSchema = new Schema({
  nombre: {
    type: String,
    default: "",
    trim: true,
    unique: true,
    required: "El campo no puede estar en blanco",
  },
  investigadores: [Investigador],
  fechasAsociadas: [FechasAsociadas],
  estado: {
    type: String,
    default: "",
  },
  descriptoresLibres: [descriptorLibre],
  creador: {
    type: Schema.ObjectId,
    ref: "User",
  },
  creado: {
    type: Date,
    default: Date.now,
  },
  vinculoRelacionado: [vinculoRelacionado],
  registroOperacion: [registroOperacion],
});

ProyectoSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Proyecto", ProyectoSchema);
