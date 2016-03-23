angular
	.module('Calculate', ['Math'])
	.factory('Calculate', ['math', function(math){
		'use strict';
		
		return function(model, $scope){
			var self = this;
			
			this.baseFrequency = function(target, type){
				var set = (Number.isInteger(target) ? model.sets.findById(target) : target);
				if(!set){
					return 0;
				}
				var method = set.retune;
				if(method === 'inherit'){
					method = $scope.retune.default;
				}
				if(!model.retune[method]){
					method = 'off';
				}
				
				return model.retune[method](set, type);
			};
			this.frequency = function(target, type){
				var freq;
				var id = (Number.isInteger(target) ? target : target.id);
				var isCentType = type === model.TYPE.CENT;
				model[isCentType ? 'cents' : 'strings'].findById(id, function(element, index, array, set){
					freq =
						self.baseFrequency(set, type)
						* (isCentType ? math.centsToFraction(element.multiplier) : element.multiplier)
					;
				});
				return freq;
			};
			this.frequencies = function(target, type){
				var arr = [];
				var set = (Number.isInteger(target) ? model.sets.findById(target) : target);
				
				if(set){
					var baseFreq = model.baseFrequency(set, type);
					var isCentType = type === model.TYPE.CENT;
					var elements = set[isCentType ? 'cents' : 'strings'];
					var iSize = elements.length;
					for(var i = 0; i < iSize; i++){
						arr.push(baseFreq * (isCentType ? math.centsToFraction(elements[i].multiplier) : elements[i].multiplier));
					}
				}
				
				return arr;
			};
			
			/*
			this.cent = function(stringId){
				var cents;
				
				model.strings.findById(stringId, function(string, index, array, set){
					var baseFreq = model.baseFrequency(id, 'string', set);
					cents = math.fractionToCents(math.ratioToFraction(baseFreq, baseFreq * string.multiplier));
				});
				
				return cents;
			};
			this.cents = function(set){
				var arr = [];
				
				set.strings.forEach(function(string){
					arr.push(model.cent(string.id));
				});
				
				return arr;
			};
			*/
		};
	}])
;