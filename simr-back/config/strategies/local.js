//======================ORIGINAL========================

// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const User = require('mongoose').model('User');

// // module.exports = function () {
// // 	passport.use(new LocalStrategy(
// // 		{
// // 			usernameField: 'username',
// // 			passwordField: 'password'
// // 		},
// // 		async function (username, password, done) {
// // 			try {
// // 				const user = await User.findOne({ username: username }).exec();
// // 				if (!user) {
// // 					return done(null, false, { message: 'Usuario o contraseña desconocida' });
// // 				}
// // 				if (!user.authenticate(password)) {
// // 					return done(null, false, { message: 'Usuario o contraseña desconocida' });
// // 				}
// // 				return done(null, user);
// // 			} catch (err) {
// // 				return done(err);
// // 			}
// // 		}
// // 	));

// module.exports = function () {
// 	passport.use(new LocalStrategy(async function (username, password, done) {
// 		try {
// 			const user = await User.findOne({ username: username });
// 			if (!user) {
// 				return done(null, false, { message: 'Usuario o contraseña desconocida' });
// 			}
// 			if (!user.authenticate(password)) {
// 				return done(null, false, { message: 'Usuario o contraseña desconocida' });
// 			}
// 			return done(null, user);
// 		} catch (err) {
// 			return done(err);
// 		}
// 	}));
// };

//=================================(Fin de ORIGINAL)========================



// ==============================MODIFICADO===================================
// Invocar el modo 'strict' de Javascript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function () {
  // Usar la estrategia 'local'
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, async (username, password, done) => {
    try {
      // Buscar un usuario con el nombre de usuario proporcionado
      const user = await User.findOne({ username: username });

      // Si no hay usuario
      if (!user) {
        // TODO: Cambiar mensaje por "Error de autenticación"
        return done(null, false, { message: 'Usuario desconocido' });
      }

      // ********* bcrypt implementation
      // const isMatch = await bcrypt.compare(password, user.password);

      // if (!isMatch) {
      //       return done(null, false, { message: 'Contraseña incorrecta' });
      //   }
      // *********

      // Verificar si la contraseña es correcta
      if (!user.authenticate(password)) {
        // TODO: Cambiar mensaje por "Error de autenticación"
        return done(null, false, { message: 'Credenciales incorrectas' });
      }

      console.log('local strategy (backend):', user);

      // if (!user.isActive) {
      //   return done(null, false, { message: 'Cuenta no activa' });
      // }

      // Si todo está bien, entregar el usuario
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};