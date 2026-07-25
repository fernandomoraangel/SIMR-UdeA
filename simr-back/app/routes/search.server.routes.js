"use strict";

// Cargar dependencias
const passport = require("passport");
const search = require("../../app/controllers/search.server.controller");
const { authorize } = require("../middleware/authorize.middleware");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

// Definir el método routes del módulo
module.exports = function (app) {
  // Ruta para obtener metadatos de búsqueda (sin autenticación requerida) - debe ir antes
  app.get("/api/search/metadata", search.getSearchMetadata);

  // Ruta para búsqueda general en todas las entidades
  app.route("/api/search").get(search.search);

  // Ruta para búsqueda en entidad específica
  app.route("/api/search/:entity").get(search.searchEntity);

  // Ruta para validar consultas de búsqueda
  app.route("/api/search/validate").get(search.validateQuery);
};
