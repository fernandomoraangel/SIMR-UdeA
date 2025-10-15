/**
 * Controlador de Permisos para SIMR
 * Maneja las consultas de permisos del usuario actual
 */

"use strict";

const permissionService = require("../services/permission.service");
const mongoose = require("mongoose");

/**
 * Obtener permisos del usuario autenticado actual
 * GET /api/permissions
 */
exports.getMyPermissions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autenticado",
      });
    }

    // Obtener permisos del usuario
    const permissionsMap = await permissionService.getUserPermissions(req.user);

    // Convertir Map a objeto para el frontend
    const permissions = {};

    for (const [resource, permData] of permissionsMap) {
      permissions[resource] = {};

      // Convertir las acciones Map a objeto
      for (const [action, scope] of permData.actions) {
        permissions[resource][action] = scope; // "own" o "any"
      }
    }

    // Obtener el rol principal del usuario (el de mayor prioridad)
    const User = mongoose.model("User");
    const userDoc = await User.findById(req.user._id).populate("roles").exec();

    let primaryRole = "user"; // default
    if (userDoc && userDoc.roles && userDoc.roles.length > 0) {
      // Ordenar por prioridad (mayor primero)
      const sortedRoles = userDoc.roles
        .filter((r) => r.isActive)
        .sort((a, b) => b.priority - a.priority);

      if (sortedRoles.length > 0) {
        primaryRole = sortedRoles[0].name;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Permisos recuperados exitosamente",
      data: {
        permissions,
        role: primaryRole,
        userId: req.user._id,
      },
    });
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener permisos",
      error: error.message,
    });
  }
};
