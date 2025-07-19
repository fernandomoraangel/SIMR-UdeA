'use strict'
//Configuración de rutas para 'generos'
angular.module('generos').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/generos',{
			templateUrl:'generos/views/list-genero.client.view.html'
		}).
		when('/generos/create',{
			templateUrl: 'generos/views/create-genero.client.view.html'
		}).
		when('/generos/:generoId',{
			templateUrl:'generos/views/view-genero.client.view.html'
		}).
		when('/generos/:generoId/edit',{
			templateUrl:'generos/views/edit-genero.client.view.html'
		});
	}
	]);