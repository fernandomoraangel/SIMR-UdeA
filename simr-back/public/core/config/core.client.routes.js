angular.module("core").config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      // .when('/login', {
      // 	templateUrl: '/core/views/login.client.view.html',
      // 	controller: 'AuthController'
      // })
      // .when('/signup', {
      // 	templateUrl: '/core/views/signup.client.view.html',
      // 	controller: 'AuthController'
      // })
      .when("/", {
        templateUrl: "/core/views/core.client.view.html",
        requireAuth: false,
      });
    // .otherwise({
    // 	redirectTo: '/'
    // });
  },
]);
