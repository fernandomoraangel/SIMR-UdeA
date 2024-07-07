'use strict'
//Configuración de rutas para 'medios'
angular.module('medios').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/medios',{
			templateUrl:'medios/views/list-medio.client.view.html'
		}).
		when('/medios/create',{
			templateUrl: 'medios/views/create-medio.client.view.html'
		}).
		when('/medios/:medioId',{
			templateUrl:'medios/views/view-medio.client.view.html'
		}).
		when('/medios/:medioId/edit',{
			templateUrl:'medios/views/edit-medio.client.view.html'
		});
	}
	]);