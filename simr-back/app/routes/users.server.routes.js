// ==============================ORIGINAL===================================

// Invocar el modo 'strict' de JavaScript
'use strict';
// Cargar el controller 'users'
const passport = require('passport');
const users = require('../../app/controllers/users.server.controller');

// Define el método routes module
module.exports = function (app) {
	// Configurar las rutas 'signup'
	app.route('/signup')
		.get(users.renderSignup)
		.post(users.signup);

	// Configurar la routes 'signin'
	// Configurar la ruta 'signin' para manejar autenticación y respuestas JSON
	app.route('/signin')
		.get(users.renderSignin)
		// .post(users.signin);
		.post(passport.authenticate('local', {
			successRedirect: '/',
			failureRedirect: '/signin',
			failureFlash: true
		}));

	// Configurar ruta signout
	app.get('/signout', users.signout);

	// Configurar rutas Google OAuth
	app.get('/oauth/Google', passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		],
		failureRedirect: '/signin'
	}));

	app.get('/oauth/google/callback', passport.authenticate('google', {
		failureRedirect: '/signin',
		successRedirect: '/'
	}));

	// Set un the 'users' base routes
	app.route('/users')
		.post(users.create)
		.get(users.list);

	// Los dos puntos significan que lo que sigue será utilizado como parámetro
	app.route('/users/:userId')
		.get(users.read)
		.put(users.update)
		.delete(users.delete);

	// param define un middleware que será utilizado antes que cualquier otro middleware que use el parámetro
	app.param('UserId', users.userByID);
};
