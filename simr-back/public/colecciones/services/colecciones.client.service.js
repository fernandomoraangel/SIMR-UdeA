'use strict';

//Crear el service 'colecciones'
angular.module('colecciones').factory('Colecciones',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	//console.log("Uso servicio colecciones");
	return $resource('api/colecciones/:coleccionId',{
		coleccionId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
