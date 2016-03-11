angular
	.module('Harmonics', ['Math'])
	.factory('Harmonics', ['math', function(math){
		'use strict';
		
		return function(setModel){
			var self = this;
			this.findInSet = function(target, harmonic, run){
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(set){
					set.strings.some(function(string, index, array){
						if(string.multiplier === harmonic){
							run(string, setModel.TYPE.STRING, index, array, set);
							return true;
						}
					})
					|| set.cents.some(function(cent, index, array){
						if(cent.multiplier === harmonic){
							run(cent, setModel.TYPE.CENT, index, array, set);
							return true;
						}
					});
				}
			};
			
			this.getMultipliers = function(target, type){
				var multipliers = [];
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				var property = (type === setModel.TYPE.STRING ? 'strings' : 'cents');
				if(set && set[property]){
					var i = set[property].length;
					while(i--){
						multipliers.push(set[property][i].multiplier);
					}
				}
				return multipliers;
			};
			
			this.getLowest = function(target, type){
				var multipliers = self.getMultipliers(target, type);
				return (multipliers.length ? Math.min.apply(null, multipliers) : null);
			};
			this.canLower = function(target, by){
				if(!Number.isInteger(by) || by <= 0){
					by = 1;
				}
				
				var lString = self.getLowest(target, setModel.TYPE.STRING);
				var lCent = self.getLowest(target, setModel.TYPE.CENT);
				
				var canLowerString = lString !== null && lString - by >= lowestHarmonic;
				var canLowerCent = lCent !== null && lCent - by >= lowestCent;
				
				return (
					(lString === null && canLowerCent)
					|| (canLowerString && lCent === null)
					|| (canLowerString && canLowerCent)
				);
			};
			this.canHalve = function(target, type){
				var lString = self.getLowest(target, setModel.TYPE.STRING);
				var lCent = self.getLowest(target, setModel.TYPE.CENT);
				
				var canLowerString = lString !== null && lString / 2 >= lowestHarmonic;
				var canLowerCent = lCent !== null && lCent / 2 >= lowestCent;
				
				return (
					(lString === null && canLowerCent)
					|| (canLowerString && lCent === null)
					|| (canLowerString && canLowerCent)
				);
			};
			this.lower = function(target, by){
				if(!Number.isInteger(by) || by <= 0){
					by = 1;
				}
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(set && self.canLower(set, by)){
					set.strings.forEach(function(string){
						string.multiplier -= by;
					});
					set.cents.forEach(function(cent){
						cent.multiplier -= by;
					});
				}
			};
			this.halve = function(target){
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(set && self.canHalve(set)){
					set.strings.forEach(function(string){
						string.multiplier /= 2;
					});
					set.cents.forEach(function(cent){
						cent.multiplier /= 2;
					});
				}
			};
			
			this.getHighest = function(target, type){
				var multipliers = self.getMultipliers(target, type);
				return (multipliers.length ? Math.max.apply(null, multipliers) : null);
			};
			this.canRaise = function(target, by){
				if(!Number.isInteger(by) || by <= 0){
					by = 1;
				}
				
				var hString = self.getHighest(target, setModel.TYPE.STRING);
				var hCent = self.getHighest(target, setModel.TYPE.CENT);
				
				var canRaiseString = hString !== null && hString + by <= highestHarmonic;
				var canRaiseCent = hCent !== null && hCent + by <= highestCent;
				
				return (
					(hString === null && canRaiseCent)
					|| (canRaiseString && hCent === null)
					|| (canRaiseString && canRaiseCent)
				);
			};
			this.canDouble = function(target){
				var hString = self.getHighest(target, setModel.TYPE.STRING);
				var hCent = self.getHighest(target, setModel.TYPE.CENT);
				
				var canRaiseString = hString !== null && hString * 2 <= highestHarmonic;
				var canRaiseCent = hCent !== null && hCent * 2 <= highestCent;
				
				return (
					(hString === null && canRaiseCent)
					|| (canRaiseString && hCent === null)
					|| (canRaiseString && canRaiseCent)
				);
			};
			this.raise = function(target, by){
				if(!Number.isInteger(by) || by <= 0){
					by = 1;
				}
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(set && self.canRaise(set, by)){
					set.strings.forEach(function(string){
						string.multiplier += by;
					});
					set.cents.forEach(function(cent){
						cent.multiplier += by;
					});
				}
			};
			this.double = function(target){
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(set && self.canDouble(set)){
					set.strings.forEach(function(string){
						string.multiplier *= 2;
					});
					set.cents.forEach(function(cent){
						cent.multiplier *= 2;
					});
				}
			};
			
			this.canBeNormalized = function(target, type){
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(!set || set[type === setModel.TYPE.CENT ? 'cents' : 'strings'].length <= 1){
					return false;
				}
				
				return math.greatestCommonDivisor.apply(null, self.getMultipliers(set, type)) > 1;
			};
			this.normalize = function(target, type){
				var set = (Number.isInteger(target) ? setModel.sets.findById(target) : target);
				if(set){
					var elements = set[type === setModel.TYPE.CENT ? 'cents' : 'strings'];
					var i = elements.length;
					if(i > 1){
						var gcd = math.greatestCommonDivisor.apply(null, self.getMultipliers(set, type));
						if(gcd > 1){
							while(i--){
								elements[i].multiplier /= gcd;
							}
						}
					}
				}
			};
		};
	}])
;