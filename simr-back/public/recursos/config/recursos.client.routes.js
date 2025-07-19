'use strict'
//Configuración de rutas para 'recursos'
angular.module('recursos').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/recursos',{
			templateUrl:'recursos/views/list-recurso.client.view.html'
		}).
		when('/recursos/create',{
			templateUrl: 'recursos/views/create-recurso.client.view.html'
		}).
		when('/recursos/:recursoId',{
			templateUrl:'recursos/views/view-recurso.client.view.html'
		}).
		when('/recursos/:recursoId/edit',{
			templateUrl:'recursos/views/edit-recurso.client.view.html'
		});
	}
	]);