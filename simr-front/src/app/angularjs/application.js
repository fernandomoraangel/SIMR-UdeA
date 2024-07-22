var mainApplicationModuleName = "simr";

var mainApplicationModule = angular.module(mainApplicationModuleName, [
  "ngResource",
  "ngRoute",
  "users",
  "example",
  "obras",
  "actores",
  "recursos",
  "ejemplares",
  "proyectos",
  "fondos",
  "colecciones",
  "medios",
  "sistemas",
  "materias",
  "generos",
  "instrumentos",
  "idiomas",
  "diccionarios",
  "generosNoMusicales",
  // "pruebas",
]);

mainApplicationModule.config([
  "$locationProvider",
  function ($locationProvider) {
    $locationProvider.hashPrefix("!");
  },
]);

angular.element(document).ready(function () {
  angular.bootstrap(document, [mainApplicationModuleName]);
});
