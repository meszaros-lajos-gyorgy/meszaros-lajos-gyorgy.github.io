angular
	.module('Retune', ['Math'])
	.factory('Retune', ['math', function(math){
		'use strict';
		
		// todo: these are only relative tunings, do we need absolute ones?
		
		return function(model, $scope){
			this.off = function(){
				return $scope.baseFrequency;
			};
			this.lowestToBaseFreq = function(target, type){
				var divisor = model.harmonics.getLowest(target, type);
				if(divisor === null){
					return 0;
				}
				if(type === model.TYPE.CENT){
					divisor = math.centsToFraction(divisor);
				}
				if(divisor === 0){
					return 0;
				}
				return $scope.baseFrequency / divisor;
			};
			this.highestToBaseFreq = function(target, type){
				var divisor = model.harmonics.getHighest(target, type);
				if(divisor === null){
					return 0;
				}
				if(type === model.TYPE.CENT){
					divisor = math.centsToFraction(divisor);
				}
				if(divisor === 0){
					return 0;
				}
				return $scope.baseFrequency / divisor;
			};
			this.lowestToPrevHighest = function(target, type){
				var to = $scope.baseFrequency;
				
				var prevSet = model.sets.findPrevious(target);
				if(prevSet){
					var divisor = model.harmonics.getHighest(prevSet, type);
					if(divisor !== null){
						model.harmonics.findInSet(prevSet, divisor, function(element, elementType){
							to = model.calculate.frequency(element, elementType);
						});
					}
				}
				
				var divisor = model.harmonics.getLowest(target, type);
				if(divisor === null){
					return 0;
				}
				if(type === model.TYPE.CENT){
					divisor = math.centsToFraction(divisor);
				}
				if(divisor === 0){
					return 0;
				}
				
				return to / divisor;
			};
		};
	}])
;