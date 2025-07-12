angular.module("users").factory("Authentication", [
  '$http',
  '$q',
  '$rootScope',
  '$interval',
  function ($http, $q, $rootScope, $interval) {
    var API_URL = 'http://localhost:3000/api/auth'; // Ajusta según tu configuración

    // Configuración por defecto para incluir cookies
    // $http.defaults.withCredentials = true;


    const service = {
      currentUser: null,
      isAuthenticated: false,
      refreshTimer: null,
    };

    // Verificar si el usuario está autenticado con token en cookies
    service.checkAuthStatus = function () {
      return $http.get('/api/auth/verify') // usa cookies httpOnly
        .then(function (response) {
          if (response.data.success && response.data.data.user) {
            service.currentUser = response.data.data.user;
            service.isAuthenticated = true;
            $rootScope.$broadcast('auth:loginSuccess', service.currentUser);
            return service.currentUser;
          } else {
            service.clearUser();
            return $q.reject('No autenticado');
          }
        })
        .catch(function (error) {
          service.clearUser();
          return $q.reject(error);
        });
    };

    // Limpiar el estado de autenticación
    service.clearUser = function () {
      service.currentUser = null;
      service.isAuthenticated = false;
      $rootScope.$broadcast('auth:logout');
    };

    // Obtener el usuario actual
    service.getCurrentUser = function () {
      return service.currentUser || {};
    };

    // Saber si está autenticado
    service.isAuthenticatedFn = function () {
      console.log("isAuthenticatedFn called:", service.isAuthenticated);
      return service.isAuthenticated;
    };

    // Intentar renovar token automáticamente
    service.refreshToken = function () {
      return $http.post('/api/auth/refresh', {})
        .then(function (res) {
          if (res.data.success) {
            console.log('Access token renovado');
            return res.data;
          } else {
            service.clearUser();
            return $q.reject('Error al renovar token');
          }
        })
        .catch(function (err) {
          service.clearUser();
          return $q.reject(err);
        });
    };

    service.startRefreshTimer = function (intervalMs) {
      if (service.refreshTimer) {
        $interval.cancel(service.refreshTimer);
      }
      service.refreshTimer = $interval(function () {
        console.log('Intentando renovar token...');
        service.refreshToken();
      }, intervalMs);
    };

    service.stopRefreshTimer = function () {
      if (service.refreshTimer) {
        $interval.cancel(service.refreshTimer);
        service.refreshTimer = null;
      }
    };


    //TODO: Revisar este método para incluirlo
    // Logout
    service.logout = function () {
      return $http.post(API_URL + '/logout', {})
        .then(function (response) {
          service.clearUser();
          $rootScope.$broadcast('auth:logoutSuccess');
          // return response.data; // Respuesta del servidor
          return $q.resolve(response.data);
        })
        .catch(function (error) {
          // Aunque falle el logout en servidor, limpiar localmente
          service.clearUser();
          $rootScope.$broadcast('auth:logoutSuccess');
          return $q.reject(error);
        });
    };

    return {
      checkAuthStatus: service.checkAuthStatus,
      getCurrentUser: service.getCurrentUser,
      isAuthenticated: service.isAuthenticatedFn,
      startRefreshTimer: service.startRefreshTimer,
      stopRefreshTimer: service.stopRefreshTimer,
      refreshToken: service.refreshToken,
      logout: service.logout
    };
  }
]);



// angular.module("users").factory("Authentication", ['$http', '$q', '$timeout', '$window', '$rootScope',
//   function ($http, $q, $timeout, $window, $rootScope) {

//     var API_URL = 'http://localhost:3000/api/auth'; // Cambia por tu URL
//     var currentUser = null;

//     this.user = window.user;
//     $window.user = null;

//     var service = {
//       currentUser: null,
//       isAuthenticated: false,
//       accessToken: null,

//       // Métodos públicos
//       // login: login,
//       // logout: logout,
//       // refreshToken: refreshToken,
//       // verifyAuth: verifyAuth,
//       // getCurrentUser: getCurrentUser,
//       // isUserAuthenticated: isUserAuthenticated,
//       // getAccessToken: getAccessToken,
//       // redirectToAngular: redirectToAngular,

//       // Inicialización
//       // init: init
//     };

//     var refreshTimer;

//     // Inicializar el servicio
//     // init();

//     // function init() {
//     //   // Verificar autenticación al cargar la aplicación
//     //   verifyAuth()
//     //     .then(function (response) {
//     //       if (response.data.success) {
//     //         setAuthState(response.data.user, null);
//     //         $rootScope.$broadcast('auth:loginSuccess', response.data.user);
//     //         deferred.resolve(response.data);
//     //       } else {
//     //         deferred.reject(response.data.message || 'Error en el login');
//     //       }
//     //     }, function (error) {
//     //       var errorMessage = error.data && error.data.message ? error.data.message : 'Error de conexión';
//     //       deferred.reject(errorMessage);
//     //     });

