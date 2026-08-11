// Invocar el modo 'strict' de JavaScript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const users = require('../../app/controllers/users.server.controller');

// Define el método routes module
module.exports = function (app) {
  // Rutas de API para autenticación
  app.route('/api/auth/signup')
    .post(users.signup);

  app.route('/api/auth/login')
    .post(users.login);

  app.route('/api/auth/refresh')
    .post(users.refreshToken);

  app.route('/api/auth/logout')
    .post(users.logout);

  app.route('/api/auth/verify')
    .get(users.verifyToken);

  app.route('/api/auth/forgot-password')
    .post(users.forgotPassword);

  app.route('/api/auth/reset-password')
    .post(users.resetPassword);

  app.route('/api/auth/change-password')
    .post(users.requiresLogin, users.changePassword);

  // Configurar rutas Google OAuth
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/angular/login' }),
    users.googleCallback
  );

  // Preferencias de usuario
  app.route('/api/users/preferences')
    .get(users.requiresLogin, users.getPreferences)
    .put(users.requiresLogin, users.updatePreferences);

  // Rutas para usuarios (protegidas con JWT)
  app.route('/api/users')
    // .get(requireAuth, users.list)
    .get(users.requiresLogin, users.list)
    .post(users.requiresLogin, users.create);
  
    // app.route('/api/users')
  //   .get(users.requiresLogin, users.list)
  //   .post(users.requiresLogin, users.create);

  app.route('/api/users/:userId')
    .get(users.requiresLogin, users.read)
    .put(users.requiresLogin, users.update)
    .delete(users.requiresLogin, users.delete);

  // Middleware para procesar el parámetro userId
  app.param('userId', users.userByID);
};