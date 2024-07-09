const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('mongoose').model('User');

module.exports = function () {
	passport.use(new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password'
		},
		async function (username, password, done) {
			try {
				const user = await User.findOne({ username: username }).exec();
				if (!user) {
					return done(null, false, { message: 'Usuario o contraseña desconocida' });
				}
				if (!user.authenticate(password)) {
					return done(null, false, { message: 'Usuario o contraseña desconocida' });
				}
				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	));
};
