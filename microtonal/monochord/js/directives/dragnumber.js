(function(){
	'use strict';
	
	angular
		.module('DragnumberDirective', [])
		.directive('dragnumber', function(){
			return {
				restrict: 'E',
				scope: {
					ngModel: '=',
					min: '=',
					max: '=',
					weight: '=',
					ngClass: '='
				},
				template: '<input ng-model="ngModel" type="number" ng-class="ngClass" class="dragnumber" min="{{min}}" max="{{max}}" autocomplete="off" data-weight="{{weight}}" />',
				controller: ['$scope', '$element', function($scope, $element){
					var listening = false;
					var startClientY;
					var startValue;
					var stopClientY;
					
					var input = $element[0].querySelector('input');
					
					input.addEventListener('focus', function(){
						if(!input.classList.contains('edit')){
							input.blur();
						}
					});
					input.addEventListener('click', function(){
						if(stopClientY === startClientY){
							input.classList.add('edit');
							input.focus();
						}else{
							if(!input.classList.contains('edit')){
								input.blur();
							}
						}
					});
					input.addEventListener('blur', function(){
						if(input.classList.contains('edit')){
							input.classList.remove('edit');
						}
					});
					
					var getY = function(e){
						var y = undefined;
						if(e.clientY){
							y = e.clientY;
						}else if(e.targetTouches){
							y = e.targetTouches[0].clientY;
						}
						return (y === undefined ? 0 : y);
					};
					
					var startHandler = function(e){
						if(input.classList.contains('edit')){
							return ;
						}
						listening = true;
						startClientY = getY(e);
						startValue = parseInt(this.value, 10) || 0;
						e.stopPropagation();
					};
					var stopHandler = function(e){
						if(input.classList.contains('edit')){
							return ;
						}
						stopClientY = getY(e);
						listening = false;
						e.stopPropagation();
						e.preventDefault();
					};
					
					var moveHandler = function(e){
						if(input.classList.contains('edit')){
							return ;
						}
						if(listening){
							var weight = parseInt(this.getAttribute('data-weight'), 10);
							if(isNaN(weight) || weight <= 0){
								weight = 1;
							}
							var value = Math.floor((getY(e) - startClientY) * -1 / weight) + startValue;
							if(this.hasAttribute('min')){
								var min = parseInt(this.getAttribute('min'), 10);
								if(value < min){
									value = min;
								}
							}
							if(this.hasAttribute('max')){
								var max = parseInt(this.getAttribute('max'), 10);
								if(value > max){
									value = max;
								}
							}
							$scope.$apply(function() {
								$scope.ngModel = value;
							});
						}
						e.stopPropagation();
						e.preventDefault();
					};
					
					input.addEventListener('mousedown', startHandler);
					input.addEventListener('touchstart', startHandler);
					
					input.addEventListener('mouseup', stopHandler);
					input.addEventListener('touchend', stopHandler);
					
					input.addEventListener('mousemove', moveHandler);
					input.addEventListener('touchmove', moveHandler);
				}]
			};
		})
	;
})();