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
  "archivos",
]);

mainApplicationModule.config([
  "$locationProvider",
  function ($locationProvider) {
    $locationProvider.hashPrefix("!");
    // $locationProvider.html5Mode(true);
  },
]);

angular.element(document).ready(function () {
  angular.bootstrap(document, [mainApplicationModuleName]);
});
