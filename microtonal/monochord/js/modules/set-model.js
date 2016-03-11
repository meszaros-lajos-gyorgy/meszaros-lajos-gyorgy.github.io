/*
$scope.sets = [{
	id : <int>,	// setId
	muted : <bool>,
	volume : 0..100,
	cents : [{
		id : <int>, // centId
		multiplier : <float>,
		muted : <bool>,
		volume : 0..100,
		type : <string:sine|square|sawtooth|triangle>
	}, ...],
	strings : [{
		id : <int>, // stringId
		multiplier : lowestHarmonic..highestHarmonic,
		muted : <bool>,
		volume : 0..100,
		type : <string:sine|square|sawtooth|triangle>
	}, ...],
	retune : <string>
}, ...];
*/
angular
	.module('SetModel', ['Math', 'AudioModel', 'Retune', 'Harmonics', 'Element'])
	.factory('SetModel', ['math', 'audioModel', 'Retune', 'Harmonics', 'Element', function(math, audioModel, Retune, Harmonics, Element){
		'use strict';
		
		return function($scope, models){
			var self = this;
			
			this._lastSetId = 0;
			this._lastStringId = 0;
			
			var lowestHarmonic = 1;
			var highestHarmonic = 1e6;
			var lowestCent = 0;
			var highestCent = Infinity;
			
			this.commit = function(){
				$scope.$apply();
			};
			
			this.TYPE = {
				STRING : 0x01,
				CENT : 0x02
			};
			
			this.sets = {
				// adds a set with given params
				// @param params : (optional) <object>
				//   volume : <int:0..100> | 100
				//   muted : <bool> | false
				// @returns <object> : the created set
				add : function(params){
					params = params || {};
					var data = {
						id : ++self._lastSetId,
						retune : $scope[models.retune].defaultForNew,
						strings : [],
						cents : [],
						volume : params.hasOwnProperty('volume') ? params.volume : 100,
						muted : params.hasOwnProperty('muted') ? params.muted : false
					};
					$scope[models.sets].push(data);
					return data;
				},
				// removes a set, specified by target
				// @param target : <object> | <int>
				//   object should be a valid set from the $scope.sets
				//   int should be a valid id of a set from $scope.sets
				remove : function(target){
					var index = -1;
					if(Number.isInteger(target)){
						self.sets.findById(target, function(set, _index){
							index = _index;
						});
					}else{
						index = $scope[models.sets].indexOf(target);
					}
					if(index !== -1){
						$scope[models.sets].splice(index, 1);
					}
				},
				// finds a set by ID; if found, then calls run
				// @param setId : <int>
				// @param run : <function>(set, index, array)
				//   where set is the found set's data object
				//   index is the index of set in $scope.sets
				//   array is $scope.sets
				// @return the set, that has been found or null
				findById : function(setId, run){
					var set = null;
					$scope[models.sets].some(function(_set, index, array){
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
				findPrevious : function(target, run){
					var setId = (Number.isInteger(target) ? target : target.id);
					var prevSet = null;
					var found = $scope[models.sets].some(function(set){
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
				findNext : function(target, run){
					var setId = (Number.isInteger(target) ? target : target.id);
					var prevSet = null;
					var set;
					var found = $scope[models.sets].some(function(_set){
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
			
			var retune = new Retune(this, $scope, models);
			this.strings = new Element(this, this.TYPE.STRING, $scope, models);
			this.cents = new Element(this, this.TYPE.CENT, $scope, models);
			this.harmonics = new Harmonics(this);
			
			this.calculate = {
				baseFrequency : function(target, type){
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(!set){
						return 0;
					}
					var method = set.retune;
					if(method === 'inherit'){
						method = $scope[models.retune].default;
					}
					if(!retune[method]){
						method = 'off';
					}
					
					return retune[method](set, type);
				},
				frequency : function(target, type){
					var freq;
					var id = (Number.isInteger(target) ? target : target.id);
					var isCentType = type === self.TYPE.CENT;
					self[isCentType ? 'cents' : 'strings'].findById(id, function(element, index, array, set){
						freq =
							self.calculate.baseFrequency(set, type)
							* (isCentType ? math.centsToFraction(element.multiplier) : element.multiplier)
						;
					});
					return freq;
				},
				frequencies : function(target, type){
					var arr = [];
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					
					if(set){
						var baseFreq = self.calculate.baseFrequency(set, type);
						var isCentType = type === self.TYPE.CENT;
						var elements = set[isCentType ? 'cents' : 'strings'];
						var iSize = elements.length;
						for(var i = 0; i < iSize; i++){
							arr.push(baseFreq * (isCentType ? math.centsToFraction(elements[i].multiplier) : elements[i].multiplier));
						}
					}
					
					return arr;
				},
				
				/*
				cent : function(stringId){
					var cents;
					
					self.strings.findById(stringId, function(string, index, array, set){
						var baseFreq = self.calculate.baseFrequency(id, 'string', set);
						cents = math.fractionToCents(math.ratioToFraction(baseFreq, baseFreq * string.multiplier));
					});
					
					return cents;
				},
				cents : function(set){
					var arr = [];
					
					set.strings.forEach(function(string){
						arr.push(self.calculate.cent(string.id));
					});
					
					return arr;
				}
				*/
			};
			
			// -----------------
			
			function diffScopeChange(newValue, oldValue){
				var sets = {
					added : [],
					removed : [],
					changed : []
				};
				var strings = {
					added : [],
					removed : [],
					changed : []
				};
				var cents = {
					added : [],
					removed : [],
					changed : []
				};
				
				newValue.forEach(function(newSet){
					var group = 'added';
					var oldSet;
					oldValue.some(function(_oldSet){
						if(_oldSet.id === newSet.id){
							oldSet = _oldSet;
							group = 'changed';
							return true;
						}
					});
					
					sets[group].push(newSet.id);
					
					newSet.strings.forEach(function(newString){
						strings[
							group !== 'added'
							&& oldSet.strings.some(function(oldString){
								return oldString.id == newString.id;
							})
							? 'changed'
							: 'added'
						].push(newString.id);
					});
					
					newSet.cents.forEach(function(newCent){
						cents[
							group !== 'added'
							&& oldSet.cents.some(function(oldCent){
								return oldCent.id == newCent.id;
							})
							? 'changed'
							: 'added'
						].push(newCent.id);
					});
				});
				
				oldValue.forEach(function(oldSet){
					if(
						sets.added.indexOf(oldSet.id) === -1
						&& sets.changed.indexOf(oldSet.id) === -1
					){
						sets.removed.push(oldSet.id);
						oldSet.strings.forEach(function(oldString){
							strings.removed.push(oldString.id);
						});
						oldSet.cents.forEach(function(oldCent){
							cents.removed.push(oldCent.id);
						})
					}else{
						oldSet.strings.forEach(function(oldString){
							if(
								strings.added.indexOf(oldString.id) === -1
								&& strings.changed.indexOf(oldString.id) === -1
							){
								strings.removed.push(oldString.id);
							}
						});
						oldSet.cents.forEach(function(oldCent){
							if(
								cents.added.indexOf(oldCent.id) === -1
								&& cents.changed.indexOf(oldCent.id) === -1
							){
								cents.removed.push(oldCent.id);
							}
						});
					}
				});
				
				return {
					sets : sets,
					strings : strings,
					cents : cents
				};
			}
			
			$scope.$watch(models.sets, function(newValue, oldValue){
				var diff = diffScopeChange(newValue, oldValue);
				
				diff.sets.removed.forEach(function(setId){
					audioModel.removeSet(setId);
				});
				diff.sets.added.forEach(function(setId){
					self.sets.findById(setId, function(set){
						audioModel.addSet(setId, {
							volume : (set.muted ? 0 : set.volume / 100)
						});
					});
				});
				diff.sets.changed.forEach(function(setId){
					self.sets.findById(setId, function(set){
						audioModel.setSet(setId, {
							volume : (set.muted ? 0 : set.volume / 100)
						});
					});
				});
				
				diff.strings.removed.forEach(audioModel.removeString);
				
				diff.strings.added.forEach(function(stringId){
					self.strings.findById(stringId, function(string, index, array, set){
						audioModel.addString(stringId, set.id, {
							frequency : self.calculate.frequency(stringId, self.TYPE.STRING),
							volume : (string.muted ? 0 : string.volume / 100),
							type : string.type
						});
					});
				});
				diff.strings.changed.forEach(function(stringId){
					self.strings.findById(stringId, function(string){
						audioModel.setString(stringId, {
							frequency : self.calculate.frequency(stringId, self.TYPE.STRING),
							volume : (string.muted ? 0 : string.volume / 100),
							type : string.type
						});
					});
				});
				
				diff.cents.removed.forEach(audioModel.removeCent);
				
				diff.cents.added.forEach(function(centId){
					self.cents.findById(centId, function(cent, index, array, set){
						audioModel.addCent(centId, set.id, {
							frequency : self.calculate.frequency(centId, self.TYPE.CENT),
							volume : (cent.muted ? 0 : cent.volume / 100),
							type : cent.type
						});
					});
				});
				diff.cents.changed.forEach(function(centId){
					self.cents.findById(centId, function(cent){
						audioModel.setCent(centId, {
							frequency : self.calculate.frequency(centId, self.TYPE.CENT),
							volume : (cent.muted ? 0 : cent.volume / 100),
							type : cent.type
						});
					});
				});
				
				audioModel.commit();
			}, true);
			
			$scope.$watch(models.baseFrequency, function(newValue){
				var dirty = false;
				
				$scope[models.sets].forEach(function(set){
					set.strings.forEach(function(string){
						dirty = true;
						audioModel.setString(string.id, {
							frequency : self.calculate.frequency(string, self.TYPE.STRING)
						});
					});
					
					set.cents.forEach(function(cent){
						dirty = true;
						audioModel.setCent(cent.id, {
							frequency : self.calculate.frequency(cent, self.TYPE.CENT)
						});
					});
				});
				
				if(dirty){
					audioModel.commit();
				}
			});
			
			$scope.$watch(models.baseVolume, function(newValue){
				audioModel
					.setMainVolume(newValue / 100)
					.commit()
				;
			});
			
			$scope.$watch(models.retune, function(newValue, oldValue){
				if(newValue.default === oldValue.default){
					return ;
				}
				
				var dirty = false;
				
				// todo: can we extract this and the above copy into an "update frequencies" method?
				$scope[models.sets].forEach(function(set){
					if(set.retune !== 'inherit'){
						return ;
					}
					
					set.strings.forEach(function(string){
						dirty = true;
						audioModel.setString(string.id, {
							frequency : self.calculate.frequency(string, self.TYPE.STRING)
						});
					});
					
					set.cents.forEach(function(cent){
						dirty = true;
						audioModel.setCent(cent.id, {
							frequency : self.calculate.frequency(cent, self.TYPE.CENT)
						});
					});
				});
				
				if(dirty){
					audioModel.commit();
				}
			}, true)
		};
	}])
;