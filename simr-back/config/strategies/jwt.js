// Invocar el modo 'strict' de Javascript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function () {

  // Función para extraer JWT de cookies
  const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['accessToken'];
    }
    return token;
  };

  // Configuración de las opciones para la estrategia JWT
  // Se define un extractor de tokens que puede obtener el token desde las cookies o desde el header Authorization
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      cookieExtractor,
      ExtractJwt.fromAuthHeaderAsBearerToken()
    ]),
    secretOrKey: process.env.JWT_SECRET,
    ignoreExpiration: false
  };

  // Estrategia JWT con múltiples extractores para autenticación con tokens
  passport.use(new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);

      // TODO: Revisar si esto es necesario
      // if (user && user.isActive) {
      //   return done(null, user);
      // }

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));

  //! // Estrategia JWT para cookies (para compartir entre apps)
  // passport.use('jwt-cookie', new JwtStrategy({
  //   jwtFromRequest: (req) => {
  //     let token = null;
  //     if (req && req.cookies) {
  //       token = req.cookies.accessToken;
  //     }
  //     return token;
  //   },
  //   secretOrKey: JWT_SECRET
  // }, async (payload, done) => {
  //   try {
  //     const user = await User.findById(payload.userId);
  //     if (user) {
  //       return done(null, user);
  //     }
  //     return done(null, false);
  //   } catch (error) {
  //     return done(error, false);
  //   }
  // }));
};