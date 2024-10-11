const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archivoAdjunto = new Schema({
  archivoId: {
    type: Schema.ObjectId,
    ref: "Archivo"
  }
});

// exportar para usar en otros modelos
module.exports = archivoAdjunto;
