/**
 * Middleware de Autorización para SIMR
 *
 * Proporciona funciones middleware para verificar permisos en rutas protegidas.
 * Se usa DESPUÉS del middleware de autenticación (passport).
 */

"use strict";

const permissionService = require("../services/permission.service");

/**
 * Middleware genérico de autorización
 * Verifica si el usuario autenticado tiene permiso para realizar una acción en un recurso
 *
 * @param {String} resource - Nombre del recurso
 * @param {String} action - Acción requerida (create, read, update, delete)
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.checkOwnership - Función para verificar si el recurso pertenece al usuario
 * @returns {Function} Middleware function
 */
const authorize = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado. Se requiere inicio de sesión.",
        });
      }

      // Verificar primero si tiene permiso "any" (acceso total)
      const hasAnyPermission = await permissionService.hasPermission(
        req.user,
        resource,
        action,
        "any"
      );

      if (hasAnyPermission) {
        return next(); // Permiso concedido
      }

      // Si no tiene permiso "any", verificar permiso "own"
      const hasOwnPermission = await permissionService.hasPermission(
        req.user,
        resource,
        action,
        "own"
      );

      if (hasOwnPermission) {
        // Verificar ownership si se proporcionó la función
        if (
          options.checkOwnership &&
          typeof options.checkOwnership === "function"
        ) {
          const isOwner = await options.checkOwnership(req);

          if (isOwner) {
            return next(); // Es dueño del recurso
          } else {
            return res.status(403).json({
              success: false,
              message:
                "No autorizado. Solo puedes realizar esta acción en tus propios recursos.",
            });
          }
        } else {
          // No hay forma de verificar ownership, denegar por seguridad
          return res.status(403).json({
            success: false,
            message: "No autorizado. Configuración de ownership no disponible.",
          });
        }
      }

      // No tiene ningún permiso
      return res.status(403).json({
        success: false,
        message: `No autorizado. Requiere permiso de ${action} en ${resource}.`,
      });
    } catch (error) {
      console.error("Error en middleware de autorización:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario tiene un rol específico
 * @param {String|Array} roles - Rol o array de roles permitidos
 * @returns {Function} Middleware function
 */
const hasRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado.",
        });
      }

      // Verificar si el usuario tiene alguno de los roles permitidos
      for (const roleName of allowedRoles) {
        const hasRoleResult = await permissionService.hasRole(
          req.user,
          roleName
        );
        if (hasRoleResult) {
          return next(); // Tiene el rol
        }
      }

      return res.status(403).json({
        success: false,
        message: `No autorizado. Se requiere uno de los siguientes roles: ${allowedRoles.join(
          ", "
        )}`,
      });
    } catch (error) {
      console.error("Error en middleware hasRole:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar rol",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario es administrador
 * @returns {Function} Middleware function
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autenticado.",
      });
    }

    const adminStatus = await permissionService.isAdmin(req.user);

    if (adminStatus) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "No autorizado. Se requieren privilegios de administrador.",
    });
  } catch (error) {
    console.error("Error en middleware isAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar privilegios de administrador",
      error: error.message,
    });
  }
};

/**
 * Middleware para verificar múltiples permisos (AND lógico)
 * @param {Array} permissions - Array de objetos { resource, action }
 * @returns {Function} Middleware function
 */
const hasAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado.",
        });
      }

      for (const { resource, action } of permissions) {
        const hasPermission = await permissionService.hasPermission(
          req.user,
          resource,
          action,
          "any"
        );

        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: `No autorizado. Requiere permiso de ${action} en ${resource}.`,
          });
        }
      }

      return next(); // Tiene todos los permisos
    } catch (error) {
      console.error("Error en middleware hasAllPermissions:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR lógico)
 * @param {Array} permissions - Array de objetos { resource, action }
 * @returns {Function} Middleware function
 */
const hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado.",
        });
      }

      for (const { resource, action } of permissions) {
        const hasPermission = await permissionService.hasPermission(
          req.user,
          resource,
          action,
          "any"
        );

        if (hasPermission) {
          return next(); // Tiene al menos un permiso
        }
      }

      return res.status(403).json({
        success: false,
        message: "No autorizado. No tienes ninguno de los permisos requeridos.",
      });
    } catch (error) {
      console.error("Error en middleware hasAnyPermission:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
        error: error.message,
      });
    }
  };
};

module.exports = {
  authorize,
  hasRole,
  isAdmin,
  hasAllPermissions,
  hasAnyPermission,
};
