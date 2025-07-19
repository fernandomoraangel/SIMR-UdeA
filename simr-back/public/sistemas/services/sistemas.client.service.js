'use strict';

//Crear el service 'Sistemas'
angular.module('sistemas').factory('Sistemas',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' sistema
	//console.log("Uso servicio Sistemas");
	return $resource('api/Sistemas/:sistemaId',{
		sistemaId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
