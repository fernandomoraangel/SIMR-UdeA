//=======================ORIGINAL================================

// var passport = require('passport'),
//   url = require('url'),
//   GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
//   config = require('../config'),
//   users = require('../../app/controllers/users.server.controller');

// module.exports = function () {
//   passport.use(new GoogleStrategy({
//     clientID: config.google.clientID,
//     clientSecret: config.google.clientSecret,
//     callbackURL: config.google.callbackURL,
//     passReqToCallback: true
//   },
//     function (req, accessToken, refreshToken, profile, done) {
//       var providerData = profile._json;
//       providerData.accessToken = accessToken;
//       providerData.refreshToken = refreshToken;

//       var providerUserProfile = {
//         firstName: profile.name.givenName,
//         lastName: profile.name.familyName,
//         fullName: profile.displayName,
//         email: profile.emails[0].value,
//         username: profile.username,
//         provider: 'google',
//         providerId: profile.id,
//         providerData: providerData
//       };

//       users.saveOAuthUserProfile(req, providerUserProfile, done);
//     }));
// };

//=======================(Fin de ORIGINAL)=================================



//========================MODIFICADO===================================
// Invocar el modo 'strict' de Javascript
'use strict';

// Cargar los módulos necesarios
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = function () {
  // Configurar la estrategia Google OAuth 2.0
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'tu_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'tu_client_secret',
    callbackURL: '/api/auth/google/callback',
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Verificar si el usuario ya existe
      let user = await User.findOne({ 'providerId': profile.id, 'provider': 'google' });

      // Si el usuario no existe, crear uno nuevo
      if (!user) {
        // Crear un nuevo usuario
        user = new User({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          username: profile.emails[0].value,
          password: 'google-auth-' + Math.random().toString(36).substring(2),
          provider: 'google',
          providerId: profile.id,
          providerData: profile._json
        });

        // Guardar el usuario
        await user.save();
      }

      // Devolver el usuario autenticado
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};