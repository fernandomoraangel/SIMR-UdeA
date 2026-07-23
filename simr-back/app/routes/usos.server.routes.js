"use strict";

const passport = require("passport");
const sesionUsoController = require("../controllers/usos/sesion-uso.server.controller");
const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  // Rutas específicas (deben ir ANTES de /:id)
  app
    .route("/api/usos/estadisticas")
    .get(requireAuth, sesionUsoController.obtenerEstadisticas);

  app
    .route("/api/stats/usage")
    .get(requireAuth, sesionUsoController.obtenerEstadisticas);

  app
    .route("/api/usos/accion")
    .post(requireAuth, sesionUsoController.registrarAccion);

  app
    .route("/api/usos/limpiar")
    .delete(requireAuth, sesionUsoController.limpiarSesiones);

  app
    .route("/api/usos")
    .get(requireAuth, sesionUsoController.obtenerSesiones)
    .post(requireAuth, sesionUsoController.crearSesion);

  app
    .route("/api/usos/:id/cerrar")
    .put(requireAuth, sesionUsoController.cerrarSesion);

  app
    .route("/api/usos/:id")
    .get(requireAuth, sesionUsoController.obtenerSesion)
    .delete(requireAuth, sesionUsoController.eliminarSesion);
};