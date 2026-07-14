"use strict";

/**
 * resource-shim.client.js
 * ------------------------------------------------------------------
 * Reemplazo propio y gratuito de "angular-resource.js" (ngResource).
 *
 * Motivo: el escaneo OWASP ZAP marcó como Severidad ALTA la librería
 * AngularJS "angular-resource" (CVE-2024-8372, CVE-2024-21490,
 * CVE-2025-0716, CVE-2025-2336, etc.), por estar en estado EOL sin
 * parches oficiales de Google.
 *
 * Este archivo NO es un parche del código vulnerable: es una
 * reimplementación mínima del servicio `$resource`, construida sobre
 * `$http` (que forma parte del núcleo de angular.js, no señalado en el
 * escaneo), replicando únicamente el subconjunto de la API que usa esta
 * aplicación:
 *
 *   - Resource.get(params, successCb, errorCb)
 *   - Resource.query(successCb, errorCb)  // devuelve array, isArray:true
 *   - Resource.save(data, successCb, errorCb)
 *   - Resource.remove/delete(params, successCb, errorCb)
 *   - Resource.<accionPersonalizada>(params, data, successCb, errorCb)
 *     (p.ej. "update" mapeada a PUT, definida por cada servicio)
 *   - instancia.$save(successCb, errorCb)
 *   - instancia.$remove(successCb, errorCb)
 *   - instancia.$<accionPersonalizada>(successCb, errorCb)
 *   - resultado.$promise / resultado.$resolved
 *
 * No implementa características avanzadas de ngResource que esta app
 * no usa (cancelación de peticiones, stripTrailingSlashes, hasBody
 * configurable, etc.).
 *
 * Se registra como servicio "$resource" dentro del módulo
 * "ngResourceShim", que sustituye a "ngResource" en las dependencias
 * de los módulos de la aplicación (ver application.js, graph, search).
 */

