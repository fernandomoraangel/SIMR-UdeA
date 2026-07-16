'use strict';

//Cargar dependencias

const passport = require('passport');
const idiomas = require('../controllers/idiomas.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base
  app
    .route('/api/idiomas')
    .get(requireAuth, authorize('idioma', 'read'), idiomas.list)
    .post(requireAuth, authorize('idioma', 'create'), idiomas.create);

  //Configurar las rutas a  parametrizadas
  app
    .route('/api/idiomas/:idiomaId')
    .get(requireAuth, authorize('idioma', 'read'), idiomas.read)
    .put(
      requireAuth,
      authorize('idioma', 'update', {
        checkOwnership: (req) => req.idioma.creador.id === req.user.id,
      }),
      idiomas.update
    )
    .delete(
      requireAuth,
      authorize('idioma', 'delete', {
        checkOwnership: (req) => req.idioma.creador.id === req.user.id,
      }),
      idiomas.delete
    );

  //Configurar el parámetro middleware
  app.param('idiomaId', idiomas.idiomaByID);
};
