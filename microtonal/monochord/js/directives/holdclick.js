(function(){
	'use strict';
	
	var app = angular.module('HoldclickDirective', []);
	
	// var manualMouseupTarget = null;
	
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
						if($element[0].disabled){
							stopHandler(e);
							// manualMouseupTarget = $element[0];
						}
					}
					
					firstPeriod = setTimeout(function(){
						secondPeriod = setInterval(function(){
							if(over && !$element[0].disabled){
								$element.triggerHandler('click');
								if($element[0].disabled){
									stopHandler(e);
									// manualMouseupTarget = $element[0];
								}
							}
						}, 50);
					}, 700);
					
					e.stopPropagation();
					// e.preventDefault();
				};
				var stopHandler = function(e){
					// if(e.target === manualMouseupTarget){
					// 	manualMouseupTarget = null;
					// }else{
						if(firstPeriod !== null){
							clearTimeout(firstPeriod);
							firstPeriod = null;
						}
						if(secondPeriod !== null){
							clearInterval(secondPeriod);
							secondPeriod = null;
						}
					// }
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
						if(e.buttons === 1){
							startHandler(e);
						}
					});
					window.addEventListener('mouseup', function(e){
						if(e.target === $element[0] && e.buttons !== 1){
							stopHandler(e);
						}
					});
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