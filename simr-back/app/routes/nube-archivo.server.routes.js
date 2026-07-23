'use strict';

// Registrar modelo ANTES que el controlador
require('../../app/models/nube-archivo.server.model');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

const ctrl = require('../../app/controllers/nube-archivo.server.controller');

module.exports = function (app) {
  // Middleware de rol para todas las rutas
  app.all('/api/nube-archivos*', ctrl.requireNubeRole);

  app.route('/api/nube-archivos')
    .get(ctrl.list)
    .post(upload.single('file'), ctrl.upload);

  app.route('/api/nube-archivos/tags')
    .get(ctrl.allTags);

  app.route('/api/nube-archivos/:id')
    .get(ctrl.read)
    .delete(ctrl.remove);

  app.route('/api/nube-archivos/:id/download')
    .get(ctrl.download);

  app.route('/api/nube-archivos/:id/tags')
    .put(ctrl.updateTags);
};
