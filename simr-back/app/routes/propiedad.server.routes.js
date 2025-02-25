"use strict";

//Cargar dependencias

var users = require("../controllers/users.server.controller"),
  roles = require("../controllers/propiedades.server.controller");

//Definir el método routes del módulo
module.exports = function (app) {
  //Configurar ruta base
  app
    .route("/api/propiedades")
    .get(propiedades.list)
    .post(users.requiresLogin, roles.create);

  //Configurar las rutas a  parametrizadas
  app
    .route("/api/propiedades/:propiedadId")
    .get(propiedad.read)
    .put(users.requiresLogin, propiedad.hasAuthorization, propiedades.update)
    .delete(users.requiresLogin, propiedades.hasAuthorization, propiedades.delete);

  //Configurar el parámetro middleware
  app.param("propiedadId", propiedades.propiedadByID);
};
