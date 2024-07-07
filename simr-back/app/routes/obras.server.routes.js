"use strict";

//Cargar dependencias

var users = require("../../app/controllers/users.server.controller"),
  obras = require("../../app/controllers/obras.server.controller");

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base a 'obras'
  app
    .route("/api/obras")
    .get(users.requiresLogin, obras.list)
    .post(users.requiresLogin, obras.create);

  //Configurar las rutas a 'obras' parametrizadas
  app
    .route("/api/obras/:obraId")
    .get(users.requiresLogin, obras.read)
    .put(users.requiresLogin, obras.hasAuthorization, obras.update)
    .delete(users.requiresLogin, obras.hasAuthorization, obras.delete);

  //Configurar el parámetro middleware obraId
  app.param("obraId", obras.obraByID);
};
