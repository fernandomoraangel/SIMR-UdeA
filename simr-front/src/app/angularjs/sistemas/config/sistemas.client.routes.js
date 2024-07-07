'use strict'
//Configuración de rutas para 'sistemas'
angular.module('sistemas').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/sistemas',{
			templateUrl:'sistemas/views/list-sistema.client.view.html'
		}).
		when('/sistemas/create',{
			templateUrl: 'sistemas/views/create-sistema.client.view.html'
		}).
		when('/sistemas/:sistemaId',{
			templateUrl:'sistemas/views/view-sistema.client.view.html'
		}).
		when('/sistemas/:sistemaId/edit',{
			templateUrl:'sistemas/views/edit-sistema.client.view.html'
		});
	}
	]);