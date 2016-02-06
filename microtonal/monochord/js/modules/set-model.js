angular
	.module('SetModel', ['Utils', 'Math', 'AudioModel'])
	.factory('SetModel', ['utils', 'math', 'audioModel', function(utils, math, audioModel){
		'use strict';
		
		return function($scope, models){
			var sets = $scope[models.sets];
			var self = this;
			
			var lastSetId = 0;
			var lastStringId = 0;
			var lowestHarmonic = 1;
			var highestHarmonic = 5000;
			
			this.commit = function(){
				$scope.$apply();
			};
			
			this.sets = {
				add : function addSet(volume, muted, dontAddString){
					sets.push({
						id : ++lastSetId,
						retune : {
							// type : 'off',
							// subject : 0,
							// target : 0
						},
						strings : [],
						volume : typeof volume !== 'undefined' ? volume : 100,
						muted : typeof muted !== 'undefined' ? muted : false
					});
					if(dontAddString !== true){
						self.strings.add(lastSetId, 1);
					}
					return lastSetId;
				},
				remove : function(setId){
					self.sets.findById(setId, function(set, index, array){
						array.splice(index, 1);
					});
					// $scope.stringToEdit = {};
				},
				findById : function(setId, run){
					sets.some(function(set, index, array){
						if(set.id === setId){
							run(set, index, array);
							return true;
						}
					});
				},
				findPrevious : function(setId, run){
					var prevSet = null;
					sets.some(function(set){
						if(set.id === setId && prevSet !== null){
							run(prevSet);
							return true;
						}else{
							prevSet = set;
						}
					});
				},
				findNext : function(setId, run){
					var prevSet = null;
					sets.some(function(set){
						if(prevSet !== null && prevSet.id === setId){
							run(set);
							return true;
						}else{
							prevSet = set;
						}
					});
				}
			};
			
			this.strings = {
				VALID_TYPES : ['sine', 'square', 'sawtooth', 'triangle'],
				add : function(setId, multiplier, volume, muted, type){
					self.sets.findById(setId, function(set){
						set.strings.push({
							id : ++lastStringId,
							multiplier : multiplier || 1,
							volume : typeof volume !== 'undefined' ? volume : 100,
							muted : typeof muted !== 'undefined' ? muted : false,
							type : self.strings.VALID_TYPES.indexOf(type) !== -1 ? type : self.strings.VALID_TYPES[0]
						});
					});
					return lastStringId;
				},
				remove : function(stringId){
					self.strings.findById(stringId, function(string, index, array, set){
						if(set.strings.length === 1){
							removeSet(set.id);
						}else{
							array.splice(index, 1);
							// if($scope.stringToEdit.id === stringId){
								// $scope.stringToEdit = {};
							// }
						}
					});
				},
				findById : function(stringId, run){
					sets.some(function(set){
						return set.strings.some(function(string, index, array){
							if(string.id === stringId){
								run(string, index, array, set);
								return true;
							}
						});
					});
				}
			};
			
			this.harmonics = {
				getMultipliers : function(set){
					var multipliers = [];
					set.strings.forEach(function(string){
						multipliers.push(string.multiplier);
					});
					return multipliers;
				},
				findInSet : function(set, harmonic, run){
					set.strings.some(function(string, index, array){
						if(string.multiplier === harmonic){
							run(string, index, array, set);
							return true;
						}
					});
				},
				
				getLowest : function(set){
					return self.harmonics.getMultipliers(set).sort(function(a, b){
						return a - b;
					})[0];
				},
				canLower : function(set){
					return self.harmonics.getLowest(set) > lowestHarmonic;
				},
				canHalve : function(set){
					return !set.strings.some(function(string){
						return (string.multiplier % 2 !== 0 || string.multiplier / 2 < lowestHarmonic);
					});
				},
				lower : function(setId){
					self.sets.findById(setId, function(set){
						if(canLowerHarmonics(set)){
							set.strings.forEach(function(string){
								string.multiplier--;
							});
						}
					});
				},
				halve : function(setId){
					self.sets.findById(setId, function(set){
						if(canHalveHarmonics(set)){
							set.strings.forEach(function(string){
								string.multiplier /= 2;
							});
						}
					});
				},
				
				getHighest : function(set){
					return self.harmonics.getMultipliers(set).sort(function(a, b){
						return b - a;
					})[0];
				},
				canRaise : function(set){
					return self.harmonics.getHighest(set) < highestHarmonic;
				},
				canDouble : function(set){
					return (self.harmonics.getHighest(set) * 2 < highestHarmonic);
				},
				raise : function(setId){
					self.sets.findById(setId, function(set){
						if(self.harmonics.canRaise(set)){
							set.strings.forEach(function(string){
								string.multiplier++;
							});
						}
					});
				},
				double : function(setId){
					self.sets.findById(setId, function(set){
						if(self.harmonics.canRaise(set)){
							set.strings.forEach(function(string){
								string.multiplier *= 2;
							});
						}
					});
				},
				
				canBeNormalized : function(set){
					return (
						set.strings.length > 1
						&& modules.Math.greatestCommonDivisor.apply(null, self.harmonics.getMultipliers(set)) > 1
					);
				},
				normalize : function(setId){
					self.sets.findById(setId, function(set){
						if(set.strings.length > 1){
							var gcd = modules.Math.greatestCommonDivisor.apply(null, self.harmonics.getMultipliers(set));
							if(gcd > 1){
								set.strings.forEach(function(string){
									string.multiplier = string.multiplier / gcd;
								});
							}
						}
					});
				}
			};
			
			this.calculate = {
				baseFrequency : function(stringId, set, stack){
					var baseFreq;
					
					// if(set.retune.target > 0){
						// stack = stack || [];
						// if(stack.indexOf(stringId) !== -1){
							// alert('Infinite normalization target loop! There are no sets, that retune to the default baseFrequency!');
							// return 0;
						// }else{
							// stack.push(stringId);
							// baseFreq = calculateFrequency(set.retune.target, stack);
						// }
					// }else{
						baseFreq = $scope[models.baseFrequency];
					// }
					
					// if(set.retune.type !== 'off'){
						// var retunedBaseFreq;
						
						// switch(set.retune.type){
							// case 'lowest' : {
								// var ratios = [];
								// set.strings.forEach(function(string){
									// ratios.push(string.multiplier);
								// });
								// ratios = ratios.sort(function(a, b){
									// return a - b;
								// });
								// retunedBaseFreq = baseFreq / ratios[0];
								// break;
							// }
							// case 'highest' : {
								// var ratios = [];
								// set.strings.forEach(function(string){
									// ratios.push(string.multiplier);
								// });
								// ratios = ratios.sort(function(a, b){
									// return b - a;
								// });
								// retunedBaseFreq = baseFreq / ratios[0];
								// break;
							// }
							// case 'manual' : {
								// if(set.retune.subject > 0){
									// findStringById(set.retune.subject, function(string){
										// retunedBaseFreq = baseFreq / string.multiplier;
									// })
								// }else{
									// retunedBaseFreq = baseFreq;
								// }
								// break;
							// }
						// }
						
						// baseFreq = retunedBaseFreq;
					// }
					
					return baseFreq;
				},
				frequency : function(stringId, stack){
					var frequency;
					
					self.strings.findById(stringId, function(string, index, array, set){
						frequency = self.calculate.baseFrequency(stringId, set, stack) * string.multiplier;
					});
					
					return frequency;
				},
				frequencies : function(set){
					var arr = [];
					
					set.strings.forEach(function(string){
						arr.push(self.calculate.frequency(string.id));
					});
					
					return arr;
				},
				cent : function(stringId){
					var cents;
					
					self.strings.findById(stringId, function(string, index, array, set){
						var baseFreq = self.calculate.baseFrequency(stringId, set);
						cents = modules.Math.calculateCents(baseFreq, baseFreq * string.multiplier);
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
					}else{
						oldSet.strings.forEach(function(oldString){
							if(
								strings.added.indexOf(oldString.id) === -1
								&& strings.changed.indexOf(oldString.id) === -1
							){
								strings.removed.push(oldString.id);
							}
						});
					}
				});
				
				return {
					sets : sets,
					strings : strings
				};
			}
			
			$scope.$watch(models.sets, function(newValue, oldValue){
				var diff = diffScopeChange(newValue, oldValue);
				
				diff.sets.removed.forEach(function(setId){
					// Object.keys($scope.keyAssignments).some(function(key){
						// if($scope.keyAssignments[key].setId === setId){
							// $scope.keyAssignments[key].setId = 0;
						// }
					// });
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
							frequency : self.calculate.frequency(stringId),
							volume : (string.muted ? 0 : string.volume / 100),
							type : string.type
						});
					});
				});
				diff.strings.changed.forEach(function(stringId){
					self.strings.findById(stringId, function(string){
						audioModel.setString(stringId, {
							frequency : self.calculate.frequency(stringId),
							volume : (string.muted ? 0 : string.volume / 100),
							type : string.type
						});
					});
				});
				
				audioModel.commit();
			}, true);
			
			$scope.$watch(models.baseFrequency, function(newValue, oldValue){
				sets.forEach(function(set){
					set.strings.forEach(function(string){
						audioModel.setString(string.id, {
							frequency : self.calculate.frequency(string.id)
						});
					});
				});
				audioModel.commit();
			});
			
			$scope.$watch(models.baseVolume, function(newValue, oldValue){
				audioModel
					.setMainVolume(newValue / 100)
					.commit()
				;
			});
		};
	}])
;