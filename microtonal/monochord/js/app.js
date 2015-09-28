(function(){
	'use strict';
	
	var app = angular.module('Microtonal', ['AudioModel', 'Math']);
	
	app.directive('stringToNumber', function() {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, ngModel) {
				ngModel.$parsers.push(function(value) {
					return '' + value;
				});
				ngModel.$formatters.push(function(value) {
					return parseFloat(value, 10);
				});
			}
		};
	});
	
	app.directive('dragnumber', function(){
		return {
			restrict: 'E',
			scope: {
				ngModel: '=',
				min: '=',
				max: '=',
				weight: '='
			},
			template:
				'<input ng-model="ngModel" type="text" class="dragnumber" data-min="{{min}}" data-max="{{max}}" autocomplete="off" data-weight="{{weight}}" />'
				+ '<input ng-model="ngModel" type="number" class="dragnumber edit hidden" ng-min="min" ng-max="max" autocomplete="off">'
			,
			controller: ['$scope', '$element', function($scope, $element){
				// todo: make it editable, when doubleclicked, or something like that
				var listening = false;
				var startClientY;
				var startValue;
				var stopClientY;
				var editing = false;
				
				var input = $element[0].querySelector('input:not(.edit)');
				var edit = $element[0].querySelector('input.edit');
				
				input.addEventListener('focus', function(){
					input.blur();
				});
				input.addEventListener('click', function(){
					if(stopClientY === startClientY){
						input.classList.add('hidden');
						edit.classList.remove('hidden');
						edit.focus();
						editing = true;
					}
				});
				edit.addEventListener('blur', function(){
					if(editing){
						edit.classList.add('hidden');
						input.classList.remove('hidden');
						editing = false;
					}
				});
				
				var getY = function(e){
					if(e.clientY){
						return e.clientY;
					}else if(e.targetTouches){
						return e.targetTouches[0].clientY;
					}
				};
				
				var startHandler = function(e){
					listening = true;
					startClientY = getY(e);
					startValue = parseInt(this.value, 10) || 0;
					e.stopPropagation();
					// e.preventDefault();
				};
				var stopHandler = function(e){
					stopClientY = getY(e);
					listening = false;
					e.stopPropagation();
					e.preventDefault();
				};
				
				var moveHandler = function(e){
					if(listening){
						var weight = parseInt(this.getAttribute('data-weight'), 10);
						if(weight <= 0){
							weight = 1;
						}
						var value = Math.floor((getY(e) - startClientY) * -1 / weight) + startValue;
						if(this.hasAttribute('data-min')){
							var min = parseInt(this.getAttribute('data-min'), 10);
							if(value < min){
								value = min;
							}
						}
						if(this.hasAttribute('data-max')){
							var max = parseInt(this.getAttribute('data-max'), 10);
							if(value > max){
								value = max;
							}
						}
						$scope.$apply(function() {
							$scope.ngModel = value;
						});
					}
					e.stopPropagation();
					e.preventDefault();
				};
				
				input.addEventListener('mousedown', startHandler);
				input.addEventListener('touchstart', startHandler);
				
				input.addEventListener('mouseup', stopHandler);
				input.addEventListener('touchend', stopHandler);
				
				input.addEventListener('mousemove', moveHandler);
				input.addEventListener('touchmove', moveHandler);
			}]
		};
	});
	
	app.controller('MonochordCtrl', ['$scope', '$http', 'audio', 'math', function($scope, $http, AudioModel, math){
		if(!AudioModel.supported){
			alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
			return ;
		}
		
		var lastStringId = 0;
		var lastSetId = 0;
		var lowestHarmonic = 1;
		var highestHarmonic = 100;
		
		$scope.baseVolume = 100;
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {};
		$scope.defaultVolume = 0;
		$scope._normalizeStringTargets = {};
		$scope.rawImportData = '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]';
		$scope.highestHarmonic = highestHarmonic;
		
		// ---------------
		
		function findSetById(setId, run){
			$scope.sets.some(function(set, index, array){
				if(set.id === setId){
					run(set, index, array);
					return true;
				}
			});
		}
		
		function findStringById(stringId, run){
			$scope.sets.some(function(set){
				return set.strings.some(function(string, index, array){
					if(string.id === stringId){
						run(string, index, array, set);
						return true;
					}
				});
			});
		}
		function getNormalizeStringTargets(excludedSetId){
			var list = [{
				label : 'Base frequency (' + $scope.baseFrequency + ' Hz)',
				value : 0,
				group : 'Miscellaneous'
			}];
			
			$scope.sets.forEach(function(set, index){
				if(set.id !== excludedSetId){
					set.strings.forEach(function(string){
						list.push({
							label : 'String with harmonic level ' + string.multiplier,
							value : string.id,
							group : 'String set #' + (index + 1)
						});
					});
				}
			});
			
			return list;
		}
		
		function calculateFrequency(stringId, stack){
			var frequency;
			var baseFrequency;
			
			findStringById(stringId, function(string, index, array, set){
				if(set.normalize.target > 0){
					stack = stack || [];
					if(stack.indexOf(stringId) !== -1){
						alert('Infinite normalization target loop! There are no sets, that normalize to the default baseFrequency!');
						return 0;
					}else{
						stack.push(stringId);
						baseFrequency = calculateFrequency(set.normalize.target, stack);
					}
				}else{
					baseFrequency = $scope.baseFrequency
				}
				
				if(set.normalize.type === 'off'){
					frequency = baseFrequency * string.multiplier;
				}else{
					var normalizedBaseFreq;
					
					switch(set.normalize.type){
						case 'lowest' : {
							var ratios = [];
							set.strings.forEach(function(string){
								ratios.push(string.multiplier);
							});
							ratios = ratios.sort(function(a, b){
								return a - b;
							});
							normalizedBaseFreq = baseFrequency / ratios[0];
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
							normalizedBaseFreq = baseFrequency / ratios[0];
							break;
						}
						case 'manual' : {
							if(set.normalize.subject > 0){
								findStringById(set.normalize.subject, function(string){
									normalizedBaseFreq = baseFrequency / string.multiplier;
								})
							}else{
								normalizedBaseFreq = baseFrequency;
							}
							break;
						}
					}
					
					frequency = normalizedBaseFreq * string.multiplier;
				}
			});
			
			return frequency;
		}
		
		function updateNormalizeStringTargets(){
			var targets = {};
			$scope.sets.forEach(function(set){
				targets[set.id] = getNormalizeStringTargets(set.id);
			});
			$scope._normalizeStringTargets = targets;
		}
		
		function updateFrequencies(){
			$scope.sets.forEach(function(set){
				set.strings.forEach(function(string){
					AudioModel.setString(string.id, {
						frequency : calculateFrequency(string.id)
					});
				});
			});
		}
		
		function diffSetsChange(newValue, oldValue){
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
		
		// ---------------
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			if(newValue !== oldValue){
				updateFrequencies();
			}
			updateNormalizeStringTargets();
		});
		$scope.$watch('baseVolume', function(newValue, oldValue){
			if(newValue !== oldValue){
				AudioModel.setMainVolume(newValue);
			}
		});
		$scope.$watch('highestHarmonic', function(newValue, oldValue){
			if(newValue !== oldValue){
				highestHarmonic = newValue;
			}
		});
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				var diff = diffSetsChange(newValue, oldValue);
				
				diff.sets.removed.forEach(AudioModel.removeSet);
				diff.sets.added.forEach(function(setId){
					findSetById(setId, function(set){
						AudioModel.addSet(setId, {
							volume : set.volume / 100
						});
					});
				});
				diff.sets.changed.forEach(function(setId){
					findSetById(setId, function(set){
						AudioModel.setSet(setId, {
							volume : set.volume / 100
						});
					});
				});
				
				diff.strings.removed.forEach(AudioModel.removeString);
				
				diff.strings.added.forEach(function(stringId){
					findStringById(stringId, function(string, index, array, set){
						AudioModel.addString(stringId, set.id, {
							frequency : calculateFrequency(stringId),
							volume : string.volume / 100
						});
					});
				});
				diff.strings.changed.forEach(function(stringId){
					findStringById(stringId, function(string){
						AudioModel.setString(stringId, {
							frequency : calculateFrequency(stringId),
							volume : string.volume / 100
						});
					});
				});
				
				$scope.rawImportData = _export();
				updateNormalizeStringTargets();
				diff.sets.added.forEach(function(setId){
					findSetById(setId, function(set){
						set.canBeSimplified = canBeSimplified(set);
						set.canLowerHarmonics = canLowerHarmonics(set);
						set.canRaiseHarmonics = canRaiseHarmonics(set);
					});
				});
				diff.sets.changed.forEach(function(setId){
					findSetById(setId, function(set){
						set.canBeSimplified = canBeSimplified(set);
						set.canLowerHarmonics = canLowerHarmonics(set);
						set.canRaiseHarmonics = canRaiseHarmonics(set);
					});
				});
			}
		}, true);
		
		// ---------------
		
		function addSet(){
			$scope.sets.push({
				id : ++lastSetId,
				normalize : {
					type : 'off',
					subject : 0,
					target : 0
				},
				volume : 100,
				strings : []
			});
			return lastSetId;
		}
		function removeSet(setId){
			findSetById(setId, function(set, index, array){
				array.splice(index, 1);
			});
		}
		function addString(setId, multiplier, volume){
			findSetById(setId, function(set){
				set.strings.push({
					id : ++lastStringId,
					multiplier : multiplier || 1,
					volume : typeof volume !== 'undefined' ? volume : $scope.defaultVolume
				});
			});
			return lastStringId;
		}
		function removeString(stringId){
			findStringById(stringId, function(string, index, array){
				array.splice(index, 1);
			});
		}
		function canLowerHarmonics(set){
			var ratios = [];
			set.strings.forEach(function(string){
				ratios.push(string.multiplier);
			});
			return (ratios.sort(function(a, b){
				return a - b;
			})[0] > lowestHarmonic);
		}
		function lowerHarmonics(setId){
			findSetById(setId, function(set){
				var ratios = [];
				set.strings.forEach(function(string){
					ratios.push(string.multiplier);
				});
				if(ratios.sort(function(a, b){
					return a - b;
				})[0] > lowestHarmonic){
					set.strings.forEach(function(string){
						string.multiplier--;
					});
				}
			});
		}
		function canRaiseHarmonics(set){
			var ratios = [];
			set.strings.forEach(function(string){
				ratios.push(string.multiplier);
			});
			return (ratios.sort(function(a, b){
				return b - a;
			})[0] < highestHarmonic);
		}
		function raiseHarmonics(setId){
			findSetById(setId, function(set){
				var ratios = [];
				set.strings.forEach(function(string){
					ratios.push(string.multiplier);
				});
				if(ratios.sort(function(a, b){
					return b - a;
				})[0] < highestHarmonic){
					set.strings.forEach(function(string){
						string.multiplier++;
					});
				}
			});
		}
		function addPreset(ratio, volume){
			var setId = addSet();
			ratio.sort(function(a, b){
				return a - b;
			}).forEach(function(multiplier){
				addString(setId, multiplier, volume);
			});
		}
		function updatePresets(data){
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[0];
		}
		function _import(rawImportData){
			var raw = null;
			
			try{
				raw = JSON.parse(rawImportData);
			}catch(e){
				throw new Error('Invalid data');
			}
			
			// todo: validate
			
			if(raw !== null){
				$scope.sets = raw;
				
				lastSetId = raw.reduce(function(previousValue, currentValue){
					previousValue.push(currentValue.id);
					return previousValue;
				}, []).sort(function(a, b){
					return b - a;
				})[0] || 0;
				
				lastStringId = raw.reduce(function(previousValue, currentValue){
					currentValue.strings.forEach(function(string){
						previousValue.push(string.id);
					});
					return previousValue;
				}, []).sort(function(a, b){
					return b - a;
				})[0] || 0;
			}
		}
		function _export(){
			var raw = angular.toJson($scope.sets);
			
			// todo: normalize ID-s
			
			return raw;
		}
		
		function canBeSimplified(set){
			if(set.strings.length > 1){
				var multipliers = [];
				set.strings.forEach(function(string){
					multipliers.push(string.multiplier);
				});
				if(math.greatestCommonDivisor.apply(null, multipliers) > 1){
					return true;
				}
			}
			return false;
		}
		
		function simplify(setId){
			findSetById(setId, function(set){
				if(set.strings.length > 1){
					var multipliers = [];
					set.strings.forEach(function(string){
						multipliers.push(string.multiplier);
					});
					var gcd = math.greatestCommonDivisor.apply(null, multipliers);
					if(gcd > 1){
						set.strings.forEach(function(string){
							string.multiplier = string.multiplier / gcd;
						});
					}
				}
			});
		}
		
		$scope.addSet = addSet;
		$scope.removeSet = removeSet;
		$scope.addString = addString;
		$scope.removeString = removeString;
		$scope.lowerHarmonics = lowerHarmonics;
		$scope.raiseHarmonics = raiseHarmonics;
		$scope.addPreset = addPreset;
		$scope.updatePresets = updatePresets;
		$scope._import = _import;
		$scope._export = _export;
		$scope.simplify = simplify;
		
		$http.get('presets.json').success(function(data){
			updatePresets(data);
		});
	}]);
})();