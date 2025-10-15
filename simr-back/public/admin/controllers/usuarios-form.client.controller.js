"use strict";

angular.module("admin").controller("UsuariosFormController", [
  "$scope",
  "$location",
  "$routeParams",
  "AdminService",
  "Authentication",
  function ($scope, $location, $routeParams, AdminService, Authentication) {
    $scope.authentication = Authentication.state;
    $scope.loading = false;
    $scope.error = null;
    $scope.isEditMode = !!$routeParams.userId;
    $scope.roles = [];
    $scope.selectedRoles = {};

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

    // Inicializar formulario
    $scope.usuario = {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roles: [],
    };

    // Cargar roles disponibles
    $scope.loadRoles = function () {
      AdminService.getAllRoles()
        .then(function (response) {
          if (response.success) {
            $scope.roles = response.data || [];
          }
        })
        .catch(function (err) {
          console.error("Error al cargar roles:", err);
        });
    };

    // Cargar usuario si es modo edición
    $scope.loadUsuario = function () {
      if (!$scope.isEditMode) return;

      $scope.loading = true;
      AdminService.getUserById($routeParams.userId)
        .then(function (response) {
          console.log("Respuesta completa de getUserById:", response);
          if (response.success) {
            console.log("Datos del usuario recibidos:", response.data);
            console.log("firstName:", response.data.firstName);
            console.log("lastName:", response.data.lastName);
            $scope.usuario = response.data;
            // Marcar roles seleccionados
            if ($scope.usuario.roles && $scope.usuario.roles.length) {
              $scope.usuario.roles.forEach(function (role) {
                const roleId = typeof role === "string" ? role : role._id;
                $scope.selectedRoles[roleId] = true;
              });
            }
          } else {
            $scope.error = response.message || "Error al cargar usuario";
          }
        })
        .catch(function (err) {
          console.error("Error al cargar usuario:", err);
          $scope.error = err.data?.message || "Error al cargar el usuario";
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    // Guardar usuario
    $scope.guardarUsuario = function () {
      if (!$scope.usuarioForm.$valid) {
        Swal.fire({
          icon: "warning",
          title: "Campos Incompletos",
          text: "Por favor complete todos los campos requeridos",
          confirmButtonText: "Entendido",
        });
        return;
      }

      $scope.loading = true;
      $scope.error = null;

      // Obtener roles seleccionados
      const roleIds = Object.keys($scope.selectedRoles).filter(function (
        roleId
      ) {
        return $scope.selectedRoles[roleId];
      });

      const userData = {
        username: $scope.usuario.username,
        email: $scope.usuario.email,
        firstName: $scope.usuario.firstName,
        lastName: $scope.usuario.lastName,
      };

      // Solo incluir password si es nuevo usuario o si se está cambiando
      if (!$scope.isEditMode || $scope.usuario.password) {
        userData.password = $scope.usuario.password;
      }

      const savePromise = $scope.isEditMode
        ? AdminService.updateUser($routeParams.userId, userData)
        : AdminService.createUser(userData);

      savePromise
        .then(function (response) {
          if (response.success) {
            const userId = $scope.isEditMode
              ? $routeParams.userId
              : response.data._id;

            // Actualizar roles si hay cambios
            if (roleIds.length > 0) {
              return AdminService.updateUserRoles(userId, roleIds).then(
                function () {
                  Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: $scope.isEditMode
                      ? "Usuario actualizado exitosamente"
                      : "Usuario creado exitosamente",
                    timer: 2000,
                    showConfirmButton: false,
                  }).then(() => {
                    $location.path("/admin/usuarios");
                    $scope.$apply();
                  });
                }
              );
            } else {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: $scope.isEditMode
                  ? "Usuario actualizado exitosamente"
                  : "Usuario creado exitosamente",
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                $location.path("/admin/usuarios");
                $scope.$apply();
              });
            }
          } else {
            $scope.error = response.message || "Error al guardar usuario";
            Swal.fire({
              icon: "error",
              title: "Error",
              text: $scope.error,
              confirmButtonText: "Entendido",
            });
          }
        })
        .catch(function (err) {
          console.error("Error al guardar usuario:", err);
          $scope.error = err.data?.message || "Error al guardar el usuario";
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
      $location.path("/admin/usuarios");
    };

    // Inicializar
    $scope.loadRoles();
    $scope.loadUsuario();
  },
]);
