"use strict";

angular.module("admin").controller("RolesListaController", [
  "$scope",
  "$location",
  "AdminService",
  "Authentication",
  function ($scope, $location, AdminService, Authentication) {
    $scope.authentication = Authentication.state;
    $scope.roles = [];
    $scope.loading = true;
    $scope.error = null;

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

    // Cargar lista de roles
    $scope.loadRoles = function () {
      $scope.loading = true;
      $scope.error = null;

      AdminService.getAllRoles()
        .then(function (response) {
          if (response.success) {
            $scope.roles = response.data || [];
          } else {
            $scope.error = response.message || "Error al cargar roles";
          }
        })
        .catch(function (err) {
          console.error("Error al cargar roles:", err);
          $scope.error =
            err.data?.message || "Error al cargar la lista de roles";
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // Eliminar rol
    $scope.eliminarRole = function (role) {
      if (role.isSystem) {
        Swal.fire({
          icon: "warning",
          title: "Operación No Permitida",
          text: "No se puede eliminar un rol del sistema",
          confirmButtonText: "Entendido",
        });
        return;
      }

      Swal.fire({
        icon: "question",
        title: "Confirmar Eliminación",
        text: '¿Está seguro de eliminar el rol "' + role.name + '"?',
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        AdminService.deleteRole(role._id)
          .then(function (response) {
            if (response.success) {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Rol eliminado exitosamente",
                timer: 2000,
                showConfirmButton: false,
              });
              $scope.loadRoles();
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "No se pudo eliminar el rol",
                confirmButtonText: "Entendido",
              });
            }
          })
          .catch(function (err) {
            console.error("Error al eliminar rol:", err);
            Swal.fire({
              icon: "error",
              title: "Error al Eliminar",
              text:
                err.data?.message ||
                err.message ||
                "Ocurrió un error inesperado",
              confirmButtonText: "Entendido",
            });
          });
      });
    };

    // Navegar a crear rol
    $scope.crearRole = function () {
      $location.path("/admin/roles/crear");
    };

    // Navegar a editar rol
    $scope.editarRole = function (role) {
      $location.path("/admin/roles/" + role._id + "/editar");
    };

    // Obtener nombres de roles heredados
    $scope.getInheritsFromNames = function (inheritsFrom) {
      if (!inheritsFrom || !inheritsFrom.length) return "Ninguno";
      return inheritsFrom
        .map(function (role) {
          return role.name || role;
        })
        .join(", ");
    };

    // Contar permisos
    $scope.countPermissions = function (permissions) {
      if (!permissions) return 0;
      return Object.keys(permissions).reduce(function (count, resource) {
        return count + Object.keys(permissions[resource]).length;
      }, 0);
    };

    // Inicializar
    $scope.loadRoles();
  },
]);
