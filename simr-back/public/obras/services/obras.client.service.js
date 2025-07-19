'use strict';

//Crear el service 'obras'
angular.module('obras').factory('Obras',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	return $resource('api/obras/:obraId',{
		obraId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
