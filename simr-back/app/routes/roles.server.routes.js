// Invocar el modo 'strict' de JavaScript
"use strict";

// Cargar los módulos necesarios
const users = require("../controllers/users.server.controller");
const { checkPermission } = require("../middleware/authorization");

// Define el método routes module
module.exports = function (app) {
  // Rutas para gestión de roles (solo administradores)
  app
    .route("/api/roles")
    .get(users.requiresLogin, checkPermission("user", "read"), (req, res) => {
      // Devolver lista de roles disponibles
      const roles = [
        {
          id: "user",
          name: "Usuario",
          description: "Usuario básico con permisos de lectura",
        },
        {
          id: "editor",
          name: "Editor",
          description: "Puede crear y editar sus propios recursos",
        },
        {
          id: "admin",
          name: "Administrador",
          description: "Control total sobre todos los recursos",
        },
      ];

      res.json({
        success: true,
        data: roles,
      });
    });

  // Ruta para actualizar rol de usuario (solo administradores)
  app
    .route("/api/users/:userId/role")
    .put(
      users.requiresLogin,
      checkPermission("user", "update"),
      async (req, res) => {
        try {
          const User = require("mongoose").model("User");
          const { role } = req.body;

          // Validar rol
          const validRoles = ["user", "editor", "admin"];
          if (!validRoles.includes(role)) {
            return res.status(400).json({
              success: false,
              message: "Rol inválido",
            });
          }

          // Solo administradores pueden cambiar roles a admin
          if (role === "admin" && req.user.role !== "admin") {
            return res.status(403).json({
              success: false,
              message: "No tienes permisos para asignar rol de administrador",
            });
          }

          // Actualizar rol del usuario
          const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role },
            { new: true }
          );

          if (!user) {
            return res.status(404).json({
              success: false,
              message: "Usuario no encontrado",
            });
          }

          res.json({
            success: true,
            message: "Rol actualizado exitosamente",
            data: user.getSafeUser(),
          });
        } catch (error) {
          console.error("Error updating role:", error);
          res.status(500).json({
            success: false,
            message: "Error interno del servidor",
          });
        }
      }
    );

  // Ruta para obtener permisos del usuario actual
  app.route("/api/permissions").get(users.requiresLogin, (req, res) => {
    const ac = require("../../config/accessControl");
    const userRole = req.user.role || "user";

    // Obtener todos los permisos del rol
    const permissions = {};

    // Recursos disponibles
    const resources = [
      "user",
      "obra",
      "recurso",
      "proyecto",
      "medio",
      "sistema",
      "coleccion",
      "ejemplar",
      "genero",
      "materia",
      "instrumento",
      "fondo",
      "archivo",
      "diccionario",
      "idioma",
    ];

    // Acciones disponibles
    const actions = ["create", "read", "update", "delete"];

    resources.forEach((resource) => {
      permissions[resource] = {};
      actions.forEach((action) => {
        // Verificar permisos 'any' primero
        let permission = ac.can(userRole)[action + "Any"](resource);
        if (permission.granted) {
          permissions[resource][action] = "any";
        } else {
          // Verificar permisos 'own'
          permission = ac.can(userRole)[action + "Own"](resource);
          if (permission.granted) {
            permissions[resource][action] = "own";
          } else {
            permissions[resource][action] = false;
          }
        }
      });
    });

    res.json({
      success: true,
      data: {
        role: userRole,
        permissions,
      },
    });
  });
};
