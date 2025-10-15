var mainApplicationModuleName = "simr";

var mainApplicationModule = angular.module(mainApplicationModuleName, [
  "ngResource",
  "ngRoute",
  "authentication",
  "permissions",
  "core",
  "admin",
  "auditoria",
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
]);
// .run(function ($location) {
//   // Redirect to the login page if the user is not authenticated
//   if (!localStorage.getItem("user")) {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('token');
//     console.log("Token from URL: ", token);
//     if (!token) {
//       console.log("User not authenticated, redirecting to login page.");
//       alert("No tienes acceso a esta aplicación. Por favor, inicia sesión.");
//       window.location.href = `http://localhost:4200`;
//     }
//     // window.history.replaceState({}, document.title, window.location.pathname);
//     // $location.path("/login");
//   } else {
//     console.log("User authenticated, no redirection needed.");
//     alert("Bienvenido a la aplicación SIMR.");
//   }
// });

mainApplicationModule.config([
  "$locationProvider",
  "$httpProvider",
  function ($locationProvider, $httpProvider) {
    $locationProvider.hashPrefix("!");
    // $locationProvider.html5Mode(true);

    // Configurar envío de cookies con todas las requests
    $httpProvider.defaults.withCredentials = true;
  },
]);

mainApplicationModule.run([
  "Authentication",
  "PermissionsService",
  function (Authentication, PermissionsService) {
    Authentication.init();

    // Cargar permisos del usuario cuando la aplicación inicia
    // Esperar un momento para que Authentication.init() termine
    setTimeout(function () {
      if (Authentication.user) {
        PermissionsService.loadPermissions().catch(function (err) {
          console.error("Error cargando permisos:", err);
        });
      }
    }, 100);

    // Exponer a la consola del navegador
    // window.AuthService = Authentication;
  },
]);

angular.element(document).ready(function () {
  angular.bootstrap(document, [mainApplicationModuleName]);
});
