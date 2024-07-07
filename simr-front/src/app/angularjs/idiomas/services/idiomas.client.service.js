'use strict';

//Crear el service 'idiomas'
angular.module('idiomas').factory('Idiomas',['$resource', function($resource){
	//Usar el service '$resource' para devolver un objeto '$resource' idioma
	//console.log("Uso servicio idiomas");
	return $resource('api/idiomas/:idiomaId',{
		idiomaId:'@_id'
	},{
		update:{
			method:'PUT'
		}
	});
}]);
