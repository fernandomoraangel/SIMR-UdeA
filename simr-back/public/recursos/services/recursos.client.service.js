'use strict';

//Crear el service 'recursos'
angular.module('recursos').factory('Recursos',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' recurso
	//alert("Uso servicio recursos");
	return $resource('api/recursos/:recursoId',{
		recursoId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
