//Crear función contructor y utilizar inyección de dependencia para el objeto scope
angular.module("example").controller("ExampleController", [
  "$scope",
  "Authentication",
  function ($scope, Authentication) {
    $scope.authentication = Authentication;
    $scope.acercaDe = function () {
      Swal.fire({
        html: "SISTEMA DE INFORMACIÓN MUSICAS REGIONALES-SIMR<br />Versión: 1.0<br />Grupo de investigación Músicas Regionales<br />Universidad de Antioquia<br /> Conceptualización: Grupo de Investigación Músicas Regionales<br />Desarrollo: Fernando Mora Ángel<br />2022",
        //icon: "info",
        imageUrl: "img/logomr.png",
        timer: 8000,
        width: "50em",
        background: "#c4e3d2",
        showConfirmButton: false,
      });
    };
  },
]);
