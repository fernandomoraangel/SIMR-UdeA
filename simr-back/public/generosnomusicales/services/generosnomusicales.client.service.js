"use strict";

//Crear el service 'generos'
angular.module("generosNoMusicales").factory("GenerosNoMusicales", [
  "$resource",
  function ($resource) {
    //Usar el service '$resource' para devolver un objeto '$resource'
    //console.log("Uso servicio generos no musicales");
    return $resource(
      "api/generosNomusicales/:generoNoMusicalId",
      {
        generoNoMusicalId: "@_id",
      },
      {
        update: {
          method: "PUT",
        },
      }
    );
  },
]);
