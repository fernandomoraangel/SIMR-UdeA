var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var PropiedadSchema = mongoose.Schema({
  propiedad: {
    type: String,
    unique: false,
  },
  lista: {
    type: String,
    unique: true,
  },
  definición: {
    type: String,
    unique: true,
  },
  comentario: {
    type: String,
    unique: true,
  },
  creador: {
    type: Schema.ObjectId,
    ref: "User",
  },
  creado: {
    type: Date,
    default: Date.now,
  },
});

PropiedadSchema.set("toJSON", {
  getters: true,
  virtuals: true,
});
mongoose.model("Propiedad", PropiedadSchema);
