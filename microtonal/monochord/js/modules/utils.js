angular
	.module('Utils', [])
	.factory('utils', [function(){
		'use strict';

		function clone(obj){
			return JSON.parse(JSON.stringify(obj));
		}
		
		return {
			clone : clone
		}
	}])
;