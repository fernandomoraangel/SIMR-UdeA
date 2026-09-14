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

  // Rutas de doble factor de autenticación (TOTP)
  // 1. Setup (autenticado): genera secreto + códigos de respaldo
  app.route('/api/auth/2fa/setup')
    .post(users.requiresLogin, users.setupTwoFactor);

  // 2. Enable (autenticado): activa tras validar código con el secreto
  app.route('/api/auth/2fa/enable')
    .post(users.requiresLogin, users.enableTwoFactor);

  // 3. Verify (público, con cookie pending2fa): emite sesión tras validar el código
  app.route('/api/auth/2fa/verify')
    .post(users.verifyTwoFactor);

  // 4. Disable (autenticado): desactiva tras validar código vigente
  app.route('/api/auth/2fa/disable')
    .post(users.requiresLogin, users.disableTwoFactor);

  // 5. Status (autenticado): estado del 2FA del usuario actual
  app.route('/api/auth/2fa/status')
    .get(users.requiresLogin, users.twoFactorStatus);

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