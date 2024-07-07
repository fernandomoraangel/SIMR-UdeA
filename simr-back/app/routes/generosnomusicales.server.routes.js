"use strict";

//Cargar dependencias

var users = require("../../app/controllers/users.server.controller"),
  generosNoMusicales = require("../../app/controllers/generosnomusicales.server.controller");

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base
  app
    .route("/api/generosNoMusicales")
    .get(generosNoMusicales.list)
    .post(users.requiresLogin, generosNoMusicales.create);

  //Configurar las rutas a 'generos' parametrizadas
  app
    .route("/api/generosNoMusicales/:generoNoMusicalId")
    .get(generosNoMusicales.read)
    .put(
      users.requiresLogin,
      generosNoMusicales.hasAuthorization,
      generosNoMusicales.update
    )
    .delete(
      users.requiresLogin,
      generosNoMusicales.hasAuthorization,
      generosNoMusicales.delete
    );

  //Configurar el parámetro middleware
  app.param("generoNoMusicalId", generosNoMusicales.generoNoMusicalByID);
};
