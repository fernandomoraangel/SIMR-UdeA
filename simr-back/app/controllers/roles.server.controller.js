/**
 * Controlador de Roles para SIMR
 * Maneja todas las operaciones CRUD de roles y asignación a usuarios
 */

"use strict";

const mongoose = require("mongoose");
const Role = mongoose.model("Role");
const User = mongoose.model("User");
const AuditLog = mongoose.model("AuditLog");
const permissionService = require("../services/permission.service");

// Funciones helper para respuestas estandarizadas
const successResponse = (res, message, statusCode = 200, data = null) => {
  const response = { success: true, message };
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 400, details = null) => {
  const response = { success: false, message };
  if (details) response.details = details;
  return res.status(statusCode).json(response);
};

// Función helper para registrar auditoría
const logAudit = async (
  action,
  performedBy,
  targetRole,
  targetUser,
  changes,
  req
) => {
  try {
    const auditData = {
      action,
      performedBy,
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      success: true,
    };

    // Solo agregar targetRole si existe
    if (targetRole) {
      auditData.targetRole = targetRole;
    }

    // Solo agregar targetUser si existe
    if (targetUser) {
      auditData.targetUser = targetUser;
    }

    // Solo agregar changes si existe
    if (changes) {
      auditData.changes = changes;
    }

    await AuditLog.create(auditData);
  } catch (error) {
    console.error("Error al crear log de auditoría:", error);
    console.error("Datos que causaron el error:", {
      action,
      performedBy,
      targetRole,
      targetUser,
      changes: JSON.stringify(changes),
    });
  }
};

//* CREATE - Crear un nuevo rol
exports.create = async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      permissions,
      inheritsFrom,
      priority,
      isSystem,
    } = req.body;

    // Validaciones
    if (!name) {
      return errorResponse(res, "El nombre del rol es requerido", 400);
    }

    // Verificar si ya existe un rol con ese nombre
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return errorResponse(res, "Ya existe un rol con ese nombre", 409);
    }

    // Transformar permisos del formato frontend al formato del modelo
    // Frontend: { "obras": { "read": ["own", "any"], "update": ["own"] } }
    // Modelo: [{ resource: "obra", actions: { read: "any", update: "own" } }]

    // Mapeo de nombres plural (frontend) a singular (modelo)
    const resourceNameMap = {
      obras: "obra",
      actores: "actor",
      recursos: "recurso",
      ejemplares: "ejemplar",
      proyectos: "proyecto",
      fondos: "fondo",
      colecciones: "coleccion",
      medios: "medio",
      sistemas: "sistema",
      materias: "materia",
      generos: "genero",
      generosNoMusicales: "genero_no_musical",
      instrumentos: "instrumento",
      idiomas: "idioma",
      diccionarios: "diccionario",
      archivos: "archivo",
      users: "user",
      roles: "role",
    };

    const transformedPermissions = [];
    if (permissions && typeof permissions === "object") {
      Object.keys(permissions).forEach((resourceName) => {
        const actions = permissions[resourceName];
        const transformedActions = {};

        // Convertir cada acción
        Object.keys(actions).forEach((actionName) => {
          const scopes = actions[actionName];
          // Si tiene "any", usar "any", sino usar "own"
          if (Array.isArray(scopes)) {
            transformedActions[actionName] = scopes.includes("any")
              ? "any"
              : "own";
          }
        });

        // Solo agregar si tiene acciones
        if (Object.keys(transformedActions).length > 0) {
          // Convertir nombre del recurso de plural a singular
          const singularResourceName =
            resourceNameMap[resourceName] || resourceName;
          transformedPermissions.push({
            resource: singularResourceName,
            actions: transformedActions,
          });
        }
      });
    }

    // Crear el rol
    const newRole = await Role.create({
      name,
      displayName,
      description,
      permissions: transformedPermissions,
      inheritsFrom: inheritsFrom || [],
      priority: priority || 0,
      isSystem: isSystem || false,
      createdBy: req.user._id,
    });

    // Registrar auditoría
    await logAudit(
      "role_created",
      req.user._id,
      newRole._id,
      null,
      newRole.toObject(),
      req
    );

    console.log("Auditoría registrada");

    // Invalidar caché de permisos
    permissionService.invalidateAllCache();

    successResponse(res, "Rol creado exitosamente", 201, newRole);
  } catch (err) {
    console.error("ERROR AL CREAR ROL:", err);
    console.error("Stack trace:", err.stack);
    errorResponse(res, "Error al crear el rol", 500, { error: err.message });
  }
};

