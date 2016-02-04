angular
	.module('Presets', [])
	.factory('presets', ['$http', function($http){
		'use strict';
		
		return {
			load : function(){
				return $http
					.get('presets.json')
					.then(function(reply){
						reply.data.tunings.forEach(function(tuning){
							tuning.ratios.forEach(function(ratio){
								ratio.ratio.sort(function(a, b){
									return b - a;
								});
							});
						});
						
						return reply.data;
					})
				;
			}
		};
	}])
;