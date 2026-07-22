'use strict';

const passport = require('passport');
const idiomas = require('../controllers/idiomas.server.controller');
const { authorize } = require('../middleware/authorize.middleware');

const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = function (app) {
  app
    .route('/api/idiomas')
    .get(requireAuth, authorize('idioma', 'read'), idiomas.list)
    .post(requireAuth, authorize('idioma', 'create'), idiomas.create);

  app
    .route('/api/idiomas/seed')
    .post(requireAuth, authorize('idioma', 'create'), idiomas.seed);

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

  app.param('idiomaId', idiomas.idiomaByID);
};