//* LIST - Listar todos los roles
exports.list = async (req, res) => {
  try {
    const { includeInactive } = req.query;

    const filter = includeInactive === "true" ? {} : { isActive: true };
    const roles = await Role.find(filter)
      .populate("inheritsFrom", "name description")
      .populate("createdBy", "firstName lastName email")
      .sort({ priority: -1, name: 1 });

    successResponse(res, "Roles recuperados exitosamente", 200, roles);
  } catch (err) {
    errorResponse(res, "Error al recuperar roles", 500, { error: err.message });
  }
};

//* READ - Obtener un rol por ID
exports.read = async (req, res) => {
  try {
    const role = req.role; // Viene del middleware roleByID
    const allPermissions = await role.getAllPermissions();

    // Transformar permisos del formato del modelo al formato del frontend
    // Modelo: [{ resource: "obra", actions: { read: "any", update: "own" } }]
    // Frontend: { "obras": { "read": ["any"], "update": ["own"] } }

    const resourceNameMapReverse = {
      obra: "obras",
      actor: "actores",
      recurso: "recursos",
      ejemplar: "ejemplares",
      proyecto: "proyectos",
      fondo: "fondos",
      coleccion: "colecciones",
      medio: "medios",
      sistema: "sistemas",
      materia: "materias",
      genero: "generos",
      genero_no_musical: "generosNoMusicales",
      instrumento: "instrumentos",
      idioma: "idiomas",
      diccionario: "diccionarios",
      archivo: "archivos",
      user: "users",
      role: "roles",
    };

    const frontendPermissions = {};
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach((permission) => {
        const pluralResourceName =
          resourceNameMapReverse[permission.resource] || permission.resource;
        frontendPermissions[pluralResourceName] = {};

        // Convertir Map de actions a objeto
        const actionsObj =
          permission.actions instanceof Map
            ? Object.fromEntries(permission.actions)
            : permission.actions;

        Object.keys(actionsObj || {}).forEach((actionName) => {
          const scope = actionsObj[actionName];
          frontendPermissions[pluralResourceName][actionName] = [scope];
        });
      });
    }

    const roleData = role.toObject();
    roleData.permissions = frontendPermissions;

    successResponse(res, "Rol recuperado exitosamente", 200, {
      ...roleData,
      allPermissions,
    });
  } catch (err) {
    console.error("ERROR AL LEER ROL:", err);
    errorResponse(res, "Error al recuperar el rol", 500, {
      error: err.message,
    });
  }
};

