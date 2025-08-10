'use strict';

angular.module('authentication').controller('AuthenticationController', [
  '$scope',
  '$timeout',
  'Authentication',
  function ($scope, $timeout, Authentication) {
    console.log('[AuthController] Inicializando controlador de autenticación');
    $scope.auth = Authentication.state;

    // Estado inicial
    // $scope.isUserAuthenticated = false;
    // $scope.isCheckingAuth = true; // Para mostrar loading si es necesario
    // $scope.currentUser = null;

    // $scope.authentication = Auth.getAuth();

    // $scope.authentication = Authentication;
    // console.log("AuthController - authentication: ", $scope.authentication);

    // // Inicializar el estado
    // $scope.isUserAuthenticated = Authentication.state.isAuthenticated;

    // // Función para actualizar el estado
    // function updateAuthState() {
    //   $scope.isUserAuthenticated = Authentication.state.isAuthenticated;
    //   $scope.currentUser = Authentication.getCurrentUser();
    //   console.log('[AuthController] Estado actualizado:', {
    //     isAuthenticated: $scope.isUserAuthenticated,
    //     user: $scope.currentUser
    //   });
    // }

    // Verificar estado inicial
    function checkInitialAuthState() {
      console.log(
        '[AuthController] Verificando estado inicial de autenticación'
      );

      Authentication.checkAuthStatus()
        .then(function (user) {
          console.log('[AuthController] Usuario autenticado:', user);
          // updateAuthState();
          // $scope.isCheckingAuth = false;
        })
        .catch(function (error) {
          console.log('[AuthController] No autenticado:', error);
          // $scope.isUserAuthenticated = false;
          // $scope.currentUser = null;
          // $scope.isCheckingAuth = false;
        });
    }

    // Verificar estado inicial cuando se carga el controlador
    checkInitialAuthState();

    // Método público para refrescar manualmente el estado
    $scope.refreshAuthState = function () {
      console.log('[AuthController] Refrescando estado manualmente');
      checkInitialAuthState();
    };

    // // Verificar periódicamente (opcional)
    // $scope.$watch(function () {
    //   return Authentication.state.isAuthenticated;
    // }, function (newValue) {
    //   $scope.isUserAuthenticated = newValue;
    // });

    // Verifica si está autenticado al cargar
    Authentication.checkAuthStatus()
      .then(function () {
        console.log('Usuario autenticado:', Authentication.getCurrentUser());
        Authentication.init(); // Iniciar autenticación y temporizador
      })
      .catch(function () {
        console.warn('Usuario no autenticado');
      });

    $scope.signupUser = function () {
      console.log('Intentando registrar usuario con:', $scope.user);
      if ($scope.signupForm.$valid) {
        Authentication.signup($scope.user)
          .then((user) => {
            console.log('Usuario registrado:', user);
            // Swal.fire({
            //   title: "Registro exitoso",
            //   text: "El usuario ha sido registrado correctamente.",
            //   icon: "success",
            //   confirmButtonText: "Aceptar",
            // });
            window.location.href = '/'; // Cambia la URL según tu aplicación
          })
          .catch((err) => {
            console.error('Error al registrar usuario:', err.data.message);
            Swal.fire({
              title: 'Error de registro',
              text:
                err.data.message ||
                'Por favor, verifica los datos e inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          });
      } else {
        Swal.fire({
          title: 'Formulario inválido',
          text: 'Por favor, completa todos los campos requeridos.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
      }
    };

    $scope.loginUser = function () {
      console.log('Intentando iniciar sesión con:', $scope.credentials);
      if ($scope.loginForm.$valid) {
        Authentication.login($scope.credentials)
          .then((user) => {
            console.log('Usuario autenticado:', user);
            // const responseSwal = Swal.fire({
            //   title: "Bienvenido",
            //   text: `Hola ${user.name || user.username}, has iniciado sesión correctamente.`,
            //   icon: "success",
            //   confirmButtonText: "Aceptar",
            // });
            window.location.href = '/'; // Redirigir a la página principal
          })
          .catch((err) => {
            console.error('Error al iniciar sesión:', err);
            console.warn('Error de inicio de sesión:', err.data.message);
            Swal.fire({
              title: 'Error de inicio de sesión',
              text:
                err.data.message ||
                'Por favor, verifica tus credenciales e inténtalo de nuevo.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          });
      } else {
        Swal.fire({
          title: 'Formulario inválido',
          text: 'Por favor, completa todos los campos requeridos.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
        });
      }
    };

    //*** OLD CODE ***
    // $scope.logoutUser = function () {
    //   Authentication.logout()
    //     .then(function () {
    //       console.log("Usuario desconectado");
    //       window.location.href = '/'; // Redirigir a la página de inicio de sesión
    //     })
    //     .catch(function (err) {
    //       console.error("Error al cerrar sesión:", err);
    //       Swal.fire({
    //         title: "Error al cerrar sesión",
    //         text: "No se pudo cerrar sesión. Por favor, inténtalo de nuevo.",
    //         icon: "error",
    //         confirmButtonText: "Aceptar",
    //       });
    //     });
    // };
  },
]);
