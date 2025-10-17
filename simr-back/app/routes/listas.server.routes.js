// Invocar el modo 'strict' de JavaScript
"use strict";

// Cargar los módulos necesarios
const listasController = require("../controllers/listas.server.controller");
const { hasRole } = require("../middleware/authorize.middleware");
const passport = require("passport");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

// Define el método routes module
module.exports = function (app) {
  // Rutas para listas (requieren autenticación)
  app
    .route("/api/listas")
    .get(requireAuth, listasController.list)
    .post(
      requireAuth,
      hasRole(["admin", "bibliotecólogo"]),
      listasController.create
    );

  app
    .route("/api/listas/:nombre_lista")
    .get(requireAuth, listasController.readByName);

  app
    .route("/api/listas/:lista_id")
    .put(
      requireAuth,
      hasRole(["admin", "bibliotecólogo"]),
      listasController.update
    )
    .delete(
      requireAuth,
      hasRole(["admin", "bibliotecólogo"]),
      listasController.delete
    );

  // Rutas para gestión de elementos individuales
  app
    .route("/api/listas/:nombre_lista/elementos")
    .post(
      requireAuth,
      hasRole(["admin", "bibliotecólogo"]),
      listasController.addElement
    );

  app
    .route("/api/listas/:lista_id/elementos/:elemento_index")
    .put(
      requireAuth,
      hasRole(["admin", "bibliotecólogo"]),
      listasController.updateElement
    )
    .delete(
      requireAuth,
      hasRole(["admin", "bibliotecólogo"]),
      listasController.deleteElement
    );

  // Middleware para procesar el parámetro lista_id
  app.param("lista_id", listasController.listaByID);
};