//* UPDATE - Actualizar un rol
exports.update = async (req, res) => {
  try {
    const role = req.role;

    // Los roles del sistema pueden editar permisos, herencia y estado, pero
    // no su nombre (name) ni su prioridad (priority), que son fijos.
    if (role.isSystem && (req.body.name !== undefined || req.body.priority !== undefined)) {
      return errorResponse(
        res,
        "No se puede modificar el nombre ni la prioridad de un rol del sistema",
        403
      );
    }

    const previousState = role.toObject();
    const {
      name,
      displayName,
      description,
      permissions,
      inheritsFrom,
      isActive,
      priority,
    } = req.body;

    // Mapeo de nombres plural (frontend) a singular (modelo)
    const resourceNameMap = {
      obras: "obra",
      actores: "actor",
      recursos: "recurso",
      ejemplares: "ejemplar",
      proyectos: "proyecto",
      fondos: "fondo",
      colecciones: "coleccion",
      medios: "medio",
      sistemas: "sistema",
      materias: "materia",
      generos: "genero",
      generosNoMusicales: "genero_no_musical",
      instrumentos: "instrumento",
      idiomas: "idioma",
      diccionarios: "diccionario",
      archivos: "archivo",
      users: "user",
      roles: "role",
    };

    // Transformar permisos si vienen del frontend
    let transformedPermissions = permissions;
    if (
      permissions &&
      typeof permissions === "object" &&
      !Array.isArray(permissions)
    ) {
      transformedPermissions = [];
      Object.keys(permissions).forEach((resourceName) => {
        const actions = permissions[resourceName];
        const transformedActions = {};

        // Convertir cada acción
        Object.keys(actions).forEach((actionName) => {
          const scopes = actions[actionName];
          // Si tiene "any", usar "any", sino usar "own"
          if (Array.isArray(scopes)) {
            transformedActions[actionName] = scopes.includes("any")
              ? "any"
              : "own";
          }
        });

        // Solo agregar si tiene acciones
        if (Object.keys(transformedActions).length > 0) {
          // Convertir nombre del recurso de plural a singular
          const singularResourceName =
            resourceNameMap[resourceName] || resourceName;
          transformedPermissions.push({
            resource: singularResourceName,
            actions: transformedActions,
          });
        }
      });
    }

    console.log(
      "Permisos transformados:",
      JSON.stringify(transformedPermissions, null, 2)
    );

    // Actualizar campos
    if (name !== undefined && !role.isSystem) role.name = name;
    if (displayName !== undefined) role.displayName = displayName;
    if (description !== undefined) role.description = description;
    if (transformedPermissions !== undefined)
      role.permissions = transformedPermissions;
    if (inheritsFrom !== undefined) role.inheritsFrom = inheritsFrom;
    if (isActive !== undefined) role.isActive = isActive;
    if (priority !== undefined && !role.isSystem) role.priority = priority;

    role.updatedBy = req.user._id;

    await role.save();

    // Registrar auditoría
    await logAudit(
      "role_updated",
      req.user._id,
      role._id,
      null,
      { previousState, newState: role.toObject() },
      req
    );

    // Invalidar caché de permisos
    permissionService.invalidateAllCache();

    successResponse(res, "Rol actualizado exitosamente", 200, role);
  } catch (err) {
    console.error("ERROR AL ACTUALIZAR ROL:", err);
    console.error("Stack trace:", err.stack);
    errorResponse(res, "Error al actualizar el rol", 500, {
      error: err.message,
    });
  }
};

//* DELETE - Eliminar un rol
exports.delete = async (req, res) => {
  try {
    const role = req.role;

    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      return errorResponse(res, "No se pueden eliminar roles del sistema", 403);
    }

    // Verificar si hay usuarios con este rol
    const usersWithRole = await User.countDocuments({ roles: role._id });
    if (usersWithRole > 0) {
      return errorResponse(
        res,
        `No se puede eliminar el rol. Hay ${usersWithRole} usuario(s) asignado(s) a este rol.`,
        409,
        { usersCount: usersWithRole }
      );
    }

    // Verificar si hay roles que heredan de este
    const rolesInheriting = await Role.countDocuments({
      inheritsFrom: role._id,
    });
    if (rolesInheriting > 0) {
      return errorResponse(
        res,
        `No se puede eliminar el rol. Hay ${rolesInheriting} rol(es) que heredan de este.`,
        409,
        { inheritingRolesCount: rolesInheriting }
      );
    }

    const deletedRole = role.toObject();
    await Role.deleteOne({ _id: role._id });

    // Registrar auditoría
    await logAudit(
      "role_deleted",
      req.user._id,
      role._id,
      null,
      deletedRole,
      req
    );

    // Invalidar caché de permisos
    permissionService.invalidateAllCache();

    successResponse(res, "Rol eliminado exitosamente", 200, {
      deletedRole,
    });
  } catch (err) {
    errorResponse(res, "Error al eliminar el rol", 500, {
      error: err.message,
    });
  }
};

