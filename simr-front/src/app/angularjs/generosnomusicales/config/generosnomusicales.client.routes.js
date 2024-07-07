"use strict";
//Configuración de rutas para 'generos no musicales'
angular.module("generosNoMusicales").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/generosnomusicales", {
        templateUrl:
          "generosnomusicales/views/list-generonomusical.client.view.html",
      })
      .when("/generosnomusicales/create", {
        templateUrl:
          "generosnomusicales/views/create-generonomusical.client.view.html",
      })
      .when("/generosnomusicales/:generoNoMusicalId", {
        templateUrl:
          "generosnomusicales/views/view-generonomusical.client.view.html",
      })
      .when("/generosnomusicales/:generoNoMusicalId/edit", {
        templateUrl:
          "generosnomusicales/views/edit-generonomusical.client.view.html",
      });
  },
]);
