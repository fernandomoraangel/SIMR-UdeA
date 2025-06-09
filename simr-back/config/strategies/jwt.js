// Invocar el modo 'strict' de Javascript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function () {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  // Estrategia JWT para validar access tokens
  // passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  passport.use('jwt-access', new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);

      console.log('JWT middleware: ', user);

      // if (user) {
      if (user && user.isActive) {
        return done(null, user);
      }

      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }));

  // Estrategia JWT para refresh tokens (desde cookies)
  passport.use('jwt-refresh', new JwtStrategy({
    jwtFromRequest: (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.refreshToken;
      }
      return token;
    },
    secretOrKey: process.env.JWT_REFRESH_SECRET
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);

      if (user && user.isActive) {
        return done(null, user);
      }

      return done(null, false);
    } catch (error) {
      return done(error);
    }
  }));
};