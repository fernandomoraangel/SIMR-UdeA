'use strict'
//Configuración de rutas para 'materias'
angular.module('materias').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/materias',{
			templateUrl:'materias/views/list-materia.client.view.html'
		}).
		when('/materias/create',{
			templateUrl: 'materias/views/create-materia.client.view.html'
		}).
		when('/materias/:materiaId',{
			templateUrl:'materias/views/view-materia.client.view.html'
		}).
		when('/materias/:materiaId/edit',{
			templateUrl:'materias/views/edit-materia.client.view.html'
		});
	}
	]);