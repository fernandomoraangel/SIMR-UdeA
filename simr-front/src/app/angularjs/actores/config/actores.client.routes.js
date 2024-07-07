'use strict'
//Configuración de rutas para 'actores'
angular.module('actores').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/actores',{
			templateUrl:'actores/views/list-actor.client.view.html'
		}).
		when('/actores/create',{
			templateUrl: 'actores/views/create-actor.client.view.html'
		}).
		when('/actores/:actorId',{
			templateUrl:'actores/views/view-actor.client.view.html'
		}).
		when('/actores/:actorId/edit',{
			templateUrl:'actores/views/edit-actor.client.view.html'
		});
	}
	]);