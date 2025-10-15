// Invocar el modo 'strict' de Javascript
"use strict";

// Cargar los módulos necesarios
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = function () {
  // Estrategia Local para login
  passport.use(
    new LocalStrategy(
      {
        username: "username",
        password: "password",
      },
      async (username, password, done) => {
        try {
          const badCredentials = "Credenciales incorrectas";
          const user = await User.findOne({ username: username }).populate(
            "roles",
            "name displayName description priority"
          );

          if (!user) {
            // Bad username
            return done(null, false, { message: badCredentials });
          }

          // const isMatch = await user.comparePassword(password);
          const isMatch = await user.verifyPassword(password);
          console.log("Comparando contraseña:", password, "con", user.password);
          console.log("Contraseña verificada:", isMatch);
          if (!isMatch) {
            // Bad password
            return done(null, false, { message: badCredentials });
          }

          console.log("local strategy (backend):", user);
          console.log("local strategy - roles:", user.roles);

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