//     //   return deferred.promise;
//     // }

//     return {

//       // init: function () {
//       //   // Verificar autenticación al cargar la aplicación
//       //   verifyAuth()
//       //     .then(function(response) {
//       //       if (response.data.success) {
//       //         setAuthState(response.data.user, null);
//       //         $rootScope.$broadcast('auth:loginSuccess', response.data.user);
//       //       deferred.resolve(response.data);
//       //     } else {
//       //       deferred.reject(response.data.message || 'Error en el login');
//       //     }
//       //   }, function(error) {
//       //     var errorMessage = error.data && error.data.message ? error.data.message : 'Error de conexión';
//       //     deferred.reject(errorMessage);
//       //   });

//       //   return deferred.promise;
//       // },

//       checkAuthStatus: function () {
//         return $http.get('/api/auth/verify')
//           .then(function (response) {
//             console.log("Token verification response:", response);
//             if (response.data.success && response.data.data.user) {
//               service.currentUser = response.data.data.user;
//               currentUser = service.currentUser; // Actualizar currentUser global
//               $window.user = currentUser.fullname || currentUser.email || 'Usuario sin nombre';
//               this.user = currentUser.fullname || currentUser.email || 'Usuario sin nombre';
//               console.log('user:', user);
//               console.log('Window user:', window.user);
//               service.isAuthenticated = true;
//               $rootScope.$broadcast('auth:loginSuccess', service.currentUser.fullname);
//               return service.currentUser; // ← Esto es equivalente a deferred.resolve(...)
//             } else {
//               return $q.reject('No autenticado'); // ← Esto es equivalente a deferred.reject(...)
//             }
//           })
//           .catch(function (error) {
//             console.error("Error during token verification:", error);
//             return $q.reject(error);
//           });
//       },

//       user: this.currentUser,

//       // Verificar si el usuario está autenticado
//       isAuthenticated: function () {
//         return service.isAuthenticated;
//         // return !!localStorage.getItem(TOKEN_KEY_NAME);
//       },

//       // // Obtener información del usuario actual
//       // getCurrentUser: function () {
//       //   if (!currentUser) {
//       //     var userData = localStorage.getItem(USER_KEY_NAME);
//       //     if (userData) {
//       //       currentUser = JSON.parse(userData);
//       //     }
//       //   }
//       //   return currentUser;
//       // },

//       // // Obtener el token actual
//       // getToken: function () {
//       //   return localStorage.getItem(TOKEN_KEY_NAME);
//       // },

//       // // Establecer sesión con token y datos de usuario
//       // setSession: function (token, userData) {
//       //   localStorage.setItem(TOKEN_KEY_NAME, token);
//       //   localStorage.setItem(USER_KEY_NAME, JSON.stringify(userData));
//       //   currentUser = userData;
//       // },

//       // // Validar el token contra el backend
//       // validateToken: function () {
//       //   var deferred = $q.defer();
//       //   var token = this.getToken();

//       //   if (!token) {
//       //     deferred.reject('No hay token almacenado');
//       //     return deferred.promise;
//       //   }

//       //   $http({
//       //     method: 'GET',
//       //     url: '/api/auth/verify',
//       //     headers: {
//       //       'Authorization': 'Bearer ' + token
//       //     }
//       //   }).then(function (response) {
//       //     if (response.data.valid) {
//       //       // Actualizar datos del usuario si se devuelven
//       //       if (response.data.user) {
//       //         // localStorage.setItem('userData', JSON.stringify(response.data.user));
//       //         localStorage.setItem(USER_KEY_NAME, JSON.stringify(response.data.user));
//       //         currentUser = response.data.user;
//       //         this.user = currentUser;
//       //       }
//       //       deferred.resolve(response.data);
//       //     } else {
//       //       // Token inválido, limpiar sesión
//       //       this.clearSession();
//       //       deferred.reject('Token inválido');
//       //     }
//       //   }.bind(this)).catch(function (error) {
//       //     // Error en la verificación, limpiar sesión
//       //     this.clearSession();
//       //     deferred.reject(error);
//       //   }.bind(this));

//       //   return deferred.promise;
//       // },

//       // // Limpiar sesión (logout)
//       // clearSession: function () {
//       //   // localStorage.removeItem('authToken');
//       //   // localStorage.removeItem('userData');
//       //   localStorage.removeItem(TOKEN_KEY_NAME);
//       //   localStorage.removeItem(USER_KEY_NAME);
//       //   currentUser = null;
//       // }
//     };

//   }]);