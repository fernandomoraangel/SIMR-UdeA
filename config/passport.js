'use strict';

var passport = require('passport'),
	mongoose = require('mongoose');

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
