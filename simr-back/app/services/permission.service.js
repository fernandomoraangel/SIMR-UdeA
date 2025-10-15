/**
 * Servicio de Permisos para SIMR
 *
 * Proporciona funciones centralizadas para verificar permisos de usuarios
 * con sistema de caché en memoria para optimizar rendimiento.
 */

"use strict";

const mongoose = require("mongoose");

class PermissionService {
  constructor() {
    // Caché de permisos en memoria con TTL de 5 minutos
    this.permissionCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutos en milisegundos
  }

  /**
   * Obtiene todos los permisos de un usuario (combinando todos sus roles)
   * @param {Object|String} user - Objeto de usuario o ID
   * @returns {Promise<Map>} Map de recursos con sus permisos
   */
  async getUserPermissions(user) {
    const userId = typeof user === "string" ? user : user._id.toString();

    // Verificar caché
    const cached = this.permissionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.permissions;
    }

    // Obtener usuario con roles populated
    const User = mongoose.model("User");
    const userDoc = await User.findById(userId).populate("roles").exec();

    if (!userDoc || !userDoc.roles || userDoc.roles.length === 0) {
      return new Map(); // Usuario sin roles
    }

    // Combinar permisos de todos los roles
    const combinedPermissions = new Map();

    for (const role of userDoc.roles) {
      if (!role.isActive) continue; // Ignorar roles inactivos

      const allRolePermissions = await role.getAllPermissions();

      for (const perm of allRolePermissions) {
        const existing = combinedPermissions.get(perm.resource);

        if (!existing) {
          // No existe, agregar directamente
          combinedPermissions.set(perm.resource, perm);
        } else {
          // Ya existe, combinar acciones dando prioridad a "any" sobre "own"
          const mergedActions = new Map(existing.actions);

          for (const [action, scope] of perm.actions) {
            const existingScope = mergedActions.get(action);

            if (!existingScope || scope === "any") {
              // Si no existe o el nuevo es "any", actualizamos
              mergedActions.set(action, scope);
            }
          }

          combinedPermissions.set(perm.resource, {
            resource: perm.resource,
            actions: mergedActions,
          });
        }
      }
    }

    // Agregar permisos personalizados del usuario si existen
    if (userDoc.customPermissions && userDoc.customPermissions.length > 0) {
      for (const perm of userDoc.customPermissions) {
        const existing = combinedPermissions.get(perm.resource);

        if (!existing) {
          combinedPermissions.set(perm.resource, perm);
        } else {
          const mergedActions = new Map(existing.actions);
          for (const [action, scope] of perm.actions) {
            mergedActions.set(action, scope);
          }
          combinedPermissions.set(perm.resource, {
            resource: perm.resource,
            actions: mergedActions,
          });
        }
      }
    }

    // Guardar en caché
    this.permissionCache.set(userId, {
      permissions: combinedPermissions,
      timestamp: Date.now(),
    });

    return combinedPermissions;
  }

  /**
   * Verifica si un usuario tiene permiso para realizar una acción en un recurso
   * @param {Object|String} user - Objeto de usuario o ID
   * @param {String} resource - Nombre del recurso
   * @param {String} action - Acción a verificar (create, read, update, delete)
   * @param {String} scope - Alcance requerido ("any" o "own")
   * @returns {Promise<Boolean>} true si tiene permiso
   */
  async hasPermission(user, resource, action, scope = "any") {
    const permissions = await this.getUserPermissions(user);
    const resourcePerm = permissions.get(resource);

    if (!resourcePerm) return false;

    const actionScope = resourcePerm.actions.get(action);

    if (!actionScope) return false;

    // Si el permiso es "any", cubre tanto "any" como "own"
    if (actionScope === "any") return true;

    // Si el permiso es "own", solo permite operaciones con scope "own"
    if (actionScope === "own" && scope === "own") return true;

    return false;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {Object|String} user - Objeto de usuario o ID
   * @param {String} roleName - Nombre del rol
   * @returns {Promise<Boolean>} true si tiene el rol
   */
  async hasRole(user, roleName) {
    const User = mongoose.model("User");
    const userId = typeof user === "string" ? user : user._id;

    const userDoc = await User.findById(userId).populate("roles").exec();

    if (!userDoc || !userDoc.roles) return false;

    return userDoc.roles.some(
      (role) => role.name === roleName && role.isActive
    );
  }

  /**
   * Verifica si el usuario es administrador
   * @param {Object|String} user - Objeto de usuario o ID
   * @returns {Promise<Boolean>} true si es admin
   */
  async isAdmin(user) {
    return this.hasRole(user, "admin");
  }

  /**
   * Invalida el caché de permisos de un usuario
   * Debe llamarse cuando se modifican roles o permisos
   * @param {String} userId - ID del usuario
   */
  invalidateUserCache(userId) {
    this.permissionCache.delete(userId);
  }

  /**
   * Invalida todo el caché
   * Útil cuando se modifican roles del sistema
   */
  invalidateAllCache() {
    this.permissionCache.clear();
  }

  /**
   * Limpia entradas expiradas del caché
   * Llamado periódicamente para liberar memoria
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [userId, cached] of this.permissionCache.entries()) {
      if (now - cached.timestamp >= this.cacheTTL) {
        this.permissionCache.delete(userId);
      }
    }
  }
}

// Singleton: Exportar una única instancia
const permissionService = new PermissionService();

// Limpiar caché expirado cada 10 minutos
setInterval(() => {
  permissionService.cleanExpiredCache();
}, 10 * 60 * 1000);

module.exports = permissionService;
