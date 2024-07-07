'use strict';

//Crear el service 'actores'
angular.module('actores').factory('Actores',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	//console.log("Uso servicio actores");
	return $resource('api/actores/:actorId',{
		actorId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
