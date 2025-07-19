"use strict";

//Crear el service 'generos'
angular.module("generos").factory("Generos", [
  "$resource",
  function ($resource) {
    //Usar el service '$resource' para devolver un objeto '$resource'
    //console.log("Uso servicio generos");
    return $resource(
      "api/generos/:generoId",
      {
        generoId: "@_id",
      },
      {
        update: {
          method: "PUT",
        },
      }
    );
  },
]);
