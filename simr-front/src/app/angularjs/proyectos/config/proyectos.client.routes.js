'use strict'
//Configuración de rutas para 'proyectos'
angular.module('proyectos').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/proyectos',{
			templateUrl:'proyectos/views/list-proyecto.client.view.html'
		}).
		when('/proyectos/create',{
			templateUrl: 'proyectos/views/create-proyecto.client.view.html'
		}).
		when('/proyectos/:proyectoId',{
			templateUrl:'proyectos/views/view-proyecto.client.view.html'
		}).
		when('/proyectos/:proyectoId/edit',{
			templateUrl:'proyectos/views/edit-proyecto.client.view.html'
		});
	}
	]);