'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NubeArchivoSchema = new Schema({
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  key: { type: String, required: true, unique: true },
  tags: [{ type: String }],
  color: { type: String, trim: true },
  uploadedBy: { type: Schema.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NubeArchivoSchema.set('toJSON', {
  getters: true,
  virtuals: true,
});

module.exports = mongoose.model('NubeArchivo', NubeArchivoSchema);
