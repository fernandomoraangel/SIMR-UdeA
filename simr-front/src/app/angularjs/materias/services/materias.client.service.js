'use strict';

//Crear el service 'materias'
angular.module('materias').factory('Materias',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	//console.log("Uso servicio materias");
	return $resource('api/materias/:materiaId',{
		materiaId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);