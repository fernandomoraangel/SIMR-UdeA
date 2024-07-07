'use strict'
//Configuración de rutas para 'idiomas'
angular.module('idiomas').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/idiomas',{
			templateUrl:'idiomas/views/list-idioma.client.view.html'
		}).
		when('/idiomas/create',{
			templateUrl: 'idiomas/views/create-idioma.client.view.html'
		}).
		when('/idiomas/:idiomaId',{
			templateUrl:'idiomas/views/view-idioma.client.view.html'
		}).
		when('/idiomas/:idiomaId/edit',{
			templateUrl:'idiomas/views/edit-idioma.client.view.html'
		});
	}
	]);