angular.module("authentication").controller("AuthenticationController", [
  "$scope",
  "Authentication",
  function ($scope, Authentication) {
    // $scope.authentication = Auth.getAuth();

    $scope.authentication = Authentication;
    console.log("AuthController - authentication: ", $scope.authentication);

    // Inicializar el estado
    $scope.isUserAuthenticated = Authentication.isAuthenticated();

    // Escuchar eventos de autenticación
    $scope.$on('auth:loginSuccess', function () {
      $scope.isUserAuthenticated = true;
    });

    $scope.$on('auth:logout', function () {
      $scope.isUserAuthenticated = false;
    });

    // Verificar periódicamente (opcional)
    $scope.$watch(function () {
      return Authentication.isAuthenticated();
    }, function (newValue) {
      $scope.isUserAuthenticated = newValue;
    });

    // Verifica si está autenticado al cargar
    Authentication.checkAuthStatus()
      .then(function () {
        console.log("Usuario autenticado:", Authentication.getCurrentUser());
        Authentication.init(); // Iniciar autenticación y temporizador
      })
      .catch(function () {
        console.warn('Usuario no autenticado');
      });

    $scope.signupUser = function () {
      console.log('Intentando registrar usuario con:', $scope.user);
      if ($scope.signupForm.$valid) {
        Authentication.signup($scope.user)
          .then(user => {
            console.log('Usuario registrado:', user);
            // Swal.fire({
            //   title: "Registro exitoso",
            //   text: "El usuario ha sido registrado correctamente.",
            //   icon: "success",
            //   confirmButtonText: "Aceptar",
            // });
            window.location.href = '/'; // Cambia la URL según tu aplicación 
          })
          .catch(err => {
            console.error('Error al registrar usuario:', err.data.message);
            Swal.fire({
              title: "Error de registro",
              text: err.data.message || "Por favor, verifica los datos e inténtalo de nuevo.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          });
      } else {
        Swal.fire({
          title: "Formulario inválido",
          text: "Por favor, completa todos los campos requeridos.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
      }
    };

    $scope.loginUser = function () {
      console.log('Intentando iniciar sesión con:', $scope.credentials);
      if ($scope.loginForm.$valid) {
        Authentication.login($scope.credentials)
          .then(user => {
            console.log('Usuario autenticado:', user);
            // const responseSwal = Swal.fire({
            //   title: "Bienvenido",
            //   text: `Hola ${user.name || user.username}, has iniciado sesión correctamente.`,
            //   icon: "success",
            //   confirmButtonText: "Aceptar",
            // });
            //   // Redirigir a la página principal o a donde sea necesario
            window.location.href = '/'; // Cambia la URL según tu aplicación 
          })
          .catch(err => {
            console.error('Error al iniciar sesión:', err);
            console.warn('Error de inicio de sesión:', err.data.message);
            Swal.fire({
              title: "Error de inicio de sesión",
              text: err.data.message || "Por favor, verifica tus credenciales e inténtalo de nuevo.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }
          );
      } else {
        Swal.fire({
          title: "Formulario inválido",
          text: "Por favor, completa todos los campos requeridos.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
      }
    };

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

    // // Prueba manual
    // $scope.testVerifyToken = function () {
    //   Authentication.checkAuthStatus()
    //     .then(user => {
    //       console.log('Token válido:', user);
    //       Swal.fire({
    //         title: "Token válido",
    //         text: "El token es válido.",
    //         icon: "success",
    //         confirmButtonText: "Aceptar",
    //       });
    //     })
    //     .catch(err => {
    //       console.warn('Token inválido:', err);
    //       Swal.fire({
    //         title: "Token inválido",
    //         text: "El token no es válido.",
    //         icon: "error",
    //         confirmButtonText: "Aceptar",
    //       });
    //     });
    // };

    // $scope.testRefreshToken = function () {
    //   Authentication.refreshToken()
    //     .then(user => {
    //       console.log('Token actualizado:', user);
    //       Swal.fire({
    //         title: "Token actualizado",
    //         text: "El token se ha actualizado correctamente.",
    //         icon: "success",
    //         confirmButtonText: "Aceptar",
    //       });
    //     })
    //     .catch(err => {
    //       console.warn('Error al actualizar el token:', err);
    //       Swal.fire({
    //         title: "Error al actualizar el token",
    //         text: "No se pudo actualizar el token. Por favor, inténtalo de nuevo.",
    //         icon: "error",
    //         confirmButtonText: "Aceptar",
    //       });
    //     })
    // };


    console.log("AuthenticationController - authentication: ", $scope.authentication);
  },
]);