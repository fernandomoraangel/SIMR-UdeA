'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../app/models/user.server.model'); // Ajusta la ruta según tu estructura

// passport.use(new LocalStrategy({
//     usernameField: 'username',
//     passwordField: 'password'
// }, async (username, password, done) => {
//     try {
//         const user = await User.findOne({ username: username });
//         if (!user) {
//             return done(null, false, { message: 'Incorrect credentials.' });
//         }
//         const isMatch = await user.comparePassword(password);
//         if (!isMatch) {
//             return done(null, false, { message: 'Incorrect password.' });
//         }
//         return done(null, user);
//     } catch (err) {
//         return done(err);
//     }
// }));

// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (err) {
//         done(err);
//     }
// });

// module.exports = passport;




// [Original code]

// 'use strict';

// var passport = require('passport');
var mongoose = require('mongoose');

module.exports = function () {
	var User = mongoose.model('User');

	// Definen cómo manejará passport la serialización de los usuarios
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(async function (id, done) {
		try {
			// Objeto opcion de mongoose para asegurar que no recupera esos campos
			let user = await User.findOne({ _id: id }, '-password -salt');
			done(null, user);
		} catch (err) {
			done(err);
		}
	});

	require('./strategies/local.js')();
	require('./strategies/google.js')();
};
