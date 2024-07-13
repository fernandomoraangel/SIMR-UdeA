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
		.post((req, res, next) => {
			passport.authenticate(
				'local',
				(err, user) => {
					if (err) {
						return next(err);
					}
					if (!user) {
						return res.status(401).json({ message: 'Authentication failed' });
					}
					req.logIn(user, (err) => {
						if (err) {
							return next(err);
						}
						const safeUser = {
							id: user._id,
							username: user.username,
							email: user.email,
							// agrega otros campos que quieras exponer
						};
						// return res.json({ message: 'Authentication successful', user: safeUser });
						res.json({ message: 'Authentication successful', user: safeUser });
						// return res.redirect('/'); 
					});
				},
				{
					successRedirect: '/',
					failureRedirect: '/signin',
					failureFlash: true
				})(req, res, next);
		});


	// app.route('/signin')
	// 	.get(users.renderSignin)
	// 	.post(
	// 		passport.authenticate('local', {
	// 			successRedirect: '/',
	// 			failureRedirect: '/signin',
	// 			failureFlash: true
	// 		}),
	// 		(req, res) => {
	// 			res.send({ message: 'Logged in successfully' });
	// 		}
	// 	);


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

	// Configurar ruta signout
	app.get('/signout', users.signout);

	// param define un middleware que será utilizado antes que cualquier otro middleware que use el parámetro
	app.param('UserId', users.userByID);
};




// ==========================================================




// 'use strict';
// const passport = require('passport');
// const users = require('../../app/controllers/users.server.controller');

// module.exports = function (app) {
// 	app.route('/signup')
// 		.get(users.renderSignup)
// 		.post(users.signup);

// 	app.route('/signin')
// 		.get(users.renderSignin)
// 		.post(passport.authenticate('local', {
// 			failureRedirect: '/signin',
// 			failureFlash: true
// 		}), (req, res) => {
// 			res.json({ message: 'Logged in successfully', user: req.user });
// 		});

// 	app.get('/signout', users.signout);

// 	app.get('/oauth/google', passport.authenticate('google', {
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

// 	app.route('/users')
// 		.post(users.create)
// 		.get(users.list);

// 	app.route('/users/:userId')
// 		.get(users.read)
// 		.put(users.update)
// 		.delete(users.delete);

// 	app.param('userId', users.userByID);
// };
