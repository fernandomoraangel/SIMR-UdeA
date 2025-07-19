'use strict';

//Crear el service 'instrumentos'
angular.module('instrumentos').factory('Instrumentos',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' instrumento
	//alert("Uso servicio instrumentos");
	return $resource('api/instrumentos/:instrumentoId',{
		instrumentoId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
