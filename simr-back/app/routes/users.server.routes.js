// ==============================ORIGINAL===================================

// // Invocar el modo 'strict' de JavaScript
// 'use strict';
// // Cargar el controller 'users'
// const passport = require('passport');
// const users = require('../../app/controllers/users.server.controller');

// // Define el método routes module
// module.exports = function (app) {
// 	// Configurar las rutas 'signup'
// 	app.route('/signup')
// 		.get(users.renderSignup)
// 		.post(users.signup);

// 	// Configurar la routes 'signin'
// 	// Configurar la ruta 'signin' para manejar autenticación y respuestas JSON
// 	app.route('/signin')
// 		.get(users.renderSignin)
// 		// .post(users.signin);
// 		.post(passport.authenticate('local', {
// 			successRedirect: '/',
// 			failureRedirect: '/signin',
// 			failureFlash: true
// 		}));

// 	// Configurar ruta signout
// 	app.get('/signout', users.signout);

// 	// Configurar rutas Google OAuth
// 	app.get('/oauth/Google', passport.authenticate('google', {
// 		scope: [
// 			'https://www.googleapis.com/auth/userinfo.profile',
// 			'https://www.googleapis.com/auth/userinfo.email'
// 		],
// 		failureRedirect: '/signin'
// 	}));

// 	app.get('/oauth/google/callback', passport.authenticate('google', {
// 		failureRedirect: '/signin',
// 		successRedirect: '/'
// 	}));

// 	// Set un the 'users' base routes
// 	app.route('/users')
// 		.post(users.create)
// 		.get(users.list);

// 	// Los dos puntos significan que lo que sigue será utilizado como parámetro
// 	app.route('/users/:userId')
// 		.get(users.read)
// 		.put(users.update)
// 		.delete(users.delete);

// 	// param define un middleware que será utilizado antes que cualquier otro middleware que use el parámetro
// 	app.param('userId', users.userByID);
// };

// ============================== (Fin ORIGINAL) ===================================


// ==============================MODIFICADO===================================
// Invocar el modo 'strict' de JavaScript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const users = require('../../app/controllers/users.server.controller');

// Define el método routes module
module.exports = function (app) {
  // Rutas de API para autenticación
  // app.route('/api/auth/signup')
  app.route('/api/auth/register')
    .post(users.register);

  app.route('/api/auth/login')
    .post(users.login);

  app.route('/api/auth/logout')
    .get(users.logout);

  app.route('/api/auth/verify')
    .get(users.verifyToken);

  app.route('/api/auth/refresh')
    .post(users.refreshToken);

  app.route('/api/auth/me')
    .get(users.currentUser);

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
  // app.route('/signup')
  app.route('/register')
    .get(users.renderRegister);

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