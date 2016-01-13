if(!window.modules){
	window.modules = {};
}

(function(modules){
	'use strict';
	
	modules.SetModel = function(model){
		var lastSetId = 0;
		var lastStringId = 0;
		
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
			findString : function(set, harmonic, run){
				set.strings.some(function(string, index, array){
					if(string.multiplier === harmonic){
						run(string, index, array, set);
						return true;
					}
				});
			},
			
			
			
			getLowest : function(set){
				return getMultipliers(set).sort(function(a, b){
					return a - b;
				})[0];
			},
			canLower : function(set){
				return getLowestHarmonic(set) > lowestHarmonic;
			},
			canHalve : function(set){
				return !set.strings.some(function(string){
					return (string.multiplier % 2 !== 0 || string.multiplier / 2 < lowestHarmonic);
				});
			},
			lower : function(setId){
				findSetById(setId, function(set){
					if(canLowerHarmonics(set)){
						set.strings.forEach(function(string){
							string.multiplier--;
						});
					}
				});
			},
			halve : function(setId){
				findSetById(setId, function(set){
					if(canHalveHarmonics(set)){
						set.strings.forEach(function(string){
							string.multiplier /= 2;
						});
					}
				});
			},
			getHighest : function(set){
				return getMultipliers(set).sort(function(a, b){
					return b - a;
				})[0];
			},
			canRaise : function(set){
				return getHighestHarmonic(set) < highestHarmonic;
			},
			canDouble : function(set){
				return (getHighestHarmonic(set) * 2 < highestHarmonic);
			},
			raise : function(setId){
				findSetById(setId, function(set){
					if(canRaiseHarmonics(set)){
						set.strings.forEach(function(string){
							string.multiplier++;
						});
					}
				});
			},
			double : function(setId){
				findSetById(setId, function(set){
					if(canDoubleHarmonics(set)){
						set.strings.forEach(function(string){
							string.multiplier *= 2;
						});
					}
				});
			},
			
			
			
			
			getMultipliers : function(set){
				var multipliers = [];
				set.strings.forEach(function(string){
					multipliers.push(string.multiplier);
				});
				return multipliers;
			},
			
			canBeNormalized : function(set){
				if(set.strings.length > 1){
					if(math.greatestCommonDivisor.apply(null, getMultipliers(set)) > 1){
						return true;
					}
				}
				return false;
			},
			
			normalize : function(setId){
				findSetById(setId, function(set){
					if(set.strings.length > 1){
						var gcd = math.greatestCommonDivisor.apply(null, getMultipliers(set));
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
			cent : function(stringId){
				var cents;
				
				findStringById(stringId, function(string, index, array, set){
					var baseFrequency = getBaseFrequency(stringId, set);
					cents = math.calculateCents(baseFrequency, baseFrequency * string.multiplier);
				});
				
				return cents;
			},
			frequencies : function(set){
				var arr = [];
				
				set.strings.forEach(function(string){
					arr.push(calculateFrequency(string.id));
				});
				
				return arr;
			},
			cents : function(set){
				var arr = [];
				
				set.strings.forEach(function(string){
					arr.push(calculateCent(string.id));
				});
				
				return arr;
			}
		};
	};
})(window.modules);