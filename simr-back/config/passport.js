"use strict";

const passport = require("passport");
const mongoose = require("mongoose");

module.exports = function () {
  const User = mongoose.model("User");

  // Definen cómo manejará passport la serialización de los usuarios
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findOne({ _id: id })
        .select("-password -salt")
        .exec();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  require("./strategies/local.js")();
  require("./strategies/google.js")();
};
