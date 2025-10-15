/**
 * Rutas de Permisos para SIMR
 * Define endpoints relacionados con consulta de permisos del usuario
 */

"use strict";

const permissionsController = require("../controllers/permissions.server.controller");
const passport = require("passport");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  // Obtener permisos del usuario autenticado actual
  app
    .route("/api/permissions")
    .get(requireAuth, permissionsController.getMyPermissions);
};
