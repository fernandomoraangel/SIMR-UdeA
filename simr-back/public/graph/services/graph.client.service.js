"use strict";

// Servicio de grafo para el frontend
angular.module("graph").factory("GraphService", [
  "$http",
  "$q",
  function ($http, $q) {
    var service = {
      // Obtener datos del grafo
      getGraphData: function (options) {
        options = options || {};
        var params = {};

        // Agregar opciones
        if (options.entities && options.entities.length > 0) {
          params.entities = Array.isArray(options.entities)
            ? options.entities.join(",")
            : options.entities;
        }
        if (options.query) {
          params.query = options.query;
        }
        if (options.limit) {
          params.limit = options.limit;
        }

        return $http
          .get("/api/graph/data", { params: params })
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error obteniendo datos del grafo:", error);
            return $q.reject(error);
          });
      },

      // Obtener metadatos del grafo
      getMetadata: function () {
        return $http
          .get("/api/graph/metadata")
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error obteniendo metadatos del grafo:", error);
            return $q.reject(error);
          });
      },

      // Obtener estadísticas del grafo
      getStats: function () {
        return $http
          .get("/api/graph/stats")
          .then(function (response) {
            return response.data;
          })
          .catch(function (error) {
            console.error("Error obteniendo estadísticas del grafo:", error);
            return $q.reject(error);
          });
      },
    };

    return service;
  },
]);
