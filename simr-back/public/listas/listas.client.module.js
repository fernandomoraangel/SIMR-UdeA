angular.module("listas", []);
// Filtro para mayúscula inicial
angular.module("listas").filter("capitalize", function () {
  return function (input) {
    if (!input) return "";
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});
