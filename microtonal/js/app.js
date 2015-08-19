define(['angularAMD', 'angular-route'], function(angularAMD){
	'use strict';
	
	var app = angular.module('Microtonal', ['ngRoute']);
	
	app.config(function($routeProvider){
		var titlePostfix = 'Microtonal Ear Training';
		var
			indexRoute = angularAMD.route({
				title         : titlePostfix,
				templateUrl   : 'js/views/index.html',
				controller    : 'IndexCtrl',
				controllerUrl : 'controllers/index'
			}),
			monochordRoute = angularAMD.route({
				title         : 'Monochord | ' + titlePostfix,
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
	
	app.run(['$rootScope', '$route', function($rootScope, $route){
		$rootScope.$on('$routeChangeSuccess', function(){
			document.title = $route.current.title;
		});
	}]);
	
	return angularAMD.bootstrap(app);
});