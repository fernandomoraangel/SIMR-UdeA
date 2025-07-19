"use strict";

angular.module("users")
  .controller('LoginExternoController', function ($http, $location, $timeout) {

    // LocalStorage keys
    const TOKEN_KEY_NAME = 'authToken';
    const USER_KEY_NAME = 'userData';

    const params = $location.search();
    const token = params.token;
    // const params = new URLSearchParams(window.location.search);
    // const token = params.get('token');

    console.log('Token recibido:', token);

    if (!token) {
      console.warn('Token ausente');
      // return $location.path('/');
      return;
    }

    console.log('Token encontrado, autenticando usuario...');

    // Guardar el token temporalmente
    localStorage.setItem(TOKEN_KEY_NAME, token);

    // Llamar al backend para obtener info del usuario
    $http({
      method: 'GET',
      url: 'http://localhost:3000/api/auth/verify', // ajusta la URL según tu backend
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      console.log('Token válido, obteniendo usuario...');
      const user = response.data;

      localStorage.setItem(USER_KEY_NAME, JSON.stringify(user.user));

      console.log('Usuario autenticado vía token:', user.user);

      $timeout(() => {
        $location.path('/dashboard');
      }, 1000);
    }).catch((err) => {
      console.error('Token inválido o error al obtener usuario:', err);
      localStorage.removeItem(TOKEN_KEY_NAME);
      // $location.path('/signin'); // o ruta de fallback
      $location.path('/login'); // o ruta de fallback
    });
  });
