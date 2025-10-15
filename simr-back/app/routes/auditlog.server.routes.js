/**
 * Rutas de Auditoría para SIMR
 * Define endpoints para consultar logs de auditoría del sistema de roles
 */

"use strict";

const auditlogController = require("../controllers/auditlog.server.controller");
const { isAdmin, authorize } = require("../middleware/authorize.middleware");
const passport = require("passport");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  // ========================================
  // RUTAS DE CONSULTA DE LOGS
  // ========================================

  // Listar logs con filtros
  app
    .route("/api/auditlogs")
    .get(requireAuth, isAdmin, auditlogController.list);

  // Obtener estadísticas de auditoría
  app
    .route("/api/auditlogs/stats")
    .get(requireAuth, isAdmin, auditlogController.getStats);

  // Obtener logs de un usuario específico
  app
    .route("/api/auditlogs/user/:userId")
    .get(
      requireAuth,
      authorize("user", "read"),
      auditlogController.getUserLogs
    );

  // Obtener logs de un rol específico
  app
    .route("/api/auditlogs/role/:roleId")
    .get(
      requireAuth,
      authorize("role", "read"),
      auditlogController.getRoleLogs
    );

  // Obtener logs por tipo de acción
  app
    .route("/api/auditlogs/action/:action")
    .get(requireAuth, isAdmin, auditlogController.getActionLogs);

  // ========================================
  // RUTAS DE MANTENIMIENTO (SOLO ADMIN)
  // ========================================

  // Limpiar logs antiguos
  app
    .route("/api/auditlogs/clean")
    .post(requireAuth, isAdmin, auditlogController.cleanOldLogs);
};
