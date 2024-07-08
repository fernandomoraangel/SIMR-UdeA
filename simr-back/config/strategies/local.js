// var passport = require('passport'),
// 	LocalStrategy = require('passport-local').Strategy,
// 	User = require('mongoose').model('User');

// module.exports = function () {
// 	passport.use(new LocalStrategy(async function (username, password, done) {
// 		//console.log(password+"password en local");
// 		try {
// 			const user = await User.findOne({ username: username }).exec();
// 			if (!user) {
// 				return done(null, false, { message: 'Usuario o contraseña desconocida' });
// 			}
// 			if (!user.authenticate(password)) {
// 				return done(null, false, { message: 'Usuario o contraseña desconocida' });
// 			}
// 			return done(null, user);
// 		} catch {
// 			return done(err);
// 		}
// 	}));
// };


'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');

module.exports = function() {
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async function(email, password, done) {
            try {
                let user = await User.findOne({ email: email });
                if (!user) {
                    return done(null, false, { message: 'Unknown user' });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
};
