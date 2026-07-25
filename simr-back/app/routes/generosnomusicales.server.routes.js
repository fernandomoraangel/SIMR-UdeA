"use strict";

//Cargar dependencias

const passport = require("passport");
const generosNoMusicales = require("../../app/controllers/generosnomusicales.server.controller");
const { authorize } = require("../middleware/authorize.middleware");

const requireAuth = passport.authenticate("jwt", { session: false });

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base
  app
    .route("/api/generosNoMusicales")
    .get(generosNoMusicales.list)
    .post(
      requireAuth,
      authorize("genero_no_musical", "create"),
      generosNoMusicales.create
    );

  //Configurar las rutas a 'generos' parametrizadas
  app
    .route("/api/generosNoMusicales/:generoNoMusicalId")
    .get(generosNoMusicales.read)
    .put(
      requireAuth,
      authorize("genero_no_musical", "update", {
        checkOwnership: (req) =>
          req.generoNoMusical.creador.id === req.user.id,
      }),
      generosNoMusicales.update
    )
    .delete(
      requireAuth,
      authorize("genero_no_musical", "delete", {
        checkOwnership: (req) =>
          req.generoNoMusical.creador.id === req.user.id,
      }),
      generosNoMusicales.delete
    );

  //Configurar el parámetro middleware
  app.param("generoNoMusicalId", generosNoMusicales.generoNoMusicalByID);
};
