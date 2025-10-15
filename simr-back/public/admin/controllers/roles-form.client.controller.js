"use strict";

angular.module("admin").controller("RolesFormController", [
  "$scope",
  "$location",
  "$routeParams",
  "$timeout",
  "AdminService",
  "Authentication",
  function (
    $scope,
    $location,
    $routeParams,
    $timeout,
    AdminService,
    Authentication
  ) {
    $scope.authentication = Authentication.state;
    $scope.loading = false;
    $scope.error = null;
    $scope.isEditMode = !!$routeParams.roleId;
    $scope.allRoles = [];
    $scope.selectedInherits = {};

    // Verificar autenticación
    if (!$scope.authentication.isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "Acceso Restringido",
        text: "Debe iniciar sesión para acceder a esta página",
        confirmButtonText: "Entendido",
      });
      $location.path("/");
      return;
    }

    // Recursos y acciones disponibles
    $scope.recursos = [
      "obras",
      "actores",
      "recursos",
      "ejemplares",
      "proyectos",
      "fondos",
      "colecciones",
      "medios",
      "sistemas",
      "materias",
      "generos",
      "instrumentos",
      "idiomas",
      "diccionarios",
      "generosNoMusicales",
      "archivos",
      "users",
      "roles",
    ];

    $scope.acciones = ["create", "read", "update", "delete", "list"];
    $scope.scopes = ["own", "any"];

    // Inicializar formulario
    $scope.role = {
      name: "",
      displayName: "",
      description: "",
      priority: 50,
      isSystem: false,
      inheritsFrom: [],
      permissions: {},
    };

    // Inicializar permisos vacíos para cada recurso
    $scope.recursos.forEach(function (recurso) {
      $scope.role.permissions[recurso] = {};
    });

    // Cargar todos los roles para herencia
    $scope.loadAllRoles = function () {
      AdminService.getAllRoles()
        .then(function (response) {
          if (response.success) {
            $scope.allRoles = response.data || [];
          }
        })
        .catch(function (err) {
          console.error("Error al cargar roles:", err);
        });
    };

    // Cargar rol si es modo edición
    $scope.loadRole = function () {
      if (!$scope.isEditMode) return;

      $scope.loading = true;
      AdminService.getRoleById($routeParams.roleId)
        .then(function (response) {
          if (response.success) {
            $scope.role = response.data;

            // Asegurar que permissions existe
            if (!$scope.role.permissions) {
              $scope.role.permissions = {};
            }

            // Inicializar permisos vacíos para recursos sin permisos
            $scope.recursos.forEach(function (recurso) {
              if (!$scope.role.permissions[recurso]) {
                $scope.role.permissions[recurso] = {};
              }
            });

            // Marcar roles heredados seleccionados
            if ($scope.role.inheritsFrom && $scope.role.inheritsFrom.length) {
              $scope.role.inheritsFrom.forEach(function (role) {
                const roleId = typeof role === "string" ? role : role._id;
                $scope.selectedInherits[roleId] = true;
              });
            }

            // Forzar actualización del formulario
            $timeout(function () {
              if ($scope.roleForm) {
                $scope.roleForm.$setPristine();
                $scope.roleForm.$setUntouched();
              }
            }, 0);
          } else {
            $scope.error = response.message || "Error al cargar rol";
          }
        })
        .catch(function (err) {
          console.error("Error al cargar rol:", err);
          $scope.error = err.data?.message || "Error al cargar el rol";
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // Alternar permiso (own y any son mutuamente excluyentes)
    $scope.togglePermission = function (recurso, accion, scope) {
      if (!$scope.role.permissions[recurso]) {
        $scope.role.permissions[recurso] = {};
      }
      if (!$scope.role.permissions[recurso][accion]) {
        $scope.role.permissions[recurso][accion] = [];
      }

      const index = $scope.role.permissions[recurso][accion].indexOf(scope);

      if (index > -1) {
        // Si ya está seleccionado, deseleccionar
        $scope.role.permissions[recurso][accion].splice(index, 1);
        // Eliminar acción si está vacía
        if ($scope.role.permissions[recurso][accion].length === 0) {
          delete $scope.role.permissions[recurso][accion];
        }
      } else {
        // Si se selecciona 'any', quitar 'own' (ya que 'any' incluye 'own')
        // Si se selecciona 'own', quitar 'any' (para evitar redundancia)
        if (scope === "any") {
          // Remover 'own' si existe
          const ownIndex =
            $scope.role.permissions[recurso][accion].indexOf("own");
          if (ownIndex > -1) {
            $scope.role.permissions[recurso][accion].splice(ownIndex, 1);
          }
        } else if (scope === "own") {
          // Remover 'any' si existe
          const anyIndex =
            $scope.role.permissions[recurso][accion].indexOf("any");
          if (anyIndex > -1) {
            $scope.role.permissions[recurso][accion].splice(anyIndex, 1);
          }
        }

        // Agregar el nuevo scope
        $scope.role.permissions[recurso][accion].push(scope);
      }
    };

    // Verificar si un permiso está activo
    $scope.hasPermission = function (recurso, accion, scope) {
      return (
        $scope.role.permissions[recurso] &&
        $scope.role.permissions[recurso][accion] &&
        $scope.role.permissions[recurso][accion].indexOf(scope) > -1
      );
    };

    // Guardar rol
    $scope.guardarRole = function () {
      if (!$scope.roleForm.$valid) {
        // Mostrar campos inválidos
        const invalidFields = [];
        angular.forEach($scope.roleForm.$error, function (field, errorType) {
          angular.forEach(field, function (errorField) {
            invalidFields.push(errorField.$name + " (" + errorType + ")");
          });
        });

        Swal.fire({
          icon: "warning",
          title: "Campos Incompletos",
          text:
            "Por favor complete todos los campos requeridos: " +
            invalidFields.join(", "),
          confirmButtonText: "Entendido",
        });
        return;
      }

      $scope.loading = true;
      $scope.error = null;

      // Obtener roles heredados seleccionados
      const inheritsFromIds = Object.keys($scope.selectedInherits).filter(
        function (roleId) {
          return $scope.selectedInherits[roleId];
        }
      );

      // Limpiar permisos vacíos
      const cleanPermissions = {};
      Object.keys($scope.role.permissions).forEach(function (recurso) {
        if (Object.keys($scope.role.permissions[recurso]).length > 0) {
          cleanPermissions[recurso] = $scope.role.permissions[recurso];
        }
      });

      const roleData = {
        name: $scope.role.name,
        displayName: $scope.role.displayName,
        description: $scope.role.description,
        priority: parseInt($scope.role.priority),
        isSystem: $scope.role.isSystem || false,
        inheritsFrom: inheritsFromIds,
        permissions: cleanPermissions,
      };

      const savePromise = $scope.isEditMode
        ? AdminService.updateRole($routeParams.roleId, roleData)
        : AdminService.createRole(roleData);

      savePromise
        .then(function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "¡Éxito!",
              text: $scope.isEditMode
                ? "Rol actualizado exitosamente"
                : "Rol creado exitosamente",
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              $location.path("/admin/roles");
              $scope.$apply();
            });
          } else {
            $scope.error = response.message || "Error al guardar rol";
            Swal.fire({
              icon: "error",
              title: "Error",
              text: $scope.error,
              confirmButtonText: "Entendido",
            });
          }
        })
        .catch(function (err) {
          console.error("Error al guardar rol:", err);
          $scope.error = err.data?.message || "Error al guardar el rol";
          Swal.fire({
            icon: "error",
            title: "Error al Guardar",
            text: $scope.error,
            confirmButtonText: "Entendido",
          });
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // Cancelar
    $scope.cancelar = function () {
      $location.path("/admin/roles");
    };

    // Inicializar
    $scope.loadAllRoles();
    $scope.loadRole();
  },
]);
