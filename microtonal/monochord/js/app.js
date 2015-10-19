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
			template: '<input ng-model="ngModel" type="number" class="dragnumber" min="{{min}}" max="{{max}}" autocomplete="off" data-weight="{{weight}}" />',
			controller: ['$scope', '$element', function($scope, $element){
				var listening = false;
				var startClientY;
				var startValue;
				var stopClientY;
				
				var input = $element[0].querySelector('input');
				
				input.addEventListener('focus', function(){
					if(!input.classList.contains('edit')){
						input.blur();
					}
				});
				input.addEventListener('click', function(){
					if(stopClientY === startClientY){
						input.classList.add('edit');
						input.focus();
					}else{
						if(!input.classList.contains('edit')){
							input.blur();
						}
					}
				});
				input.addEventListener('blur', function(){
					if(input.classList.contains('edit')){
						input.classList.remove('edit');
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
					if(input.classList.contains('edit')){
						return ;
					}
					listening = true;
					startClientY = getY(e);
					startValue = parseInt(this.value, 10) || 0;
					e.stopPropagation();
				};
				var stopHandler = function(e){
					if(input.classList.contains('edit')){
						return ;
					}
					stopClientY = getY(e);
					listening = false;
					e.stopPropagation();
					e.preventDefault();
				};
				
				var moveHandler = function(e){
					if(input.classList.contains('edit')){
						return ;
					}
					if(listening){
						var weight = parseInt(this.getAttribute('data-weight'), 10);
						if(isNaN(weight) || weight <= 0){
							weight = 1;
						}
						var value = Math.floor((getY(e) - startClientY) * -1 / weight) + startValue;
						if(this.hasAttribute('min')){
							var min = parseInt(this.getAttribute('min'), 10);
							if(value < min){
								value = min;
							}
						}
						if(this.hasAttribute('max')){
							var max = parseInt(this.getAttribute('max'), 10);
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
		var highestHarmonic = 5000;
		
		$scope.baseVolume = 100;
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {
			tunings : [],
			misc : []
		};
		$scope._normalizeStringTargets = {};
		
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
			
			findStringById(stringId, function(string, index, array, set){
				frequency = getBaseFrequency(set, stack) * string.multiplier;
			});
			
			return frequency;
		}
		
		function getBaseFrequency(set, stack){
			var baseFrequency;
			
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
			
			if(set.normalize.type !== 'off'){
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
				
				baseFrequency = normalizedBaseFreq;
			}
			
			return baseFrequency;
		}
		
		function calculateCent(stringId){
			var cents;
			
			findStringById(stringId, function(string, index, array, set){
				var baseFrequency = getBaseFrequency(set);
				cents = math.calculateCents(baseFrequency, baseFrequency * string.multiplier);
			});
			
			return cents;
		}
		
		function calculateFrequencies(set){
			var arr = [];
			
			set.strings.forEach(function(string){
				arr.push(calculateFrequency(string.id));
			});
			
			return arr;
		}
		function calculateCents(set){
			var arr = [];
			
			set.strings.forEach(function(string){
				arr.push(calculateCent(string.id));
			});
			
			return arr;
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
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				var diff = diffSetsChange(newValue, oldValue);
				
				diff.sets.removed.forEach(function(setId){
					Object.keys($scope.keyAssignments).some(function(key){
						if($scope.keyAssignments[key].setId === setId){
							$scope.keyAssignments[key].setId = 0;
						}
					});
					AudioModel.removeSet(setId);
				});
				diff.sets.added.forEach(function(setId){
					findSetById(setId, function(set){
						AudioModel.addSet(setId, {
							volume : (set.muted ? 0 : set.volume / 100)
						});
					});
				});
				diff.sets.changed.forEach(function(setId){
					findSetById(setId, function(set){
						AudioModel.setSet(setId, {
							volume : (set.muted ? 0 : set.volume / 100)
						});
					});
				});
				
				diff.strings.removed.forEach(AudioModel.removeString);
				
				diff.strings.added.forEach(function(stringId){
					findStringById(stringId, function(string, index, array, set){
						AudioModel.addString(stringId, set.id, {
							frequency : calculateFrequency(stringId),
							volume : (string.muted ? 0 : string.volume / 100)
						});
					});
				});
				diff.strings.changed.forEach(function(stringId){
					findStringById(stringId, function(string){
						AudioModel.setString(stringId, {
							frequency : calculateFrequency(stringId),
							volume : (string.muted ? 0 : string.volume / 100)
						});
					});
				});
				
				updateNormalizeStringTargets();
			}
		}, true);
		
		// ---------------
		
		function addSet(volume, muted){
			$scope.sets.push({
				id : ++lastSetId,
				normalize : {
					type : 'off',
					subject : 0,
					target : 0
				},
				strings : [],
				volume : typeof volume !== 'undefined' ? volume : 100,
				muted : typeof muted !== 'undefined' ? muted : false
			});
			addString(lastSetId, 1);
			return lastSetId;
		}
		function removeSet(setId){
			findSetById(setId, function(set, index, array){
				array.splice(index, 1);
			});
		}
		function addString(setId, multiplier, volume, muted){
			findSetById(setId, function(set){
				set.strings.push({
					id : ++lastStringId,
					multiplier : multiplier || 1,
					volume : typeof volume !== 'undefined' ? volume : 100,
					muted : typeof muted !== 'undefined' ? muted : false
				});
			});
			return lastStringId;
		}
		function removeString(stringId){
			findStringById(stringId, function(string, index, array, set){
				if(set.strings.length === 1){
					removeSet(set.id);
				}else{
					array.splice(index, 1);
				}
			});
		}
		function canLowerHarmonics(set){
			return (getMultipliers(set).sort(function(a, b){
				return a - b;
			})[0] > lowestHarmonic);
		}
		function lowerHarmonics(setId){
			findSetById(setId, function(set){
				if(canLowerHarmonics(set)){
					set.strings.forEach(function(string){
						string.multiplier--;
					});
				}
			});
		}
		function canRaiseHarmonics(set){
			return (getMultipliers(set).sort(function(a, b){
				return b - a;
			})[0] < highestHarmonic);
		}
		function raiseHarmonics(setId){
			findSetById(setId, function(set){
				if(canRaiseHarmonics(set)){
					set.strings.forEach(function(string){
						string.multiplier++;
					});
				}
			});
		}
		function addPreset(ratio){
			var setId = addSet();
			ratio.sort(function(a, b){
				return a - b;
			}).forEach(function(multiplier){
				addString(setId, multiplier);
			});
		}
		function updatePresets(data){
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[0];
		}
		
		function getMultipliers(set){
			var multipliers = [];
			set.strings.forEach(function(string){
				multipliers.push(string.multiplier);
			});
			return multipliers;
		}
		
		function canBeSimplified(set){
			if(set.strings.length > 1){
				if(math.greatestCommonDivisor.apply(null, getMultipliers(set)) > 1){
					return true;
				}
			}
			return false;
		}
		
		function simplify(setId){
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
		
		function findKnownRatios(set){
			var multipliers = getMultipliers(set);
			var ratios = [];
			
			// todo: $scope.presets
			
			return ratios;
		}
		
		$scope.addSet = addSet;
		$scope.removeSet = removeSet;
		$scope.addString = addString;
		$scope.removeString = removeString;
		$scope.lowerHarmonics = lowerHarmonics;
		$scope.raiseHarmonics = raiseHarmonics;
		$scope.addPreset = addPreset;
		$scope.updatePresets = updatePresets;
		$scope.simplify = simplify;
		$scope.calculateFrequency = calculateFrequency;
		$scope.calculateFrequencies = calculateFrequencies;
		$scope.calculateCent = calculateCent;
		$scope.calculateCents = calculateCents;
		
		$scope.canBeSimplified = canBeSimplified;
		$scope.canLowerHarmonics = canLowerHarmonics;
		$scope.canRaiseHarmonics = canRaiseHarmonics;
		$scope.ratioKnownAs = findKnownRatios;
		
		$http.get('presets.json').then(function(reply){
			updatePresets(reply.data);
		});
		
		// ------------------
		
		$scope.keyAssignments = {
			65 : {label:'A',active:false,setId:0},
			66 : {label:'B',active:false,setId:0},
			67 : {label:'C',active:false,setId:0},
			68 : {label:'D',active:false,setId:0},
			69 : {label:'E',active:false,setId:0},
			70 : {label:'F',active:false,setId:0},
			71 : {label:'G',active:false,setId:0},
			72 : {label:'H',active:false,setId:0},
			73 : {label:'I',active:false,setId:0},
			74 : {label:'J',active:false,setId:0},
			75 : {label:'K',active:false,setId:0},
			76 : {label:'L',active:false,setId:0},
			77 : {label:'M',active:false,setId:0},
			78 : {label:'N',active:false,setId:0},
			79 : {label:'O',active:false,setId:0},
			80 : {label:'P',active:false,setId:0},
			81 : {label:'Q',active:false,setId:0},
			82 : {label:'R',active:false,setId:0},
			83 : {label:'S',active:false,setId:0},
			84 : {label:'T',active:false,setId:0},
			85 : {label:'U',active:false,setId:0},
			86 : {label:'V',active:false,setId:0},
			87 : {label:'W',active:false,setId:0},
			88 : {label:'X',active:false,setId:0},
			89 : {label:'Y',active:false,setId:0},
			90 : {label:'Z',active:false,setId:0}
		};
		
		function assignSetToKey(setId, keyCode){
			if(isSetAssignedToKey(setId) !== false){
				return ;
			}
			$scope.keyAssignments[keyCode].setId = setId;
			findSetById(setId, function(set){
				set.muted = true;
			});
		}
		function unassignSetFromKeys(setId){
			Object.keys($scope.keyAssignments).some(function(key){
				if($scope.keyAssignments[key].setId === setId){
					findSetById(setId, function(set){
						set.muted = false;
					});
					$scope.keyAssignments[key].setId = 0;
					return true;
				}
			});
		}
		function isSetAssignedToKey(setId){
			return Object.keys($scope.keyAssignments).some(function(key){
				return ($scope.keyAssignments[key].setId === setId);
			});
		}
		function getAssignedKeyOfSet(setId){
			var ret = 0;
			Object.keys($scope.keyAssignments).some(function(key){
				if($scope.keyAssignments[key].setId === setId){
					ret = key;
					return true;
				}
			});
			return ret;
		}
		
		$scope.assignSetToKey = assignSetToKey;
		$scope.unassignSetFromKeys = unassignSetFromKeys;
		$scope.isSetAssignedToKey = isSetAssignedToKey;
		$scope.getAssignedKeyOfSet = getAssignedKeyOfSet;
		
		$scope.$watch('keyAssignments', function(newValue, oldValue){
			Object.keys($scope.keyAssignments).forEach(function(key){
				findSetById($scope.keyAssignments[key].setId, function(set){
					set.muted = !$scope.keyAssignments[key].active;
				});
			});
		}, true);
		
		document.body.addEventListener('keydown', function(e){
			if(e.target === document.body && $scope.keyAssignments.hasOwnProperty(e.keyCode) && !$scope.keyAssignments[e.keyCode].active){
				$scope.keyAssignments[e.keyCode].active = true;
				$scope.$apply();
			}
		});
		document.body.addEventListener('keyup', function(e){
			if(e.target === document.body && $scope.keyAssignments.hasOwnProperty(e.keyCode) && $scope.keyAssignments[e.keyCode].active){
				$scope.keyAssignments[e.keyCode].active = false;
				$scope.$apply();
			}
		});
	}]);
})();