'use strict';

//Crear el service 'medios'
angular.module('medios').factory('Medios',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' medio
	//console.log("Uso servicio medios");
	return $resource('api/medios/:medioId',{
		medioId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
