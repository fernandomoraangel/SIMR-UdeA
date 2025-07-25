//Crear función contructor y utilizar inyección de dependencia para el objeto scope
angular.module("core").controller("CoreController", [
  "$scope",
  "Authentication",
  function ($scope, Authentication) {

    $scope.acercaDe = function () {
      Swal.fire({
        html: "SISTEMA DE INFORMACIÓN MUSICAS REGIONALES-SIMR<br />Versión: 1.0<br />Grupo de investigación Músicas Regionales<br />Universidad de Antioquia<br /> Conceptualización: Grupo de Investigación Músicas Regionales<br />Desarrollo: Fernando Mora Ángel<br />2022",
        //icon: "info",
        imageUrl: "img/logomr.png",
        timer: 8000,
        width: "50em",
        background: "#c4e3d2",
        showConfirmButton: false,
      });
    };

    // $scope.isUserAuthenticated = Authentication.isAuthenticated();

    $scope.auth = Authentication.state;

    // $scope.authentication = Authentication;
    // console.log("AuthController - authentication: ", $scope.authentication);

    // Verifica si está autenticado al cargar
    Authentication.checkAuthStatus()
      .then(function () {
        console.log("Usuario autenticado:", Authentication.getCurrentUser());
        Authentication.init(); // Iniciar autenticación y temporizador
      })
      .catch(function () {
        console.warn('Usuario no autenticado');
      });

    $scope.logoutUser = function () {
      Authentication.logout()
        .then(function () {
          console.log("Usuario desconectado");
          window.location.href = '/'; // Redirigir a la página de inicio de sesión
        })
        .catch(function (err) {
          console.error("Error al cerrar sesión:", err);
          Swal.fire({
            title: "Error al cerrar sesión",
            text: "No se pudo cerrar sesión. Por favor, inténtalo de nuevo.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        });
    };

    // Prueba manual
    $scope.testVerifyToken = function () {
      Authentication.checkAuthStatus()
        .then(user => {
          console.log('Token válido:', user);
          Swal.fire({
            title: "Token válido",
            text: "El token es válido.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        })
        .catch(err => {
          console.warn('Token inválido:', err);
          Swal.fire({
            title: "Token inválido",
            text: "El token no es válido.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        });
    };

    $scope.testRefreshToken = function () {
      Authentication.refreshToken()
        .then(user => {
          console.log('Token actualizado:', user);
          Swal.fire({
            title: "Token actualizado",
            text: "El token se ha actualizado correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        })
        .catch(err => {
          console.warn('Error al actualizar el token:', err);
          Swal.fire({
            title: "Error al actualizar el token",
            text: "No se pudo actualizar el token. Por favor, inténtalo de nuevo.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        })
    };

  },
]);
