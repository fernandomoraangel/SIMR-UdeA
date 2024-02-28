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

var estadoRelacionado = new Schema({
  etiqueta: {
    type: String,
  },
  contenido: {
    type: String,
  },
});

var EjemplarSchema = new Schema({
  recurso: {
    type: Schema.ObjectId,
    ref: "Recurso",
  },
  numeroEjemplar: {
    type: String,
    unique: true,
  },
  disponibilidad: {
    type: String,
    default: "",
  },
  fondo: {
    type: Schema.ObjectId,
    ref: "Fondo",
  },
  coleccion: {
    type: Schema.ObjectId,
    ref: "Coleccion",
  },
  procedencia: {
    type: String,
    default: "",
  },
  estados: [estadoRelacionado],
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

EjemplarSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Ejemplar", EjemplarSchema);
