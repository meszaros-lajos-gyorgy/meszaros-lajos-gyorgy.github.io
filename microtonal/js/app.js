define(['angularAMD', 'angular-route'], function(angularAMD){
	'use strict';
	
	var app = angular.module('Microtonal', ['ngRoute']);
	
	app.config(function($routeProvider){
		var
			indexRoute = angularAMD.route({
				templateUrl   : 'js/views/index.html',
				controller    : 'IndexCtrl',
				controllerUrl : 'controllers/index'
			}),
			monochordRoute = angularAMD.route({
				templateUrl   : 'js/views/monochord.html',
				controller    : 'MonochordCtrl',
				controllerUrl : 'controllers/monochord'
			})
		;
		
		$routeProvider
			.when('/',           indexRoute)
			.when('/monochord/', monochordRoute)
			.otherwise({
				redirectTo : '/'
			})
		;
	});
	
	return angularAMD.bootstrap(app);
});