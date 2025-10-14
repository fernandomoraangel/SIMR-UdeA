// Middleware de autorización usando AccessControl
const ac = require("../../config/accessControl");

// Middleware para verificar permisos
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    try {
      // Obtener el rol del usuario desde req.user (establecido por el middleware de autenticación)
      const userRole = req.user?.role || "user";

      // Verificar permiso usando AccessControl
      const permission = ac.can(userRole)[action](resource);

      if (!permission.granted) {
        return res.status(403).json({
          success: false,
          message: `No tienes permisos para ${action} ${resource}`,
        });
      }

      // Agregar información de permisos al request para uso posterior
      req.permission = permission;
      next();
    } catch (error) {
      console.error("Error en checkPermission:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
};

// Middleware para verificar propiedad del recurso (own vs any)
const checkOwnership = (resource, action) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || "user";
      const userId = req.user?._id;

      // Primero intentar con permisos 'any' (para admin/editor)
      let permission = ac.can(userRole)[action + "Any"](resource);

      if (permission.granted) {
        req.permission = permission;
        req.ownership = "any";
        return next();
      }

      // Si no tiene permisos 'any', verificar 'own'
      permission = ac.can(userRole)[action + "Own"](resource);

      if (permission.granted) {
        req.permission = permission;
        req.ownership = "own";
        // Aquí podrías agregar lógica adicional para verificar que el recurso pertenece al usuario
        // Por ejemplo: if (resource.creator !== userId) return forbidden
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `No tienes permisos para ${action} ${resource}`,
      });
    } catch (error) {
      console.error("Error en checkOwnership:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
};

// Middleware específico para recursos con propiedad
const requireOwnership = (resource, action, ownershipField = "createdBy") => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role || "user";
      const userId = req.user?._id;

      // Verificar permisos 'any' primero
      let permission = ac.can(userRole)[action + "Any"](resource);

      if (permission.granted) {
        req.permission = permission;
        req.ownership = "any";
        return next();
      }

      // Verificar permisos 'own'
      permission = ac.can(userRole)[action + "Own"](resource);

      if (permission.granted) {
        req.permission = permission;
        req.ownership = "own";

        // Verificar que el recurso pertenece al usuario
        // Esto requiere que el controlador pase el ID del creador o similar
        // Por ahora, asumimos que se verifica en el controlador específico
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `No tienes permisos para ${action} ${resource}`,
      });
    } catch (error) {
      console.error("Error en requireOwnership:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
};

// Función helper para verificar permisos sin middleware
const hasPermission = (userRole, resource, action, ownership = "any") => {
  try {
    const actionWithOwnership =
      ownership === "any" ? action + "Any" : action + "Own";
    const permission = ac.can(userRole)[actionWithOwnership](resource);
    return permission.granted;
  } catch (error) {
    console.error("Error en hasPermission:", error);
    return false;
  }
};

module.exports = {
  checkPermission,
  checkOwnership,
  requireOwnership,
  hasPermission,
  ac, // Exportar instancia de AccessControl para uso directo
};
