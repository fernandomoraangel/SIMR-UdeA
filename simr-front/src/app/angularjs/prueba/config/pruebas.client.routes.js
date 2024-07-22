'use strict'
//Configuración de rutas para 'pruebas'
angular.module('pruebas').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/pruebas',{
			templateUrl:'pruebas/views/list-prueba.client.view.html'
		}).
		when('/pruebas/create',{
			templateUrl: 'pruebas/views/create-prueba.client.view.html'
		}).
		when('/pruebas/:pruebaId',{
			templateUrl:'pruebas/views/view-prueba.client.view.html'
		}).
		when('/pruebas/:pruebaId/edit',{
			templateUrl:'pruebas/views/edit-prueba.client.view.html'
		});
	}
	]);