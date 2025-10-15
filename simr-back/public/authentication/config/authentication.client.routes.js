"use strict";

angular.module("authentication").config(function ($routeProvider) {
  $routeProvider
    .when("/login", {
      templateUrl: "/authentication/views/login.client.view.html",
      controller: "AuthenticationController",
      requireAuth: false,
    })
    .when("/signup", {
      templateUrl: "/authentication/views/signup.client.view.html",
      controller: "AuthenticationController",
      requireAuth: false,
    })
    .otherwise({
      redirectTo: "/",
    });
});
