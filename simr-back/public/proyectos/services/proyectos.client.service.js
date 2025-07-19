'use strict';

//Crear el service 'proyectos'
angular.module('proyectos').factory('Proyectos',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	//console.log("Uso servicio proyectos");
	return $resource('api/proyectos/:proyectoId',{
		proyectoId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
