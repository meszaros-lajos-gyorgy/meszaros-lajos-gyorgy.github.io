if(!window.modules){
	window.modules = {};
}

(function(modules){
	'use strict';
	
	modules.SetModel = function(model){
		var lastSetId = 0;
		var lastStringId = 0;
		var lowestHarmonic = 1;
		var highestHarmonic = 5000;
		
		var $scope = model[0];
		var variable = model[1];
		var self = this;
		
		var dirty = false;
		var sets = $scope[variable];
		
		this.commit = function(){
			if(dirty){
				$scope[variable] = sets;
			}
		};
		
		this.sets = {
			add : function addSet(volume, muted, dontAddString){
				dirty = true;
				sets.push({
					id : ++lastSetId,
					retune : {
						/*
						type : 'off',
						subject : 0,
						target : 0
						*/
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
				dirty = true;
				sets.some(function(set, index, array){
					if(set.id === setId){
						run(set, index, array);
						return true;
					}
				});
			},
			findPrevious : function(setId, run){
				var prevSet = null;
				dirty = true;
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
				dirty = true;
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
			add : function(setId, multiplier, volume, muted){
				self.sets.findById(setId, function(set){
					set.strings.push({
						id : ++lastStringId,
						multiplier : multiplier || 1,
						volume : typeof volume !== 'undefined' ? volume : 100,
						muted : typeof muted !== 'undefined' ? muted : false
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
						/*
						if($scope.stringToEdit.id === stringId){
							$scope.stringToEdit = {};
						}
						*/
					}
				});
			},
			findById : function(stringId, run){
				dirty = true;
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
				var baseFrequency;
				
				/*
				if(set.retune.target > 0){
					stack = stack || [];
					if(stack.indexOf(stringId) !== -1){
						alert('Infinite normalization target loop! There are no sets, that retune to the default baseFrequency!');
						return 0;
					}else{
						stack.push(stringId);
						baseFrequency = calculateFrequency(set.retune.target, stack);
					}
				}else{
				*/
					baseFrequency = $scope.baseFrequency
				/*
				}
				
				if(set.retune.type !== 'off'){
					var retunedBaseFreq;
					
					switch(set.retune.type){
						case 'lowest' : {
							var ratios = [];
							set.strings.forEach(function(string){
								ratios.push(string.multiplier);
							});
							ratios = ratios.sort(function(a, b){
								return a - b;
							});
							retunedBaseFreq = baseFrequency / ratios[0];
							break;
						}
						case 'highest' : {
							var ratios = [];
							set.strings.forEach(function(string){
								ratios.push(string.multiplier);
							});
							ratios = ratios.sort(function(a, b){
								return b - a;
							});
							retunedBaseFreq = baseFrequency / ratios[0];
							break;
						}
						case 'manual' : {
							if(set.retune.subject > 0){
								findStringById(set.retune.subject, function(string){
									retunedBaseFreq = baseFrequency / string.multiplier;
								})
							}else{
								retunedBaseFreq = baseFrequency;
							}
							break;
						}
					}
					
					baseFrequency = retunedBaseFreq;
				}
				*/
				
				return baseFrequency;
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
					var baseFrequency = self.calculate.baseFrequency(stringId, set);
					cents = modules.Math.calculateCents(baseFrequency, baseFrequency * string.multiplier);
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
	};
})(window.modules);