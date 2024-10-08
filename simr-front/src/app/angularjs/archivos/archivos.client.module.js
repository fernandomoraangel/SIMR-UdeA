// angular.module('archivos', [])
//   .factory('ArchivosService', ['$resource', '$http', function ($resource, $http) { }]);

angular.module('archivos', [])
  .factory('ArchivosService', function () {
    var angularAppOrigin = 'http://localhost:4200';
    var angularWindowFileUpload;
    var angularWindowFileList;

    return {
      subirArchivo: function () {
        if (angularWindowFileUpload && !angularWindowFileUpload.closed) {
          angularWindowFileUpload.focus();
        } else {
          angularWindowFileUpload = window.open(angularAppOrigin + '/files/upload', 'AngularApp', 'width=563,height=365');
        }
      },

      sayHello: function () {
        console.log('Hello from ArchivosService');
      }


    }


  });
