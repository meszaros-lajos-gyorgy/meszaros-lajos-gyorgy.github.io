(function(){
	'use strict';
	
	var app = angular.module('Microtonal', ['AudioModel']);
	
	// how to move this to a separate file?
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
	
	app.controller('MonochordCtrl', ['$scope', '$http', 'audio', function($scope, $http, audio){
		$http.get('presets.json').success(function(data){
			// DataModel.updatePresets(data);
		});
		/*
		var _scope = DataModel.$scope;
		_scope.exportKeys().forEach(function(key){
			$scope[key] = _scope[key];
			_scope.$watch(key, function(e){
				if($scope[key] !== e.newValue){
					$scope[key] = e.newValue;
					$scope.$apply();
				}
			});
			$scope.$watch(key, function(newValue, oldValue){
				if(_scope[key] !== newValue){
					_scope[key] = newValue;
				}
			}, true);
		});
		Object.keys(DataModel).forEach(function(key){
			if(key !== '$scope'){
				$scope[key] = DataModel[key];
			}
		});
		
		loadJSON('presets.json', function(data){
			DataModel.updatePresets(data);
		});
		*/
	}]);
})();