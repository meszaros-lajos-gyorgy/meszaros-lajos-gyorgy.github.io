angular
	.module('Converter', ['ScalaConverter'])
	.factory('converter', ['scalaConverter', '$http', function(scalaConverter, $http){
		'use strict';
		
		var types = {
			SCALA : 0x01,
			JSON : 0x02,
			HTTP : 0x04
		};
		
		var $scope, model;
		
		return {
			types : types,
			bindModel : function(_scope, _model){
				$scope = _scope;
				model = _model;
				return this;
			},
			load : function(url, type){
				var ret = $http.get(url, {responseType : 'text'});
				switch(type){
					case types.SCALA :
						ret = ret.then(function(response){
							return scalaConverter.toJson(response.data);
						});
						break;
				}
				return ret;
			},
			injectIntoModel : function(data){
				var set, type, min;
				
				$scope.retune = 'lowestToBaseFreq';
				
				data.notes.some(function(note){
					set = model.sets.add();
					type = (note.type === 'ratio' ? 'strings' : 'cents');
					min = note.multipliers.sort()[0];
					note.multipliers.forEach(function(multiplier, index){
						model[type].add(set, {
							multiplier : multiplier,
							muted : min === multiplier
						});
					});
				});
			},
			extractFromModel : function(){
				return angular.toJson($scope);
			}
		};
	}])
;