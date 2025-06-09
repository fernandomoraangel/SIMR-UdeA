angular.module("users").factory("Authentication", ['$http', '$q', function ($http, $q) {

  var currentUser = null;

  // LocalStorage keys
  const TOKEN_KEY_NAME = 'authToken';
  const USER_KEY_NAME = 'userData';

  // Comprobar al iniciar si hay una sesión en localStorage
  var storedUser = localStorage.getItem(USER_KEY_NAME);
  var storedToken = localStorage.getItem(TOKEN_KEY_NAME);

  if (storedUser && storedToken) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      localStorage.removeItem(USER_KEY_NAME);
      localStorage.removeItem(TOKEN_KEY_NAME);
    }
  }

  return {
    // Verificar si el usuario está autenticado
    isAuthenticated: function () {
      return !!localStorage.getItem(TOKEN_KEY_NAME);
    },

    // Obtener información del usuario actual
    getCurrentUser: function () {
      if (!currentUser) {
        var userData = localStorage.getItem(USER_KEY_NAME);
        if (userData) {
          currentUser = JSON.parse(userData);
        }
      }
      return currentUser;
    },

    // Obtener el token actual
    getToken: function () {
      return localStorage.getItem(TOKEN_KEY_NAME);
    },

    // Establecer sesión con token y datos de usuario
    setSession: function (token, userData) {
      localStorage.setItem(TOKEN_KEY_NAME, token);
      localStorage.setItem(USER_KEY_NAME, JSON.stringify(userData));
      currentUser = userData;
    },

    // Validar el token contra el backend
    validateToken: function () {
      var deferred = $q.defer();
      var token = this.getToken();

      if (!token) {
        deferred.reject('No hay token almacenado');
        return deferred.promise;
      }

      $http({
        method: 'GET',
        url: '/api/auth/verify',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(function (response) {
        if (response.data.valid) {
          // Actualizar datos del usuario si se devuelven
          if (response.data.user) {
            // localStorage.setItem('userData', JSON.stringify(response.data.user));
            localStorage.setItem(USER_KEY_NAME, JSON.stringify(response.data.user));
            currentUser = response.data.user;
            this.user = currentUser;
          }
          deferred.resolve(response.data);
        } else {
          // Token inválido, limpiar sesión
          this.clearSession();
          deferred.reject('Token inválido');
        }
      }.bind(this)).catch(function (error) {
        // Error en la verificación, limpiar sesión
        this.clearSession();
        deferred.reject(error);
      }.bind(this));

      return deferred.promise;
    },

    // Limpiar sesión (logout)
    clearSession: function () {
      // localStorage.removeItem('authToken');
      // localStorage.removeItem('userData');
      localStorage.removeItem(TOKEN_KEY_NAME);
      localStorage.removeItem(USER_KEY_NAME);
      currentUser = null;
    }
  };

}]);