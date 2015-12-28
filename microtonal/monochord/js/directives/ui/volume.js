(function(){
	'use strict';
	
	angular
		.module('VolumeDirective', [])
		.directive('volume', function(){
			return {
				restrict: 'E',
				scope: {
					ngModel: '='
				},
				template: '<label class="ui volume"><input type="range" min="0" max="100" autocomplete="off" ng-model="ngModel" /><span class="data">{{ngModel}}%</span></label>',
				controller: ['$scope', '$element', function($scope, $element){
					
				}]
			};
		})
	;
})();