//* GET RESOURCES - Obtener lista de recursos disponibles
exports.getResources = async (req, res) => {
  try {
    const resources = [
      {
        key: "user",
        name: "Usuarios",
        description: "Gestión de usuarios del sistema",
      },
      {
        key: "role",
        name: "Roles",
        description: "Gestión de roles y permisos",
      },
      { key: "obra", name: "Obras", description: "Gestión de obras musicales" },
      {
        key: "actor",
        name: "Actores",
        description: "Gestión de actores/artistas",
      },
      {
        key: "recurso",
        name: "Recursos",
        description: "Gestión de recursos musicales",
      },
      {
        key: "genero",
        name: "Géneros Musicales",
        description: "Gestión de géneros musicales",
      },
      {
        key: "genero_no_musical",
        name: "Géneros No Musicales",
        description: "Gestión de géneros no musicales",
      },
      {
        key: "instrumento",
        name: "Instrumentos",
        description: "Gestión de instrumentos musicales",
      },
      {
        key: "materia",
        name: "Materias",
        description: "Gestión de materias/temas",
      },
      {
        key: "medio",
        name: "Medios Sonoros",
        description: "Gestión de medios sonoros",
      },
      {
        key: "proyecto",
        name: "Proyectos",
        description: "Gestión de proyectos",
      },
      {
        key: "sistema",
        name: "Sistemas Sonoros",
        description: "Gestión de sistemas sonoros",
      },
      {
        key: "fondo",
        name: "Fondos",
        description: "Gestión de fondos documentales",
      },
      {
        key: "coleccion",
        name: "Colecciones",
        description: "Gestión de colecciones",
      },
      {
        key: "ejemplar",
        name: "Ejemplares",
        description: "Gestión de ejemplares",
      },
      { key: "idioma", name: "Idiomas", description: "Gestión de idiomas" },
      {
        key: "diccionario",
        name: "Diccionarios",
        description: "Gestión de diccionarios",
      },
      {
        key: "archivo",
        name: "Archivos",
        description: "Gestión de archivos adjuntos",
      },
    ];

    successResponse(
      res,
      "Recursos disponibles recuperados exitosamente",
      200,
      resources
    );
  } catch (err) {
    errorResponse(res, "Error al recuperar recursos", 500, {
      error: err.message,
    });
  }
};

//* GET SYSTEM ROLES - Obtener solo roles del sistema
exports.getSystemRoles = async (req, res) => {
  try {
    const systemRoles = await Role.find({ isSystem: true }).sort({ name: 1 });

    successResponse(
      res,
      "Roles del sistema recuperados exitosamente",
      200,
      systemRoles
    );
  } catch (err) {
    errorResponse(res, "Error al recuperar roles del sistema", 500, {
      error: err.message,
    });
  }
};

//* ASSIGN ROLE TO USER - Asignar rol a usuario
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Verificar que existan el usuario y el rol
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return errorResponse(res, "Rol no encontrado", 404);
    }

    if (!role.isActive) {
      return errorResponse(res, "El rol está inactivo", 400);
    }

    // Verificar si el usuario ya tiene el rol
    if (user.roles && user.roles.includes(roleId)) {
      return errorResponse(res, "El usuario ya tiene este rol asignado", 409);
    }

    // Asignar el rol
    if (!user.roles) user.roles = [];
    user.roles.push(roleId);
    await user.save();

    // Registrar auditoría
    await logAudit(
      "role_assigned",
      req.user._id,
      roleId,
      userId,
      { roleName: role.name, userName: `${user.firstName} ${user.lastName}` },
      req
    );

    // Invalidar caché del usuario
    permissionService.invalidateUserCache(userId);

    // Obtener usuario con roles populated
    const updatedUser = await User.findById(userId)
      .populate("roles", "name description")
      .select("-password");

    successResponse(res, "Rol asignado exitosamente", 200, updatedUser);
  } catch (err) {
    errorResponse(res, "Error al asignar rol", 500, { error: err.message });
  }
};