angular.module("ngResourceShim", []).provider("$resource", function () {
  var DEFAULT_ACTIONS = {
    get: { method: "GET" },
    save: { method: "POST" },
    query: { method: "GET", isArray: true },
    remove: { method: "DELETE" },
    delete: { method: "DELETE" },
  };

  this.$get = [
    "$http",
    "$q",
    function ($http, $q) {
      function isBoundParam(value) {
        return typeof value === "string" && value.charAt(0) === "@";
      }

      // Copia el contenido de "source" dentro de "target" sin cambiar
      // la referencia (necesario para que el data-binding/digest de
      // AngularJS detecte los cambios, igual que hacía $resource real).
      function copyInto(target, source) {
        if (angular.isArray(target)) {
          target.length = 0;
          angular.forEach(source, function (item) {
            target.push(item);
          });
        } else {
          angular.forEach(target, function (value, key) {
            if (key.charAt(0) !== "$") {
              delete target[key];
            }
          });
          angular.forEach(source, function (value, key) {
            target[key] = value;
          });
        }
        return target;
      }

      // Extrae los valores de :param definidos en paramDefaults a partir
      // de un objeto de datos (p.ej. {obraId: '@_id'} + {_id: 'abc'} => {obraId:'abc'})
      function extractParamsFromData(paramDefaults, data) {
        var params = {};
        angular.forEach(paramDefaults, function (val, key) {
          if (isBoundParam(val)) {
            var field = val.substring(1);
            params[key] = data ? data[field] : undefined;
          } else {
            params[key] = val;
          }
        });
        return params;
      }

      // Sustituye los segmentos "/:nombre" de la URL por su valor, y
      // devuelve además los parámetros restantes para usarlos como
      // querystring (igual que hace ngResource real).
      function buildUrl(url, params) {
        var usedKeys = {};
        var resultUrl = url.replace(/\/:(\w+)/g, function (match, key) {
          usedKeys[key] = true;
          var val = params[key];
          if (val === undefined || val === null || val === "") {
            return "";
          }
          return "/" + encodeURIComponent(val);
        });

        var query = {};
        angular.forEach(params, function (val, key) {
          if (!usedKeys[key] && val !== undefined && val !== null) {
            query[key] = val;
          }
        });

        return { url: resultUrl, query: query };
      }

      // Elimina las propiedades internas ($promise, $resolved, etc.) antes
      // de enviar una instancia como cuerpo de la petición, igual que hacía
      // Resource.prototype.toJSON en el ngResource real.
      function stripPrivate(obj) {
        var clean = {};
        angular.forEach(obj, function (value, key) {
          if (key.charAt(0) !== "$") {
            clean[key] = value;
          }
        });
        return clean;
      }

      return function $resource(url, paramDefaults, actions) {
        paramDefaults = paramDefaults || {};
        actions = angular.extend({}, DEFAULT_ACTIONS, actions);

        function Resource(data) {
          copyInto(this, data || {});
        }

        function performRequest(method, params, data, isArray) {
          var mergedParams = angular.extend(
            {},
            extractParamsFromData(paramDefaults, data),
            params
          );
          var built = buildUrl(url, mergedParams);

          var resultHolder = isArray ? [] : new Resource();
          resultHolder.$resolved = false;

          var httpConfig = {
            method: method,
            url: built.url,
            params: built.query,
          };
          if (
            data !== undefined &&
            /^(POST|PUT|PATCH)$/.test(method)
          ) {
            httpConfig.data = stripPrivate(data);
          }

          var promise = $http(httpConfig).then(
            function (response) {
              resultHolder.$resolved = true;
              copyInto(resultHolder, response.data);
              return resultHolder;
            },
            function (response) {
              resultHolder.$resolved = true;
              return $q.reject(response);
            }
          );

          resultHolder.$promise = promise;
          return { holder: resultHolder, promise: promise };
        }

        angular.forEach(actions, function (action, name) {
          var isArray = !!action.isArray;
          var method = (action.method || "GET").toUpperCase();

          // --- Acción estática: Resource.<name>(...) --------------------
          Resource[name] = function (a, b, c, d) {
            var params, data, success, error;

            if (typeof a === "function") {
              // Resource.query(successCb, errorCb)
              params = {};
              data = undefined;
              success = a;
              error = b;
            } else if (method === "GET" || method === "DELETE") {
              // Resource.get(params, successCb, errorCb)
              params = a || {};
              data = undefined;
              success = b;
              error = c;
            } else if (typeof b === "function" || b === undefined) {
              // Resource.save(data, successCb, errorCb)
              data = a;
              params = {};
              success = b;
              error = c;
            } else {
              // Resource.update(params, data, successCb, errorCb)
              params = a || {};
              data = b;
              success = c;
              error = d;
            }

            var req = performRequest(method, params, data, isArray);
            req.promise.then(
              function (result) {
                if (success) success(result, {});
              },
              function (response) {
                if (error) error(response);
              }
            );
            return req.holder;
          };

          // --- Acción de instancia: instancia.$<name>(...) ---------------
          Resource.prototype["$" + name] = function (a, b) {
            var self = this;
            var success = typeof a === "function" ? a : b;
            var error = typeof a === "function" ? b : undefined;
            var extraParams = a && typeof a === "object" ? a : {};

            var params = angular.extend(
              {},
              extractParamsFromData(paramDefaults, self),
              extraParams
            );
            var built = buildUrl(url, params);

            var httpConfig = { method: method, url: built.url, params: built.query };
            if (/^(POST|PUT|PATCH)$/.test(method)) {
              httpConfig.data = stripPrivate(self);
            }

            var promise = $http(httpConfig).then(
              function (response) {
                if (method !== "DELETE") {
                  copyInto(self, response.data);
                }
                if (success) success(self, {});
                return self;
              },
              function (response) {
                if (error) error(response);
                return $q.reject(response);
              }
            );

            self.$promise = promise;
            return promise;
          };
        });

        return Resource;
      };
    },
  ];
});
