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
			template : '<form class="ui texted-input" autocomplete="off"><label class="buttongroup"><span class="button disabled left">{{label}}</span><span class="button disabled right editor" ng-transclude></span></label></form>',
			link : function(scope, element, attrs){
				element.find('input')
					/*
					.on('focus', function(){
						this.parentNode.classList.add('active');
					})
					.on('blur', function(){
						this.parentNode.classList.remove('active');
					})
					*/
					.on('input', function(){
						if(this.classList.contains('ng-invalid')){
							this.parentNode.classList.add('red');
						}else{
							this.parentNode.classList.remove('red');
						}
					})
				;
			}
		};
	})
;