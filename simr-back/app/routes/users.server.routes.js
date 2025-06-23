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
    .get(users.logout);

  app.route('/api/auth/verify')
    .get(users.verifyToken);
  
  // app.route('/api/auth/me')
  //   .get(users.currentUser);

  // Configurar rutas Google OAuth
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  }));

  app.get('/api/auth/google/callback',
    // passport.authenticate('google', { session: false, failureRedirect: '/signin' }),
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    users.googleCallback
  );

  // Rutas para el frontend (SPA)
  app.route('/signup')
    .get(users.renderSignup);

  app.route('/login')
    .get(users.renderLogin);

  // Rutas para usuarios (protegidas con JWT)
  app.route('/api/users')
    .get(users.requiresLogin, users.list)
    .post(users.requiresLogin, users.create);

  app.route('/api/users/:userId')
    .get(users.requiresLogin, users.read)
    .put(users.requiresLogin, users.update)
    .delete(users.requiresLogin, users.delete);

  // Middleware para procesar el parámetro userId
  app.param('userId', users.userByID);
};