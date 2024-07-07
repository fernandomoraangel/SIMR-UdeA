'use strict'
//Configuración de rutas para 'diccionarios'
angular.module('diccionarios').config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
		when('/diccionarios',{
			templateUrl:'diccionarios/views/list-diccionario.client.view.html'
		}).
		when('/diccionarios/create',{
			templateUrl: 'diccionarios/views/create-diccionario.client.view.html'
		}).
		when('/diccionarios/:diccionarioId',{
			templateUrl:'diccionarios/views/view-diccionario.client.view.html'
		}).
		when('/diccionarios/:diccionarioId/edit',{
			templateUrl:'diccionarios/views/edit-diccionario.client.view.html'
		});
	}
	]);