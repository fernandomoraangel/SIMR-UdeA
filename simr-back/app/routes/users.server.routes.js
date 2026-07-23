// Invocar el modo 'strict' de JavaScript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const users = require('../../app/controllers/users.server.controller');
const {requireAuth} = require('../../config/auth');

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
    // passport.authenticate('google', { session: false, failureRedirect: '/signin' }),
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    users.googleCallback
  );

  // Rutas para el frontend (SPA)
  app.route('/signup')
    .get(users.renderSignup);

  app.route('/login')
    .get(users.renderLogin);

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

  // Ruta para redirección desde Angular a AngularJS
  app.route('/redirect-to-legacy')
    .get(passport.authenticate('jwt', { session: false }), (req, res) => {
      // El usuario ya está autenticado por JWT. Se usa una redirección
      // relativa (mismo origen) en vez de una URL absoluta configurada
      // por variable de entorno: evita que quede mal apuntada (p.ej. a
      // localhost) si ANGULARJS_APP_URL no está definida, y funciona
      // igual en cualquier entorno (dev/prod) porque este endpoint ya
      // vive en el mismo backend que sirve el shell legacy en '/'.
      const returnTo = typeof req.query.returnTo === 'string' && req.query.returnTo.startsWith('/')
        ? req.query.returnTo
        : '/';
      res.redirect(returnTo);
    });
};