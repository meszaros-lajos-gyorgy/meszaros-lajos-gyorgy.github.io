(function(){
	'use strict';
	
	var app = angular.module('Microtonal', []);
	
	app.directive('stringToNumber', function() {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				ngModel.$parsers.push(function(value) {
					return '' + value;
				});
				ngModel.$formatters.push(function(value) {
					return parseFloat(value, 10);
				});
			}
		};
	});
	
	var lastStringId = 0;
	var lastSetId = 0;
	
	app.controller('MonochordCtrl', ['$scope', '$http', function($scope, $http){
		/*
		var _scope = window.DataModel.$scope;
		_scope.exportKeys().forEach(function(key){
			$scope[key] = _scope[key];
		});
		
		_scope.$watch('__changed', function(e){
			
		});
		*/
		
		/*
		$scope.baseFrequency = 100;
		$scope.baseVolume = 100;
		$scope.sets = [];
		$scope.presets = {};
		$scope.defaultVolume = 0;
		$scope._normalizeStringTargets = {};
		$scope.rawImportData = '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]';
		
		$http.get('presets.json').success(function(data){
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[0];
		});
		*/
	}]);
})();