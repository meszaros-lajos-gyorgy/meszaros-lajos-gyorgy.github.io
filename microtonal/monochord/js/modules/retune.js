angular
	.module('Retune', ['Math'])
	.factory('Retune', ['math', function(math){
		'use strict';
		
		// todo: these are only relative tunings, do we need absolute ones?
		
		return function(setModel, $scope, models){
			this.off = function(){
				return $scope[models.baseFrequency];
			};
			this.lowestToBaseFreq = function(target, type){
				var divisor = setModel.harmonics.getLowest(target, type);
				if(divisor === null){
					return 0;
				}
				if(type === setModel.TYPE.CENT){
					divisor = math.centsToFraction(divisor);
				}
				if(divisor === 0){
					return 0;
				}
				return $scope[models.baseFrequency] / divisor;
			};
			this.highestToBaseFreq = function(target, type){
				var divisor = setModel.harmonics.getHighest(target, type);
				if(divisor === null){
					return 0;
				}
				if(type === setModel.TYPE.CENT){
					divisor = math.centsToFraction(divisor);
				}
				if(divisor === 0){
					return 0;
				}
				return $scope[models.baseFrequency] / divisor;
			};
			this.lowestToPrevHighest = function(target, type){
				var to = $scope[models.baseFrequency];
				
				var prevSet = setModel.sets.findPrevious(target);
				if(prevSet){
					var divisor = setModel.harmonics.getHighest(prevSet, type);
					if(divisor !== null){
						setModel.harmonics.findInSet(prevSet, divisor, function(element, elementType){
							to = setModel.calculate.frequency(element, elementType);
						});
					}
				}
				
				var divisor = setModel.harmonics.getLowest(target, type);
				if(divisor === null){
					return 0;
				}
				if(type === setModel.TYPE.CENT){
					divisor = math.centsToFraction(divisor);
				}
				if(divisor === 0){
					return 0;
				}
				
				return to / divisor;
			};
		}
	}])
;