'use strict';

//Cargar dependencias

const passport = require('passport');
const medios = require('../../app/controllers/medios.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base a 'medios'
  app
    .route('/api/medios')
    .get(requireAuth, authorize('medio', 'read'), medios.list)
    .post(requireAuth, authorize('medio', 'create'), medios.create);

  //Configurar las rutas a 'medios' parametrizadas
  app
    .route('/api/medios/:medioId')
    .get(requireAuth, authorize('medio', 'read'), medios.read)
    .put(
      requireAuth,
      authorize('medio', 'update', {
        checkOwnership: (req) => req.medio.creador.id === req.user.id,
      }),
      medios.update
    )
    .delete(
      requireAuth,
      authorize('medio', 'delete', {
        checkOwnership: (req) => req.medio.creador.id === req.user.id,
      }),
      medios.delete
    );

  //Configurar el parámetro middleware medioId
  app.param('medioId', medios.medioByID);
};
