'use strict'
//Configuración de rutas para 'colecciones'
angular.module('colecciones').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/colecciones',{
			templateUrl:'colecciones/views/list-coleccion.client.view.html'
		}).
		when('/colecciones/create',{
			templateUrl: 'colecciones/views/create-coleccion.client.view.html'
		}).
		when('/colecciones/:coleccionId',{
			templateUrl:'colecciones/views/view-coleccion.client.view.html'
		}).
		when('/colecciones/:coleccionId/edit',{
			templateUrl:'colecciones/views/edit-coleccion.client.view.html'
		});
	}
	]);