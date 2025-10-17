"use strict";

//Crear el service 'listas'
angular.module("listas").factory("Listas", [
  "$resource",
  function ($resource) {
    //Usar el service '$resource' para devolver un objeto '$resource' listas
    return $resource(
      "api/listas/:listaId",
      {
        listaId: "@_id",
      },
      {
        update: {
          method: "PUT",
        },
        query: {
          method: "GET",
          isArray: true,
        },
      }
    );
  },
]);

// Servicio adicional para elementos individuales
angular.module("listas").factory("ListasElementos", [
  "$resource",
  function ($resource) {
    return $resource(
      "api/listas/:nombre_lista/elementos/:elemento_index",
      {
        nombre_lista: "@nombre_lista",
        elemento_index: "@elemento_index",
      },
      {
        update: {
          method: "PUT",
        },
      }
    );
  },
]);
