define(['angularAMD', 'angularUIRouter'], function(angularAMD){
	'use strict';
	
	var app = angular.module('Microtonal', ['ui.router']);
	
	app.config(['$urlRouterProvider', '$stateProvider', '$urlMatcherFactoryProvider', function($urlRouterProvider, $stateProvider, $urlMatcherFactoryProvider){
		function valToString(val) {
			return val !== null ? val.toString() : val;
		}

		$urlMatcherFactoryProvider.type('nonURIEncoded', {
			encode: valToString,
			decode: valToString,
			is: function () { return true; }
		});
		
		$urlRouterProvider.otherwise('/');
		
		var
			indexRoute = angularAMD.route({
				url            : '/',
				templateUrl    : 'js/views/index.html',
				controller     : 'IndexCtrl',
				controllerUrl  : 'controllers/index'
			}),
			monochordRoute = angularAMD.route({
				url            : '/monochord/{route:nonURIEncoded}',
				title          : 'Monochord',
				templateUrl    : 'js/views/monochord.html',
				controller     : 'MonochordCtrl',
				controllerUrl  : 'controllers/monochord'
			})
		;
		
		$stateProvider
			.state('index', indexRoute)
			.state('monochord', monochordRoute)
		;
	}]);
	
	// set title for every page
	app.run(['$rootScope', function($rootScope){
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			document.title = (toState.title || '') + (toState.title ? ' | ' : '') + 'Microtonal Ear Training';
		});
	}]);
	
	return angularAMD.bootstrap(app);
});