//* REMOVE ROLE FROM USER - Remover rol de usuario
exports.removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Verificar que existan el usuario y el rol
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return errorResponse(res, "Rol no encontrado", 404);
    }

    // Verificar si el usuario tiene el rol
    if (!user.roles || !user.roles.includes(roleId)) {
      return errorResponse(res, "El usuario no tiene este rol asignado", 404);
    }

    // Remover el rol
    user.roles = user.roles.filter((r) => r.toString() !== roleId);
    await user.save();

    // Registrar auditoría
    await logAudit(
      "role_removed",
      req.user._id,
      roleId,
      userId,
      { roleName: role.name, userName: `${user.firstName} ${user.lastName}` },
      req
    );

    // Invalidar caché del usuario
    permissionService.invalidateUserCache(userId);

    // Obtener usuario con roles populated
    const updatedUser = await User.findById(userId)
      .populate("roles", "name description")
      .select("-password");

    successResponse(res, "Rol removido exitosamente", 200, updatedUser);
  } catch (err) {
    errorResponse(res, "Error al remover rol", 500, { error: err.message });
  }
};

//* GET USER ROLES - Obtener roles de un usuario
exports.getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("roles", "name description permissions priority isActive")
      .select("firstName lastName email roles");

    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // Obtener permisos efectivos del usuario
    const effectivePermissions = await permissionService.getUserPermissions(
      userId
    );
    const permissionsArray = Array.from(effectivePermissions.values());

    successResponse(res, "Roles del usuario recuperados exitosamente", 200, {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      roles: user.roles || [],
      effectivePermissions: permissionsArray,
    });
  } catch (err) {
    errorResponse(res, "Error al recuperar roles del usuario", 500, {
      error: err.message,
    });
  }
};

//* UPDATE USER ROLES - Actualizar todos los roles de un usuario
exports.updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    // Validaciones
    if (!Array.isArray(roles)) {
      return errorResponse(res, "Se esperaba un array de IDs de roles", 400);
    }

    // Verificar que existe el usuario
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "Usuario no encontrado", 404);
    }

    // Verificar que todos los roles existen y están activos
    if (roles.length > 0) {
      const existingRoles = await Role.find({
        _id: { $in: roles },
        isActive: true,
      });

      if (existingRoles.length !== roles.length) {
        return errorResponse(
          res,
          "Uno o más roles no existen o están inactivos",
          400
        );
      }
    }

    // Guardar roles anteriores para auditoría
    const previousRoles = user.roles || [];

    // Actualizar roles
    user.roles = roles;
    await user.save();

    // Registrar auditoría
    await logAudit(
      "role_assigned",
      req.user._id,
      null,
      userId,
      {
        userName: `${user.firstName} ${user.lastName}`,
        previousRoles,
        newRoles: roles,
      },
      req
    );

    // Invalidar caché del usuario
    permissionService.invalidateUserCache(userId);

    // Obtener usuario con roles populated
    const updatedUser = await User.findById(userId)
      .populate("roles", "name displayName description priority")
      .select("-password");

    successResponse(res, "Roles actualizados exitosamente", 200, updatedUser);
  } catch (err) {
    errorResponse(res, "Error al actualizar roles del usuario", 500, {
      error: err.message,
    });
  }
};

//* MIDDLEWARE: Role By ID - Obtener rol por ID (para req.params.roleId)
exports.roleByID = async (req, res, next, id) => {
  try {
    const role = await Role.findById(id)
      .populate("inheritsFrom", "name description")
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!role) {
      return errorResponse(res, "Rol no encontrado", 404);
    }

    req.role = role;
    next();
  } catch (err) {
    errorResponse(res, "Rol inválido", 400, { error: err.message });
  }
};
