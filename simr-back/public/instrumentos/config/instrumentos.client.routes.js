'use strict'
//Configuración de rutas para 'instrumentos'
angular.module('instrumentos').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/instrumentos',{
			templateUrl:'instrumentos/views/list-instrumento.client.view.html'
		}).
		when('/instrumentos/create',{
			templateUrl: 'instrumentos/views/create-instrumento.client.view.html'
		}).
		when('/instrumentos/:instrumentoId',{
			templateUrl:'instrumentos/views/view-instrumento.client.view.html'
		}).
		when('/instrumentos/:instrumentoId/edit',{
			templateUrl:'instrumentos/views/edit-instrumento.client.view.html'
		});
	}
	]);