'use strict';

const mongoose = require('mongoose');

const NubeConfigSchema = new mongoose.Schema({
  maxFileSize: { type: Number, default: 200 * 1024 * 1024 }, // bytes
}, {
  timestamps: true,
  collection: 'nubeconfigs',
});

mongoose.model('NubeConfig', NubeConfigSchema);
