"use strict";

const sesionUsoController = require("../controllers/usos/sesion-uso.server.controller");
const requireAuth = require("../middleware/requireAuth");

module.exports = function (app) {
  app
    .route("/api/usos")
    .get(requireAuth, sesionUsoController.obtenerSesiones);

  app
    .route("/api/usos/estadisticas")
    .get(requireAuth, sesionUsoController.obtenerEstadisticas);

  // Alias para estadísticas de uso (formato esperado por el frontend)
  app
    .route("/api/stats/usage")
    .get(requireAuth, sesionUsoController.obtenerEstadisticas);

  app
    .route("/api/usos")
    .post(requireAuth, sesionUsoController.crearSesion);

  app
    .route("/api/usos/:id")
    .get(requireAuth, sesionUsoController.obtenerSesion);

  app
    .route("/api/usos/:id/cerrar")
    .put(requireAuth, sesionUsoController.cerrarSesion);

  app
    .route("/api/usos/:id")
    .delete(requireAuth, sesionUsoController.eliminarSesion);

  app
    .route("/api/usos/limpiar")
    .delete(requireAuth, sesionUsoController.limpiarSesiones);
};