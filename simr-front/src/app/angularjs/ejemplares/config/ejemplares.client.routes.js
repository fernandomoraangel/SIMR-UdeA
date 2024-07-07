'use strict'
//Configuración de rutas para 'ejemplares'
angular.module('ejemplares').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/ejemplares',{
			templateUrl:'ejemplares/views/list-ejemplar.client.view.html'
		}).
		when('/ejemplares/create',{
			templateUrl: 'ejemplares/views/create-ejemplar.client.view.html'
		}).
		when('/ejemplares/:ejemplarId',{
			templateUrl:'ejemplares/views/view-ejemplar.client.view.html'
		}).
		when('/ejemplares/:ejemplarId/edit',{
			templateUrl:'ejemplares/views/edit-ejemplar.client.view.html'
		});
	}
	]);