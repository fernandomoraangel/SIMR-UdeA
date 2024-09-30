const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archivoSchema = new Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  uploadDate: Date,
  minioObjectName: String, // Nombre del objeto en MinIO
  creador: {
    type: Schema.ObjectId,
    ref: "User",
  }
});

// const Archivo = mongoose.model('Archivo', archivoSchema);
// module.exports = Archivo;

archivoSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

mongoose.model('Archivo', archivoSchema);