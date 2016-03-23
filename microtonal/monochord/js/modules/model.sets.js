angular
	.module('Sets', [])
	.factory('Sets', [function(){
		'use strict';
		
		return function(model, $scope){
			var self = this;
			
			// adds a set with given params
			// @param params : (optional) <object>
			//   volume : <int:0..100> | 100
			//   muted : <bool> | false
			// @returns <object> : the created set
			this.add = function(params){
				params = params || {};
				var data = {
					id : ++model._lastSetId,
					retune : $scope.retune.defaultForNew,
					strings : [],
					cents : [],
					volume : params.hasOwnProperty('volume') ? params.volume : 100,
					muted : params.hasOwnProperty('muted') ? params.muted : false
				};
				$scope.sets.push(data);
				return data;
			},
			// removes a set, specified by target
			// @param target : <object> | <int>
			//   object should be a valid set from the $scope.sets
			//   int should be a valid id of a set from $scope.sets
			this.remove = function(target){
				var index = -1;
				if(Number.isInteger(target)){
					self.findById(target, function(set, _index){
						index = _index;
					});
				}else{
					index = $scope.sets.indexOf(target);
				}
				if(index !== -1){
					$scope.sets.splice(index, 1);
				}
			},
			// finds a set by ID; if found, then calls run
			// @param setId : <int>
			// @param run : <function>(set, index, array)
			//   where set is the found set's data object
			//   index is the index of set in $scope.sets
			//   array is $scope.sets
			// @return the set, that has been found or null
			this.findById = function(setId, run){
				var set = null;
				$scope.sets.some(function(_set, index, array){
					if(_set.id === setId){
						if(run){
							run(_set, index, array);
						}
						set = _set;
						return true;
					}
				});
				return set;
			},
			// find the set, that comes before the target in the list of sets
			// @param target : <object> | <int>
			//   object should be a valid set from the $scope.sets
			//   int should be a valid id of a set from $scope.sets
			// @param run : <function>(set)
			//   where set is the found set's data object
			// @return the set, that has been found or null
			this.findPrevious = function(target, run){
				var setId = (Number.isInteger(target) ? target : target.id);
				var prevSet = null;
				var found = $scope.sets.some(function(set){
					if(set.id === setId && prevSet !== null){
						if(run){
							run(prevSet);
						}
						return true;
					}else{
						prevSet = set;
					}
				});
				return (found ? prevSet : null);
			},
			// find the set, that comes after the target in the list of sets
			// @param target : <object> | <int>
			//   object should be a valid set from the $scope.sets
			//   int should be a valid id of a set from $scope.sets
			// @param run : <function>(set)
			//   where set is the found set's data object
			// @return the set, that has been found or null
			this.findNext = function(target, run){
				var setId = (Number.isInteger(target) ? target : target.id);
				var prevSet = null;
				var set;
				var found = $scope.sets.some(function(_set){
					if(prevSet !== null && prevSet.id === setId){
						if(run){
							run(_set);
						}
						set = _set;
						return true;
					}else{
						prevSet = _set;
					}
				});
				return (found ? set : null);
			}
		};
	}])
;