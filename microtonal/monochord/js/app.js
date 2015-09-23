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
	
	function loadJSON(URL, callBack){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				try{
					callBack(JSON.parse(xhr.responseText));
				}catch(e){}
			}
		}
		xhr.open('GET', URL, true);
		xhr.send();
	}
	
	app.controller('MonochordCtrl', ['$scope', function($scope){
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
	}]);
})();