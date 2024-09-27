const mongoose = require('mongoose');

const archivoSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  uploadDate: Date,
  minioObjectName: String, // Nombre del objeto en MinIO
  // creador: {
  //   type: Schema.ObjectId,
  //   ref: "User",
  // }
});

// const Archivo = mongoose.model('Archivo', archivoSchema);
// module.exports = Archivo;

mongoose.model('Archivo', archivoSchema);