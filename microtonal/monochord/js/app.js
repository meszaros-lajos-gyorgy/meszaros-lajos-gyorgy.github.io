/*
Todos:
	- find lastStringId in _import()
	- normalize ids in _export()
	- minimal design for the textarea, so that it becomes larger
	- default volume for all strings
	- displaying volume numerically
	- mainGain volume control
	- display Hz for every string
	- assign set to key
*/

(function(){
	'use strict';
	
	// https://en.wikipedia.org/wiki/List_of_pitch_intervals
	// https://en.wikipedia.org/wiki/Equal_temperament
	
	var ctx;
	var oscillators = {};
	var stringGains = {};
	var setGains = {};
	
	try{
		ctx = new (window.AudioContext || window.webkitAudioContext)();
	}catch(e){
		alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
	}
	
	function stopAll(){
		Object.keys(oscillators).forEach(function(key){
			oscillators[key].stop();
			oscillators[key].disconnect();
		});
		Object.keys(stringGains).forEach(function(key){
			stringGains[key].disconnect();
		});
		Object.keys(setGains).forEach(function(key){
			setGains[key].disconnect();
		});
		
		oscillators = {};
		stringGains = {};
		setGains = {};
	}
	
	var mainGain = ctx.createGain();
	mainGain.connect(ctx.destination);
	mainGain.gain.value = 1;
	
	// ---------------------
	
	var app = angular.module('Microtonal', []);
	
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
	
	var lastStringId = 0;
	var lastSetId = 0;
	
	app.controller('MonochordCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location){
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {};
		$scope.presetVolume = 0;
		$scope._normalizeStringTargets = {};
		$scope.rawImportData = '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]';
		
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
		
		$scope.addSet = function(){
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
		};
		$scope.removeSet = function(setId){
			findSetById(setId, function(set, index, array){
				array.splice(index, 1);
			});
		};
		
		$scope.addString = function(setId, multiplier, volume){
			findSetById(setId, function(set){
				set.strings.push({
					id : ++lastStringId,
					multiplier : multiplier || 1,
					volume : volume || 0
				});
			});
			return lastStringId;
		};
		$scope.removeString = function(stringId){
			findStringById(stringId, function(string, index, array){
				array.splice(index, 1);
			});
		};
		
		$scope.lowerHarmonics = function(setId){
			findSetById(setId, function(set){
				var ratios = [];
				set.strings.forEach(function(string){
					ratios.push(string.multiplier);
				});
				if(ratios.sort(function(a, b){
					return a - b;
				})[0] > 1){
					set.strings.forEach(function(string){
						string.multiplier--;
					});
				}
			});
		};
		$scope.raiseHarmonics = function(setId){
			findSetById(setId, function(set){
				var ratios = [];
				set.strings.forEach(function(string){
					ratios.push(string.multiplier);
				});
				if(ratios.sort(function(a, b){
					return b - a;
				})[0] < 100){
					set.strings.forEach(function(string){
						string.multiplier++;
					});
				}
			});
		};
		
		$scope.addPreset = function(ratio, volume){
			var setId = $scope.addSet();
			ratio.sort(function(a, b){
				return a - b;
			}).forEach(function(multiplier){
				$scope.addString(setId, multiplier, volume);
			});
		};
		
		function _import(){
			var raw = null;
			
			try{
				raw = JSON.parse($scope.rawImportData);
			}catch(e){
				alert('Invalid data');
			}
			
			// todo: validate
			
			if(raw !== null){
				stopAll();
				$scope.sets = raw;
				
				lastSetId = raw.reduce(function(previousValue, currentValue){
					previousValue.push(currentValue.id);
					return previousValue;
				}, []).sort(function(a, b){
					return b - a;
				})[0] || 0;
				
				lastStringId = 0; // todo
			}
		};
		function _export(){
			var raw = angular.copy($scope.sets);
			
			// todo: normalize ID-s
			
			$scope.rawImportData = JSON.stringify(raw);
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
			$scope._normalizeStringTargets = {};
			$scope.sets.forEach(function(set){
				$scope._normalizeStringTargets[set.id] = getNormalizeStringTargets(set.id);
			});
		}
		
		function updateFrequencies(){
			$scope.sets.forEach(function(set){
				set.strings.forEach(function(string){
					if(oscillators[string.id]){
						oscillators[string.id].frequency.value = calculateFrequency(string.id);
					}
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
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			if(newValue !== oldValue){
				updateFrequencies();
			}
			updateNormalizeStringTargets();
		});
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				var diff = diffSetsChange(newValue, oldValue);
				
				diff.sets.removed.forEach(function(setId){
					setGains[setId].disconnect();
					delete setGains[setId];
				});
				diff.sets.added.forEach(function(setId){
					findSetById(setId, function(set){
						var g = ctx.createGain();
						g.connect(mainGain);
						g.gain.value = set.volume / 100;
						
						setGains[setId] = g;
					});
				});
				diff.sets.changed.forEach(function(setId){
					findSetById(setId, function(set){
						setGains[setId].gain.value = set.volume / 100;
					});
				});
				
				diff.strings.removed.forEach(function(stringId){
					oscillators[stringId].stop();
					oscillators[stringId].disconnect();
					delete oscillators[stringId];
					stringGains[stringId].disconnect();
					delete stringGains[stringId];
				});
				diff.strings.added.forEach(function(stringId){
					findStringById(stringId, function(string, index, array, set){
						var g = ctx.createGain();
						g.connect(setGains[set.id]);
						g.gain.value = string.volume / 100;
						var o = ctx.createOscillator();
						o.type = 'sine';
						o.frequency.value = calculateFrequency(stringId);
						o.connect(g);
						o.start();
						
						stringGains[stringId] = g;
						oscillators[stringId] = o;
					});
				});
				diff.strings.changed.forEach(function(stringId){
					findStringById(stringId, function(string, index, array, set){
						oscillators[stringId].frequency.value = calculateFrequency(stringId);
						stringGains[stringId].gain.value = string.volume / 100;
					});
				});
				
				_export();
				updateNormalizeStringTargets();
			}
		}, true);
		
		$http.get('presets.json').success(function(data){
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[0];
		});
		
		setTimeout(_import, 0);
	}]);
})();