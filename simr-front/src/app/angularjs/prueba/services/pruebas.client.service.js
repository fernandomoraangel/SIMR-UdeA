'use strict';

//Crear el service 'pruebas'
angular.module('pruebas').factory('Pruebas',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' prueba
	console.log("Uso servicio pruebas");
	// return $resource('api/pruebas/:pruebaId',{
	// 	pruebaId:'@_id'
	// },{
	// 	update:{
	// 		method:'PUT'
	// 	}
	// });
}]);
