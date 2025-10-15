"use strict";

angular.module("core").factory("Authorization", [
  "Authentication",
  function (Authentication) {
    const service = {
      canCreate: canCreate,
      canEdit: canEdit,
      canDelete: canDelete,
      canList: canList,
      isAdmin: isAdmin,
      hasRole: hasRole,
      hasAnyRole: hasAnyRole,
      isOnlyRole: isOnlyRole,
      requireAuth: requireAuth,
      requirePermission: requirePermission,
    };

    return service;

    // Funciones de verificación de permisos

    function canCreate(resource) {
      if (
        !Authentication.state.currentUser ||
        !Authentication.state.currentUser.roles
      ) {
        return false;
      }

      // Admin siempre puede crear todo
      if (isAdmin()) {
        return true;
      }

      // Lector NO puede crear nada
      if (isOnlyRole("lector")) {
        return false;
      }

      // Investigador NO puede crear (solo consultar)
      if (isOnlyRole("investigador")) {
        return false;
      }

      // Catalogador, Bibliotecólogo y Admin pueden crear
      return hasAnyRole(["catalogador", "bibliotecologo", "admin"]);
    }

    function canEdit(resource) {
      // Por ahora, mismos permisos que crear
      return canCreate(resource);
    }

    function canDelete(resource) {
      // Por ahora, mismos permisos que crear
      return canCreate(resource);
    }

    function canList(resource) {
      // Todos los usuarios autenticados pueden listar/consultar
      return Authentication.state.isAuthenticated;
    }

    function isAdmin() {
      if (
        !Authentication.state.currentUser ||
        !Authentication.state.currentUser.roles
      ) {
        return false;
      }
      return Authentication.state.currentUser.roles.some(function (role) {
        return role.name === "admin" || role === "admin";
      });
    }

    function hasRole(roleName) {
      if (
        !Authentication.state.currentUser ||
        !Authentication.state.currentUser.roles
      ) {
        return false;
      }
      return Authentication.state.currentUser.roles.some(function (role) {
        return role.name === roleName || role === roleName;
      });
    }

    function hasAnyRole(roleNames) {
      if (
        !Authentication.state.currentUser ||
        !Authentication.state.currentUser.roles
      ) {
        return false;
      }
      return roleNames.some(function (roleName) {
        return hasRole(roleName);
      });
    }

    function isOnlyRole(roleName) {
      if (
        !Authentication.state.currentUser ||
        !Authentication.state.currentUser.roles
      ) {
        return false;
      }
      // Verifica si SOLO tiene este rol y ningún otro de mayor jerarquía
      const userRoles = Authentication.state.currentUser.roles.map(function (
        role
      ) {
        return role.name || role;
      });

      return (
        userRoles.includes(roleName) &&
        !userRoles.includes("admin") &&
        !userRoles.includes("bibliotecologo") &&
        !userRoles.includes("catalogador") &&
        (roleName === "investigador"
          ? !userRoles.includes("catalogador")
          : true)
      );
    }

    // Funciones para guards de rutas

    function requireAuth() {
      return Authentication.state.isAuthenticated;
    }

    function requirePermission(permission, resource) {
      if (!Authentication.state.isAuthenticated) {
        return false;
      }

      switch (permission) {
        case "create":
          return canCreate(resource);
        case "edit":
          return canEdit(resource);
        case "delete":
          return canDelete(resource);
        case "list":
        case "read":
          return canList(resource);
        case "admin":
          return isAdmin();
        default:
          return false;
      }
    }
  },
]);
