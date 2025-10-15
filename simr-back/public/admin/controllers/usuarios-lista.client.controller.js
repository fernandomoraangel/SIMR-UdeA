"use strict";

angular.module("admin").controller("UsuariosListaController", [
  "$scope",
  "$location",
  "AdminService",
  "Authentication",
  function ($scope, $location, AdminService, Authentication) {
    $scope.authentication = Authentication.state;
    $scope.usuarios = [];
    $scope.loading = true;
    $scope.error = null;

    // Verificar que el usuario tiene permisos de administrador
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

    // Cargar lista de usuarios
    $scope.loadUsuarios = function () {
      $scope.loading = true;
      $scope.error = null;

      AdminService.getAllUsers()
        .then(function (response) {
          if (response.success) {
            $scope.usuarios = response.data || [];
          } else {
            $scope.error = response.message || "Error al cargar usuarios";
          }
        })
        .catch(function (err) {
          console.error("Error al cargar usuarios:", err);
          $scope.error =
            err.data?.message || "Error al cargar la lista de usuarios";
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // Eliminar usuario
    $scope.eliminarUsuario = function (usuario) {
      Swal.fire({
        icon: "question",
        title: "Confirmar Eliminación",
        text: '¿Está seguro de eliminar el usuario "' + usuario.username + '"?',
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        AdminService.deleteUser(usuario._id)
          .then(function (response) {
            if (response.success) {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Usuario eliminado exitosamente",
                timer: 2000,
                showConfirmButton: false,
              });
              $scope.loadUsuarios();
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: response.message || "No se pudo eliminar el usuario",
                confirmButtonText: "Entendido",
              });
            }
          })
          .catch(function (err) {
            console.error("Error al eliminar usuario:", err);
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

    // Navegar a crear usuario
    $scope.crearUsuario = function () {
      $location.path("/admin/usuarios/crear");
    };

    // Navegar a editar usuario
    $scope.editarUsuario = function (usuario) {
      $location.path("/admin/usuarios/" + usuario._id + "/editar");
    };

    // Obtener nombres de roles
    $scope.getRoleNames = function (roles) {
      if (!roles || !roles.length) return "Sin roles";
      return roles
        .map(function (role) {
          return role.name || role;
        })
        .join(", ");
    };

    // Inicializar
    $scope.loadUsuarios();
  },
]);
