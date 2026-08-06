'use strict';

// Registrar modelos ANTES que el controlador
require('../../app/models/nube-archivo.server.model');
require('../../app/models/nube-config.server.model');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1048576000 } }); // 1GB (validación real contra config)

const ctrl = require('../../app/controllers/nube-archivo.server.controller');
const { authorize } = require('../../app/middleware/authorize.middleware');
const mongoose = require('mongoose');
const NubeArchivo = mongoose.model('NubeArchivo');

module.exports = function (app) {
  // Middleware de autenticación primero (passport), luego autorización
  const { requireAuth } = require('../../config/auth');

  // Listar y subir archivos
  app.route('/api/nube-archivos')
    .get(ctrl.list)
    .post(requireAuth, authorize('nube', 'create', { checkOwnership: () => true }), upload.single('file'), ctrl.upload);

  // Tags globales
  app.route('/api/nube-archivos/tags')
    .get(ctrl.allTags);

  // Archivo individual
  app.route('/api/nube-archivos/:id')
    .get(ctrl.read)
    .delete(requireAuth, authorize('nube', 'delete', { checkOwnership: async (req) => { const doc = await NubeArchivo.findById(req.params.id); return doc && String(doc.uploadedBy) === String(req.user._id); } }), ctrl.remove);

  // Descarga
  app.route('/api/nube-archivos/:id/download')
    .get(ctrl.download);

  // Actualizar tags
  app.route('/api/nube-archivos/:id/tags')
    .put(requireAuth, authorize('nube', 'update', { checkOwnership: async (req) => { const doc = await NubeArchivo.findById(req.params.id); return doc && String(doc.uploadedBy) === String(req.user._id); } }), ctrl.updateTags);

  // Actualizar color de tarjeta
  app.route('/api/nube-archivos/:id/color')
    .put(requireAuth, authorize('nube', 'update', { checkOwnership: async (req) => { const doc = await NubeArchivo.findById(req.params.id); return doc && String(doc.uploadedBy) === String(req.user._id); } }), ctrl.updateColor);

  // Configuración de nube (requiere admin)
  const { isAdmin } = require('../../app/middleware/authorize.middleware');
  app.route('/api/nube-archivos/config')
    .get(requireAuth, authorize('nube', 'read', { checkOwnership: () => true }), ctrl.getConfig)
    .put(requireAuth, isAdmin, ctrl.updateConfig);
};
