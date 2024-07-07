'use strict';

//Crear el service 'diccionarios'
angular.module('diccionarios').factory('Diccionarios',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' idioma
	//console.log("Uso servicio diccionarios");
	return $resource('api/diccionarios/:diccionarioId',{
		diccionarioId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
