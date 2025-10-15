/**
 * Rutas de Roles para SIMR
 * Define todos los endpoints relacionados con gestión de roles
 */

"use strict";

const rolesController = require("../controllers/roles.server.controller");
const { isAdmin, authorize } = require("../middleware/authorize.middleware");
const passport = require("passport");

// Middleware de autenticación JWT
const requireAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  // ========================================
  // RUTAS DE GESTIÓN DE ROLES
  // ========================================

  // Listar todos los roles y crear nuevo rol
  app
    .route("/api/roles")
    .get(requireAuth, authorize("role", "read"), rolesController.list)
    .post(requireAuth, isAdmin, rolesController.create);

  // Obtener recursos disponibles
  app
    .route("/api/roles/resources")
    .get(requireAuth, rolesController.getResources);

  // Obtener solo roles del sistema
  app
    .route("/api/roles/system")
    .get(requireAuth, rolesController.getSystemRoles);

  // Operaciones sobre un rol específico
  app
    .route("/api/roles/:roleId")
    .get(requireAuth, authorize("role", "read"), rolesController.read)
    .put(requireAuth, isAdmin, rolesController.update)
    .delete(requireAuth, isAdmin, rolesController.delete);

  // ========================================
  // RUTAS DE ASIGNACIÓN DE ROLES A USUARIOS
  // ========================================

  // Asignar rol a usuario
  app
    .route("/api/users/:userId/roles/:roleId")
    .post(requireAuth, isAdmin, rolesController.assignRoleToUser)
    .delete(requireAuth, isAdmin, rolesController.removeRoleFromUser);

  // Obtener y actualizar roles de un usuario
  app
    .route("/api/users/:userId/roles")
    .get(requireAuth, authorize("user", "read"), rolesController.getUserRoles)
    .put(requireAuth, isAdmin, rolesController.updateUserRoles);

  // ========================================
  // MIDDLEWARE PARAMETERS
  // ========================================

  // Middleware para cargar rol por ID en req.role
  app.param("roleId", rolesController.roleByID);
};
