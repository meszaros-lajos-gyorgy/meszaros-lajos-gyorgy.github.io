define(['angularAMD', 'angularUIRouter'], function(angularAMD){
	'use strict';
	
	var app = angular.module('Games', ['ui.router']);
	
	app.config(['$urlRouterProvider', '$stateProvider', '$urlMatcherFactoryProvider', function($urlRouterProvider, $stateProvider, $urlMatcherFactoryProvider){
		function valToString(val) {
			return val !== null && val !== undefined ? val.toString() : val;
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
			tentsRoute = angularAMD.route({
				url            : '/tents/{route:nonURIEncoded}',
				title          : 'Tents',
				templateUrl    : 'js/views/tents.html',
				controller     : 'TentsCtrl',
				controllerUrl  : 'controllers/tents'
			})
		;
		
		$stateProvider
			.state('index', indexRoute)
			.state('tents', tentsRoute)
		;
	}]);
	
	// set title for every page
	app.run(['$rootScope', function($rootScope){
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			document.title = (toState.title || '') + (toState.title ? ' | ' : '') + 'Games';
		});
	}]);
	
	return angularAMD.bootstrap(app);
});