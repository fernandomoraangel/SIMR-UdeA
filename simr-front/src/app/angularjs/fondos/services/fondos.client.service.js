'use strict';

//Crear el service 'fondos'
angular.module('fondos').factory('Fondos',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	//console.log("Uso servicio fondos");
	return $resource('api/fondos/:fondoId',{
		fondoId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
