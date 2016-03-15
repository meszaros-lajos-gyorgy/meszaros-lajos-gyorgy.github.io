angular
	.module('TextedInput', [])
	.directive('textedInput', function(){
		'use strict';
		
		return {
			restrict : 'E',
			scope : {
				label : '='
			},
			transclude: true,
			template : '<form class="ui texted-input" autocomplete="off" novalidate="novalidate"><label><span class="left">{{label}}</span><span class="right editor" ng-transclude></span></label></form>',
			link : function(scope, element, attrs){
				element.find('input').on('focus', function(){
					this.parentNode.classList.add('active');
				}).on('blur', function(){
					this.parentNode.classList.remove('active');
				})
			}
		};
	})
;