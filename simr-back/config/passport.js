// Invocar el modo 'strict' de Javascript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const mongoose = require('mongoose');

module.exports = function () {
	const User = mongoose.model('User');

	// Serializar sessions
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	// Deserializar sessions
	passport.deserializeUser(async (id, done) => {
		try {
			// const user = await User.findOne({ _id: id });
			const user = await User.findOne({ _id: id }).select('-password -salt').exec();
			done(null, user);
		} catch (err) {
			done(err, null);
		}
	});

	// Cargar las estrategias de Passport
	require('./strategies/local.js')();
	require('./strategies/google.js')();
	require('./strategies/jwt.js')();
};