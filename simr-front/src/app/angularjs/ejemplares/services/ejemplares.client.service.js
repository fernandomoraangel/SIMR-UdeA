'use strict';

//Crear el service 'ejemplares'
angular.module('ejemplares').factory('Ejemplares',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' obra
	//console.log("Uso servicio ejemplares");
	return $resource('api/ejemplares/:ejemplarId',{
		ejemplarId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
