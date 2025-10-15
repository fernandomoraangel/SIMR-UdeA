// Servicio de permisos para AngularJS
angular
  .module("permissions", [])

  .factory("PermissionsService", [
    "$http",
    function ($http) {
      var permissions = null;
      var userRole = null;

      return {
        // Cargar permisos del usuario actual
        loadPermissions: function () {
          return $http.get("/api/permissions").then(function (response) {
            permissions = response.data.data.permissions;
            userRole = response.data.data.role;
            console.log("[Permissions] Permisos cargados:", permissions);
            console.log("[Permissions] Rol del usuario:", userRole);
            return response.data.data;
          });
        },

        // Obtener permisos actuales
        getPermissions: function () {
          return permissions;
        },

        // Obtener rol del usuario
        getUserRole: function () {
          return userRole;
        },

        // Verificar si el usuario tiene un permiso específico
        hasPermission: function (resource, action) {
          if (!permissions || !permissions[resource]) {
            console.log(
              "[Permissions] No hay permisos para recurso:",
              resource
            );
            return false;
          }
          var hasIt = permissions[resource][action] !== false;
          console.log(
            "[Permissions] hasPermission(" + resource + ", " + action + "):",
            hasIt
          );
          return hasIt;
        },

        // Verificar si el usuario tiene permisos 'any' para un recurso y acción
        hasAnyPermission: function (resource, action) {
          if (!permissions || !permissions[resource]) {
            return false;
          }
          return permissions[resource][action] === "any";
        },

        // Verificar si el usuario tiene permisos 'own' para un recurso y acción
        hasOwnPermission: function (resource, action) {
          if (!permissions || !permissions[resource]) {
            return false;
          }
          return permissions[resource][action] === "own";
        },

        // Verificar si el usuario es administrador
        isAdmin: function () {
          return userRole === "admin";
        },

        // Verificar si el usuario es editor
        isEditor: function () {
          return userRole === "editor";
        },

        // Verificar si el usuario es usuario básico
        isUser: function () {
          return userRole === "user";
        },
      };
    },
  ])

  // Directiva para mostrar/ocultar elementos según permisos
  .directive("hasPermission", [
    "PermissionsService",
    function (PermissionsService) {
      return {
        restrict: "A",
        link: function (scope, element, attrs) {
          var permission = attrs.hasPermission;
          var parts = permission.split(":");
          var resource = parts[0];
          var action = parts[1];

          function updateVisibility() {
            if (PermissionsService.hasPermission(resource, action)) {
              element.show();
            } else {
              element.hide();
            }
          }

          // Verificar permisos inicialmente
          updateVisibility();

          // Escuchar cambios en permisos (si se recargan)
          scope.$watch(
            function () {
              return PermissionsService.getPermissions();
            },
            function (newPermissions) {
              if (newPermissions) {
                updateVisibility();
              }
            }
          );
        },
      };
    },
  ])

  // Directiva para mostrar/ocultar elementos solo para administradores
  .directive("adminOnly", [
    "PermissionsService",
    function (PermissionsService) {
      return {
        restrict: "A",
        link: function (scope, element, attrs) {
          function updateVisibility() {
            if (PermissionsService.isAdmin()) {
              element.show();
            } else {
              element.hide();
            }
          }

          updateVisibility();

          scope.$watch(
            function () {
              return PermissionsService.getUserRole();
            },
            function (newRole) {
              if (newRole) {
                updateVisibility();
              }
            }
          );
        },
      };
    },
  ])

  // Directiva para mostrar/ocultar elementos solo para editores o administradores
  .directive("editorOnly", [
    "PermissionsService",
    function (PermissionsService) {
      return {
        restrict: "A",
        link: function (scope, element, attrs) {
          function updateVisibility() {
            if (PermissionsService.isAdmin() || PermissionsService.isEditor()) {
              element.show();
            } else {
              element.hide();
            }
          }

          updateVisibility();

          scope.$watch(
            function () {
              return PermissionsService.getUserRole();
            },
            function (newRole) {
              if (newRole) {
                updateVisibility();
              }
            }
          );
        },
      };
    },
  ])

  // Servicio para gestión de roles (solo administradores)
  .factory("RolesService", [
    "$http",
    function ($http) {
      return {
        // Obtener lista de roles disponibles
        getRoles: function () {
          return $http.get("/api/roles");
        },

        // Actualizar rol de un usuario
        updateUserRole: function (userId, role) {
          return $http.put("/api/users/" + userId + "/role", { role: role });
        },
      };
    },
  ]);
