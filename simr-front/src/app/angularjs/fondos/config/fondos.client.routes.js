'use strict'
//Configuración de rutas para 'fondos'
angular.module('fondos').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/fondos',{
			templateUrl:'fondos/views/list-fondo.client.view.html'
		}).
		when('/fondos/create',{
			templateUrl: 'fondos/views/create-fondo.client.view.html'
		}).
		when('/fondos/:fondoId',{
			templateUrl:'fondos/views/view-fondo.client.view.html'
		}).
		when('/fondos/:fondoId/edit',{
			templateUrl:'fondos/views/edit-fondo.client.view.html'
		});
	}
	]);