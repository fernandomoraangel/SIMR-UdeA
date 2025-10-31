"use strict";

// Cargar dependencias
const passport = require("passport");
const graph = require("../../app/controllers/graph.server.controller");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

// Definir el método routes del módulo
module.exports = function (app) {
  // Ruta para obtener metadatos del grafo (sin autenticación requerida)
  app.get("/api/graph/metadata", graph.getGraphMetadata);

  // Ruta para obtener estadísticas del grafo
  app.route("/api/graph/stats").get(requireAuth, graph.getGraphStats);

  // Ruta principal para obtener datos del grafo
  app.route("/api/graph/data").get(requireAuth, graph.getGraphData);
};
