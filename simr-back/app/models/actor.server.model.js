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

var contenedorAsociado = new Schema({
  id: {
    type: Schema.ObjectId,
    ref: "Actor",
  },
});

const anotacionCartograficoTemporal = require('../schemas/anotacion-cartografica-temporal.server.schema');

var vinculoRelacionado = new Schema({
  etiqueta: {},
  url: {},
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

//TODO: Campos por implementar: NombreCorporativo, Asiento ligado
var ActorSchema = new Schema({
  nombres: {
    type: String,
    required: function() {
      return !this.nombreArtistico && !this.nombreReunion;
    }
  },
  apellidos: {
    type: String,
    required: function() {
      return !this.nombreArtistico && !this.nombreReunion;
    }
  },
  nombreArtistico: {
    type: String,
    default: "",
    trim: true,
  },
  nombreReunion: {
    type: String,
    default: "",
    trim: true,
  },
  contenedor: [contenedorAsociado],
  anotacionCartograficoTemporal: [anotacionCartograficoTemporal],
  descriptores: [descriptorLibre],
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

ActorSchema.virtual("fullName")
  .get(function () {
    const nombres = this.nombres ? this.nombres.trim() : "";
    const apellidos = this.apellidos ? this.apellidos.trim() : "";
    const artistico = this.nombreArtistico ? this.nombreArtistico.trim() : "";
    const reunion = this.nombreReunion ? this.nombreReunion.trim() : "";

    const nameSurname = [nombres, apellidos].filter(Boolean).join(" ");

    if (nameSurname && artistico) {
      return `${nameSurname} (${artistico})`;
    }
    if (nameSurname) {
      return nameSurname;
    }
    if (artistico) {
      return artistico;
    }
    if (reunion) {
      return reunion;
    }
    return "";
  });
//Configura el 'UserSchema' para usar getters y virtuals cuando se transforme a JSON
ActorSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});

// mongoose.model("Actor", ActorSchema);

module.exports = mongoose.model("Actor", ActorSchema);
