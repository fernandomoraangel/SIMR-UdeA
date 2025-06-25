// Invocar el modo 'strict' de Javascript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function () {
  // Estrategia Local para login
  passport.use(new LocalStrategy({
    username: 'username',
    password: 'password'
  }, async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Usuario desconocido' });
      }

      // const isMatch = await user.comparePassword(password);
      const isMatch = await user.verifyPassword(password);
      console.log('Comparando contraseña:', password, 'con', user.password);
      console.log('Contraseña verificada:', isMatch);
      if (!isMatch) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      console.log('local strategy (backend):', user);

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
};