(function(){
	'use strict';
	
	var app = angular.module('HoldclickDirective', []);
	
	app.directive('holdClick', function(){
		return {
			restrict: 'A',
			controller: ['$element', function($element){
				var over = false;
				var firstPeriod = null;
				var secondPeriod = null;
				
				var startHandler = function(e){
					over = true;
					
					$element.triggerHandler('click');
					
					firstPeriod = setTimeout(function(){
						if(over){
							secondPeriod = setInterval(function(){
								$element.triggerHandler('click');
							}, 50);
						}
					}, 700);
					
					e.stopPropagation();
					e.preventDefault();
				};
				var stopHandler = function(e){
					if(firstPeriod !== null){
						clearTimeout(firstPeriod);
						firstPeriod = null;
					}
					if(secondPeriod !== null){
						clearInterval(secondPeriod);
						secondPeriod = null;
					}
					
					e.stopPropagation();
					e.preventDefault();
				};
				
				var moveHandler = function(e){
					over = e.target === $element[0];
				};
				var clickHandler = function(e){
					e.stopImmediatePropagation();
					e.preventDefault();
				};
				
				$element[0].addEventListener('mousedown', startHandler);
				$element[0].addEventListener('touchstart', startHandler);
				
				$element[0].addEventListener('mouseup', stopHandler);
				$element[0].addEventListener('touchend', stopHandler);
				
				$element[0].addEventListener('click', clickHandler);
				
				window.addEventListener('mousemove', moveHandler);
				window.addEventListener('touchmove', moveHandler);
			}]
		}
	})
})();