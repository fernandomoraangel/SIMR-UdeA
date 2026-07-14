"use strict";

/**
 * route-shim.client.js
 * ------------------------------------------------------------------
 * Reemplazo propio y gratuito de "angular-route.js" (ngRoute).
 *
 * Motivo: el escaneo OWASP ZAP marcó como Severidad ALTA la librería
 * AngularJS "angular-route", por estar en estado EOL sin parches
 * oficiales de Google.
 *
 * Este archivo reimplementa el subconjunto de la API de ngRoute que
 * usa esta aplicación, apoyándose exclusivamente en servicios del
 * núcleo de angular.js ($location, $rootScope, $compile, $controller,
 * $templateRequest), que no fueron señalados en el escaneo:
 *
 *   - $routeProvider.when(path, route)
 *   - $routeProvider.otherwise({ redirectTo })
 *   - $routeParams (objeto inyectable, mutado en cada cambio de ruta)
 *   - Eventos $routeChangeStart / $routeChangeSuccess en $rootScope,
 *     con "next.$$route" y las propiedades personalizadas
 *     (permission, resource, requireAuth) copiadas tanto en "next"
 *     como en "next.$$route", para máxima compatibilidad con el
 *     código existente (core.client.module.js, controllers, etc.)
 *   - Directiva ng-view (usada como atributo: <section ng-view></section>)
 *
 * No implementa: resolve, reloadOnSearch, $route.updateParams,
 * animaciones (ngAnimate) ni rutas con wildcard "*".
 */

angular.module("ngRouteShim", []).provider("$route", function () {
  var routes = [];
  var otherwiseRoute = null;
  var compiledCache = null;

  function normalize(route) {
    return angular.extend({}, route);
  }

  // Convierte "/obras/:obraId/edit" en una expresión regular y la lista
  // de nombres de parámetros ("obraId").
  function compilePath(path) {
    var paramNames = [];
    var pattern = path.replace(/:(\w+)/g, function (match, name) {
      paramNames.push(name);
      return "([^/?]+)";
    });
    return { regex: new RegExp("^" + pattern + "$"), paramNames: paramNames };
  }

  function getCompiled() {
    if (!compiledCache) {
      compiledCache = routes.map(function (r) {
        var c = compilePath(r.path);
        return {
          path: r.path,
          route: r.route,
          regex: c.regex,
          paramNames: c.paramNames,
        };
      });
    }
    return compiledCache;
  }

  this.when = function (path, route) {
    routes.push({ path: path, route: normalize(route) });
    compiledCache = null;
    return this;
  };

  this.otherwise = function (route) {
    otherwiseRoute = normalize(route);
    return this;
  };

  this.$get = [
    "$rootScope",
    "$location",
    "$routeParams",
    function ($rootScope, $location, $routeParams) {
      function matchPath(pathValue) {
        var list = getCompiled();
        for (var i = 0; i < list.length; i++) {
          var r = list[i];
          var m = r.regex.exec(pathValue);
          if (m) {
            var params = {};
            r.paramNames.forEach(function (name, idx) {
              params[name] = decodeURIComponent(m[idx + 1]);
            });
            return { def: r.route, params: params, originalPath: r.path };
          }
        }
        return null;
      }

      function buildNext(matched, pathValue) {
        var def = matched ? matched.def : otherwiseRoute;
        if (!def) return null;

        var originalPath = matched ? matched.originalPath : pathValue;

        var next = angular.extend({}, def);
        next.params = matched ? matched.params : {};
        next.originalPath = originalPath;
        // Se expone tanto en "next" como en "next.$$route" (algunos
        // controllers de esta app leen next.requireAuth directamente,
        // otros leen next.$$route.permission / next.$$route.resource).
        next.$$route = angular.extend({}, def, { originalPath: originalPath });

        return next;
      }

      var $route = {
        routes: getCompiled(),
        current: null,
      };

      function update() {
        var pathValue = $location.path() || "/";
        var matched = matchPath(pathValue);

        if (!matched && !otherwiseRoute) {
          return;
        }

        var previous = $route.current;
        var next = buildNext(matched, pathValue);

        var event = $rootScope.$broadcast("$routeChangeStart", next, previous);
        if (event.defaultPrevented) {
          return;
        }

        if (!matched && otherwiseRoute && otherwiseRoute.redirectTo) {
          $location.path(otherwiseRoute.redirectTo).replace();
          return;
        }

        angular.forEach($routeParams, function (value, key) {
          delete $routeParams[key];
        });
        angular.extend($routeParams, next.params);

        $route.current = next;
        $rootScope.$broadcast("$routeChangeSuccess", next, previous);
      }

      $route.reload = update;

      $rootScope.$on("$locationChangeSuccess", update);
      // No se necesita un disparo inicial adicional: el núcleo de
      // angular.js (servicio $location/$browser) ya emite
      // "$locationChangeSuccess" una vez durante el bootstrap de la app,
      // lo cual activa "update()" y resuelve la ruta inicial.

      return $route;
    },
  ];
})

  .factory("$routeParams", function () {
    return {};
  })

  .directive("ngView", [
    "$route",
    "$compile",
    "$controller",
    "$templateRequest",
    function ($route, $compile, $controller, $templateRequest) {
      return {
        restrict: "ECA",
        link: function (scope, $element) {
          var currentScope = null;

          scope.$on("$routeChangeSuccess", update);
          update();

          function clear() {
            if (currentScope) {
              currentScope.$destroy();
              currentScope = null;
            }
            $element.empty();
          }

          function update() {
            var route = $route.current;
            clear();

            if (!route || !route.templateUrl) {
              return;
            }

            $templateRequest(route.templateUrl).then(
              function (html) {
                var newScope = scope.$new();
                $element.html(html);
                var linkFn = $compile($element.contents());

                if (route.controller) {
                  var controllerInstance = $controller(route.controller, {
                    $scope: newScope,
                  });
                  if (route.controllerAs) {
                    newScope[route.controllerAs] = controllerInstance;
                  }
                  $element.data("$ngViewController", controllerInstance);
                }

                linkFn(newScope);
                currentScope = newScope;
              },
              function () {
                // Falla al cargar la plantilla: se emite el mismo evento
                // que usaba ngRoute real para que el código existente
                // (core.client.module.js) muestre su mensaje de error.
                scope.$emit(
                  "$routeChangeError",
                  route,
                  null,
                  "No se pudo cargar la plantilla: " + route.templateUrl
                );
              }
            );
          }
        },
      };
    },
  ]);
