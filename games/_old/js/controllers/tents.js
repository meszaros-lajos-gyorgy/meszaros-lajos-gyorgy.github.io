define(['app', 'classes/tents', 'components/menu'], function(app, Tents){
	'use strict';
	
	var tents = new Tents();
	tents.createMap({
		"width"		: 10,
		"height"	: 10,
		"tents"		: 6
	});
	console.log(tents.getMap(true));
	
	app.controller('TentsCtrl', ['$scope', '$http', '$stateParams', '$state', '$rootScope', function($scope, $http, $stateParams, $state, $rootScope){
		
	}]);
});