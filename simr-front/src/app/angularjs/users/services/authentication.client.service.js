angular.module("users").factory("Authentication", ['$http', '$q', '$timeout', '$window', '$rootScope',
  function ($http, $q, $timeout, $window, $rootScope) {

    var API_URL = 'http://localhost:3000/api/auth'; // Cambia por tu URL
    var currentUser = null;

    $window.user = null;

    var service = {
      currentUser: null,
      isAuthenticated: false,
      accessToken: null,

      // Métodos públicos
      // login: login,
      // logout: logout,
      // refreshToken: refreshToken,
      // verifyAuth: verifyAuth,
      // getCurrentUser: getCurrentUser,
      // isUserAuthenticated: isUserAuthenticated,
      // getAccessToken: getAccessToken,
      // redirectToAngular: redirectToAngular,

      // Inicialización
      // init: init
    };

    var refreshTimer;

    // Inicializar el servicio
    // init();

    // function init() {
    //   // Verificar autenticación al cargar la aplicación
    //   verifyAuth()
    //     .then(function (response) {
    //       if (response.data.success) {
    //         setAuthState(response.data.user, null);
    //         $rootScope.$broadcast('auth:loginSuccess', response.data.user);
    //         deferred.resolve(response.data);
    //       } else {
    //         deferred.reject(response.data.message || 'Error en el login');
    //       }
    //     }, function (error) {
    //       var errorMessage = error.data && error.data.message ? error.data.message : 'Error de conexión';
    //       deferred.reject(errorMessage);
    //     });

    //   return deferred.promise;
    // }

    return {

      // init: function () {
      //   // Verificar autenticación al cargar la aplicación
      //   verifyAuth()
      //     .then(function(response) {
      //       if (response.data.success) {
      //         setAuthState(response.data.user, null);
      //         $rootScope.$broadcast('auth:loginSuccess', response.data.user);
      //       deferred.resolve(response.data);
      //     } else {
      //       deferred.reject(response.data.message || 'Error en el login');
      //     }
      //   }, function(error) {
      //     var errorMessage = error.data && error.data.message ? error.data.message : 'Error de conexión';
      //     deferred.reject(errorMessage);
      //   });

      //   return deferred.promise;
      // },

      checkAuthStatus: function () {
        return $http.get('/api/auth/verify')
          .then(function (response) {
            console.log("Token verification response:", response);
            if (response.data.success && response.data.data.user) {
              service.currentUser = response.data.data.user;
              currentUser = service.currentUser; // Actualizar currentUser global
              $window.user = currentUser.fullname || currentUser.email || 'Usuario sin nombre';
              console.log('Window user:', window.user);
              service.isAuthenticated = true;
              $rootScope.$broadcast('auth:loginSuccess', service.currentUser.fullname);
              return service.currentUser; // ← Esto es equivalente a deferred.resolve(...)
            } else {
              return $q.reject('No autenticado'); // ← Esto es equivalente a deferred.reject(...)
            }
          })
          .catch(function (error) {
            console.error("Error during token verification:", error);
            return $q.reject(error);
          });
      },

      // Verificar si el usuario está autenticado
      isAuthenticated: function () {
        return !!currentUser;
        // return !!localStorage.getItem(TOKEN_KEY_NAME);
      },

      // // Obtener información del usuario actual
      // getCurrentUser: function () {
      //   if (!currentUser) {
      //     var userData = localStorage.getItem(USER_KEY_NAME);
      //     if (userData) {
      //       currentUser = JSON.parse(userData);
      //     }
      //   }
      //   return currentUser;
      // },

      // // Obtener el token actual
      // getToken: function () {
      //   return localStorage.getItem(TOKEN_KEY_NAME);
      // },

      // // Establecer sesión con token y datos de usuario
      // setSession: function (token, userData) {
      //   localStorage.setItem(TOKEN_KEY_NAME, token);
      //   localStorage.setItem(USER_KEY_NAME, JSON.stringify(userData));
      //   currentUser = userData;
      // },

      // // Validar el token contra el backend
      // validateToken: function () {
      //   var deferred = $q.defer();
      //   var token = this.getToken();

      //   if (!token) {
      //     deferred.reject('No hay token almacenado');
      //     return deferred.promise;
      //   }

      //   $http({
      //     method: 'GET',
      //     url: '/api/auth/verify',
      //     headers: {
      //       'Authorization': 'Bearer ' + token
      //     }
      //   }).then(function (response) {
      //     if (response.data.valid) {
      //       // Actualizar datos del usuario si se devuelven
      //       if (response.data.user) {
      //         // localStorage.setItem('userData', JSON.stringify(response.data.user));
      //         localStorage.setItem(USER_KEY_NAME, JSON.stringify(response.data.user));
      //         currentUser = response.data.user;
      //         this.user = currentUser;
      //       }
      //       deferred.resolve(response.data);
      //     } else {
      //       // Token inválido, limpiar sesión
      //       this.clearSession();
      //       deferred.reject('Token inválido');
      //     }
      //   }.bind(this)).catch(function (error) {
      //     // Error en la verificación, limpiar sesión
      //     this.clearSession();
      //     deferred.reject(error);
      //   }.bind(this));

      //   return deferred.promise;
      // },

      // // Limpiar sesión (logout)
      // clearSession: function () {
      //   // localStorage.removeItem('authToken');
      //   // localStorage.removeItem('userData');
      //   localStorage.removeItem(TOKEN_KEY_NAME);
      //   localStorage.removeItem(USER_KEY_NAME);
      //   currentUser = null;
      // }
    };

  }]);