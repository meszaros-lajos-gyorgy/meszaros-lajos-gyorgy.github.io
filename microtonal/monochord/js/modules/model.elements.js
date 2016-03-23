angular
	.module('Elements', [])
	.factory('Elements', [function(){
		'use strict';
		
		return function(model, $scope, type){
			var self = this;
			
			// params : multiplier, volume, muted
			this.add = function(target, params){
				params = params || {};
				var set = (Number.isInteger(target) ? model.sets.findById(target) : target);
				var data = {};
				var property = (type === model.TYPE.STRING ? 'strings' : 'cents');
				if(set && set.hasOwnProperty(property)){
					data = {
						id : ++model._lastStringId,
						multiplier : params.hasOwnProperty('multiplier') ? params.multiplier : 1,
						volume : params.hasOwnProperty('volume') ? params.volume : 100,
						muted : params.hasOwnProperty('muted') ? params.muted : false
					};
					set[property].push(data);
				}
				return data;
			};
			// target: string object | stringId
			this.remove = function(target){
				var index = -1;
				var set;
				var property = (type === model.TYPE.STRING ? 'strings' : 'cents');
				
				if(Number.isInteger(target)){
					self[property].findById(target, function(string, _index, array, _set){
						set = _set;
						index = _index;
					});
				}else{
					$scope.sets.some(function(_set){
						index = _set[property].indexOf(target);
						if(index !== -1){
							set = _set;
							return true;
						}
					});
				}
				
				if(index !== -1){
					if(set.strings.length === 1){
						model.sets.remove(set.id);
					}else{
						$scope.sets.splice(index, 1);
					}
				}
			};
			this.findById = function(id, run){
				var property = (type === model.TYPE.STRING ? 'strings' : 'cents');
				var element;
				var found = $scope.sets.some(function(set){
					return set[property].some(function(_element, index, array){
						if(_element.id === id){
							if(run){
								run(_element, index, array, set);
							}
							element = _element;
							return true;
						}
					});
				});
				return (found ? element : null);
			};
		};
	}])
;