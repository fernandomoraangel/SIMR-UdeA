angular.module("core", []);

// Configurar interceptor de rutas para verificar permisos
angular.module("core").run([
  "$rootScope",
  "$location",
  "Authentication",
  "Authorization",
  function ($rootScope, $location, Authentication, Authorization) {
    // Interceptor de cambios de ruta
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
      console.log("Route change detected:", next.originalPath);

      // Verificar si la ruta requiere autenticación
      if (next.$$route && next.$$route.requireAuth !== false) {
        // Por defecto, todas las rutas requieren autenticación excepto login/signup
        const publicRoutes = ["/login", "/signup", "/"];
        const isPublicRoute =
          publicRoutes.indexOf(next.$$route.originalPath) !== -1;

        if (!isPublicRoute && !Authentication.state.isAuthenticated) {
          console.warn("Usuario no autenticado, redirigiendo a login");
          event.preventDefault();

          // Redirigir inmediatamente a login
          $location.path("/login");

          // Mostrar mensaje después de redirigir
          setTimeout(function () {
            Swal.fire({
              title: "Acceso denegado",
              text: "Debes iniciar sesión para acceder a esta página",
              icon: "warning",
              confirmButtonText: "Aceptar",
            });
          }, 100);

          return;
        }
      }

      // Verificar permisos específicos de la ruta
      if (next.$$route && next.$$route.permission) {
        const permission = next.$$route.permission;
        const resource = next.$$route.resource || "general";

        if (!Authorization.requirePermission(permission, resource)) {
          console.warn(
            "Usuario sin permisos suficientes:",
            permission,
            resource
          );
          event.preventDefault();

          // Redirigir inmediatamente a localhost (página principal)
          $location.path("/");

          // Mostrar mensaje después de redirigir
          setTimeout(function () {
            Swal.fire({
              title: "Acceso denegado",
              text: "No tienes permisos para acceder a esta función",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }, 100);

          return;
        }
      }
    });

    // Interceptor de errores de cambio de ruta
    $rootScope.$on(
      "$routeChangeError",
      function (event, current, previous, rejection) {
        console.error("Error al cambiar de ruta:", rejection);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error al cargar la página",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    );
  },
]);
