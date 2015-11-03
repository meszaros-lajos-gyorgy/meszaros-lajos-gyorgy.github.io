(function(){
	'use strict';
	
	var app = angular.module('HoldclickDirective', []);
	
	app.directive('holdClick', function(){
		return {
			restrict: 'A',
			controller: ['$element', function($element){
				var firstPeriod = null;
				var secondPeriod = null;
				var over;
				
				var startHandler = function(e){
					if(!$element[0].disabled){
						$element.triggerHandler('click');
					}
					
					firstPeriod = setTimeout(function(){
						secondPeriod = setInterval(function(){
							if(over && !$element[0].disabled){
								$element.triggerHandler('click');
							}
						}, 50);
					}, 700);
					
					e.stopPropagation();
					// e.preventDefault();
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
				};
				
				$element[0].addEventListener('click', function(e){
					e.stopImmediatePropagation();
					e.preventDefault();
				});
				
				if(window.TouchEvent){
					over = true;
					$element[0].addEventListener('touchstart', startHandler);
					window.addEventListener('touchend', stopHandler);
				}else{
					over = false;
					$element[0].addEventListener('mousedown', function(e){
						over = true;
						startHandler(e);
					});
					window.addEventListener('mouseup', stopHandler);
					$element[0].addEventListener('mouseover', function(){
						over = true;
					});
					$element[0].addEventListener('mouseout', function(){
						over = false;
					});
				}
			}]
		}
	})
})();