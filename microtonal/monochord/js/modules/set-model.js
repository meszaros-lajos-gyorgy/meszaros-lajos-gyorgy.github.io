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
	.module('SetModel', ['Math', 'AudioModel'])
	.factory('SetModel', ['math', 'audioModel', function(math, audioModel){
		'use strict';
		
		return function($scope, models){
			var self = this;
			
			var lastSetId = 0;
			var lastStringId = 0;
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
						id : ++lastSetId,
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
			
			var _stringcent = {
				// params : multiplier, volume, muted
				add : function(type, target, params){
					params = params || {};
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					var data = {};
					var property = (type === self.TYPE.STRING ? 'strings' : 'cents');
					if(set && set.hasOwnProperty(property)){
						data = {
							id : ++lastStringId,
							multiplier : params.hasOwnProperty('multiplier') ? params.multiplier : 1,
							volume : params.hasOwnProperty('volume') ? params.volume : 100,
							muted : params.hasOwnProperty('muted') ? params.muted : false,
							type : 'sine'
						};
						set[property].push(data);
					}
					return data;
				},
				// target: string object | stringId
				remove : function(type, target){
					var index = -1;
					var set;
					var property = (type === self.TYPE.STRING ? 'strings' : 'cents');
					
					if(Number.isInteger(target)){
						self[property].findById(target, function(string, _index, array, _set){
							set = _set;
							index = _index;
						});
					}else{
						$scope[models.sets].some(function(_set){
							index = _set[property].indexOf(target);
							if(index !== -1){
								set = _set;
								return true;
							}
						});
					}
					
					if(index !== -1){
						if(set.strings.length === 1){
							self.sets.remove(set.id);
						}else{
							$scope[models.sets].splice(index, 1);
						}
					}
				},
				findById : function(type, id, run){
					var property = (type === self.TYPE.STRING ? 'strings' : 'cents');
					var element;
					var found = $scope[models.sets].some(function(set){
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
				}
			};
			
			this.strings = {
				add : _stringcent.add.bind(this, self.TYPE.STRING),
				remove : _stringcent.remove.bind(this, self.TYPE.STRING),
				findById : _stringcent.findById.bind(this, self.TYPE.STRING)
			};
			
			this.cents = {
				add : _stringcent.add.bind(this, self.TYPE.CENT),
				remove : _stringcent.remove.bind(this, self.TYPE.CENT),
				findById : _stringcent.findById.bind(this, self.TYPE.CENT)
			};
			
			this.harmonics = {
				findInSet : function(target, harmonic, run){
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(set){
						set.strings.some(function(string, index, array){
							if(string.multiplier === harmonic){
								run(string, self.TYPE.STRING, index, array, set);
								return true;
							}
						})
						|| set.cents.some(function(cent, index, array){
							if(cent.multiplier === harmonic){
								run(cent, self.TYPE.CENT, index, array, set);
								return true;
							}
						});
					}
				},
				
				getMultipliers : function(target, type){
					var multipliers = [];
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					var property = (type === self.TYPE.STRING ? 'strings' : 'cents');
					if(set && set[property]){
						var i = set[property].length;
						while(i--){
							multipliers.push(set[property][i].multiplier);
						}
					}
					return multipliers;
				},
				
				getLowest : function(target, type){
					var multipliers = self.harmonics.getMultipliers(target, type);
					return (multipliers.length ? Math.min.apply(null, multipliers) : null);
				},
				canLower : function(target, by){
					if(!Number.isInteger(by) || by <= 0){
						by = 1;
					}
					
					var lString = self.harmonics.getLowest(target, self.TYPE.STRING);
					var lCent = self.harmonics.getLowest(target, self.TYPE.CENT);
					
					var canLowerString = lString !== null && lString - by >= lowestHarmonic;
					var canLowerCent = lCent !== null && lCent - by >= lowestCent;
					
					return (
						(lString === null && canLowerCent)
						|| (canLowerString && lCent === null)
						|| (canLowerString && canLowerCent)
					);
				},
				canHalve : function(target, type){
					var lString = self.harmonics.getLowest(target, self.TYPE.STRING);
					var lCent = self.harmonics.getLowest(target, self.TYPE.CENT);
					
					var canLowerString = lString !== null && lString / 2 >= lowestHarmonic;
					var canLowerCent = lCent !== null && lCent / 2 >= lowestCent;
					
					return (
						(lString === null && canLowerCent)
						|| (canLowerString && lCent === null)
						|| (canLowerString && canLowerCent)
					);
				},
				lower : function(target, by){
					if(!Number.isInteger(by) || by <= 0){
						by = 1;
					}
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(set && self.harmonics.canLower(set, by)){
						set.strings.forEach(function(string){
							string.multiplier -= by;
						});
						set.cents.forEach(function(cent){
							cent.multiplier -= by;
						});
					}
				},
				halve : function(target){
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(set && self.harmonics.canHalve(set)){
						set.strings.forEach(function(string){
							string.multiplier /= 2;
						});
						set.cents.forEach(function(cent){
							cent.multiplier /= 2;
						});
					}
				},
				
				getHighest : function(target, type){
					var multipliers = self.harmonics.getMultipliers(target, type);
					return (multipliers.length ? Math.max.apply(null, multipliers) : null);
				},
				canRaise : function(target, by){
					if(!Number.isInteger(by) || by <= 0){
						by = 1;
					}
					
					var hString = self.harmonics.getHighest(target, self.TYPE.STRING);
					var hCent = self.harmonics.getHighest(target, self.TYPE.CENT);
					
					var canRaiseString = hString !== null && hString + by <= highestHarmonic;
					var canRaiseCent = hCent !== null && hCent + by <= highestCent;
					
					return (
						(hString === null && canRaiseCent)
						|| (canRaiseString && hCent === null)
						|| (canRaiseString && canRaiseCent)
					);
				},
				canDouble : function(target){
					var hString = self.harmonics.getHighest(target, self.TYPE.STRING);
					var hCent = self.harmonics.getHighest(target, self.TYPE.CENT);
					
					var canRaiseString = hString !== null && hString * 2 <= highestHarmonic;
					var canRaiseCent = hCent !== null && hCent * 2 <= highestCent;
					
					return (
						(hString === null && canRaiseCent)
						|| (canRaiseString && hCent === null)
						|| (canRaiseString && canRaiseCent)
					);
				},
				raise : function(target, by){
					if(!Number.isInteger(by) || by <= 0){
						by = 1;
					}
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(set && self.harmonics.canRaise(set, by)){
						set.strings.forEach(function(string){
							string.multiplier += by;
						});
						set.cents.forEach(function(cent){
							cent.multiplier += by;
						});
					}
				},
				double : function(target){
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(set && self.harmonics.canDouble(set)){
						set.strings.forEach(function(string){
							string.multiplier *= 2;
						});
						set.cents.forEach(function(cent){
							cent.multiplier *= 2;
						});
					}
				},
				
				canBeNormalized : function(target, type){
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(!set || set[type === self.TYPE.CENT ? 'cents' : 'strings'].length <= 1){
						return false;
					}
					
					return math.greatestCommonDivisor.apply(null, self.harmonics.getMultipliers(set, type)) > 1;
				},
				normalize : function(target, type){
					var set = (Number.isInteger(target) ? self.sets.findById(target) : target);
					if(set){
						var elements = set[type === self.TYPE.CENT ? 'cents' : 'strings'];
						var i = elements.length;
						if(i > 1){
							var gcd = math.greatestCommonDivisor.apply(null, self.harmonics.getMultipliers(set, type));
							if(gcd > 1){
								while(i--){
									elements[i].multiplier /= gcd;
								}
							}
						}
					}
				}
			};
			
			
			// todo: these are only relative tunings, do we need absolute ones?
			var retune = {
				off : function(){
					return $scope[models.baseFrequency];
				},
				lowestToBaseFreq : function(target, type){
					var divisor = self.harmonics.getLowest(target, type);
					if(divisor === null){
						return 0;
					}
					if(type === self.TYPE.CENT){
						divisor = math.centsToFraction(divisor);
					}
					if(divisor === 0){
						return 0;
					}
					return $scope[models.baseFrequency] / divisor;
				},
				highestToBaseFreq : function(target, type){
					var divisor = self.harmonics.getHighest(target, type);
					if(divisor === null){
						return 0;
					}
					if(type === self.TYPE.CENT){
						divisor = math.centsToFraction(divisor);
					}
					if(divisor === 0){
						return 0;
					}
					return $scope[models.baseFrequency] / divisor;
				},
				lowestToPrevHighest : function(target, type){
					var to = $scope[models.baseFrequency];
					
					var prevSet = self.sets.findPrevious(target);
					if(prevSet){
						var divisor = self.harmonics.getHighest(prevSet, type);
						if(divisor !== null){
							self.harmonics.findInSet(prevSet, divisor, function(element, elementType){
								to = self.calculate.frequency(element, elementType);
							});
						}
					}
					
					var divisor = self.harmonics.getLowest(target, type);
					if(divisor === null){
						return 0;
					}
					if(type === self.TYPE.CENT){
						divisor = math.centsToFraction(divisor);
					}
					if(divisor === 0){
						return 0;
					}
					
					return to / divisor;
				}
			};
			
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