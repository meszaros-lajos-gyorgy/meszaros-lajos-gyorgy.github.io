(function(){
	'use strict';
	
	// https://en.wikipedia.org/wiki/List_of_pitch_intervals
	// https://en.wikipedia.org/wiki/Equal_temperament
	
	var oscillators = {};
	var stringGains = {};
	var setGains = {};
	
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
	
	/*
	function addFreq(ctx, freq){
		var o = ctx.createOscillator();
		o.type = 'sine';
		o.frequency.value = freq;
		o.start();
		return o;
	}
	*/
	
	var ctx;
	try{
		ctx = new (window.AudioContext || window.webkitAudioContext)();
	}catch(e){
		alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
	}
	
	var mainGain = ctx.createGain();
	mainGain.connect(ctx.destination);
	mainGain.gain.value = 1;
	
	// ---------------------
	
	var lastStringId = 0;
	var lastSetId = 0;
	
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
	
	app.controller('MonochordCtrl', ['$scope', '$http', '$rootScope', '$location', function($scope, $http, $rootScope, $location){
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {};
		$scope.presetVolume = 0;
		$scope._normalizeStringTargets = {};
		
		function findSetById(setId, run){
			$scope.sets.some(function(set, index, array){
				if(set.id === setId){
					run(set, index, array);
				}
			});
		}
		function findStringById(stringId, run){
			$scope.sets.some(function(set){
				return set.strings.some(function(string, index, array){
					if(string.id === stringId){
						run(string, index, array, set);
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
			
			$scope.sets.filter(function(set){
				return set.id !== excludedSetId
			}).forEach(function(set){
				set.strings.forEach(function(string){
					list.push({
						label : 'String with harmonic level ' + string.multiplier,
						value : string.id,
						group : 'String set #' + set.id
					});
				});
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
				set.strings.forEach(function(string){
					if(string.multiplier > 0){
						string.multiplier--;
					}
				});
			});
		};
		$scope.raiseHarmonics = function(setId){
			findSetById(setId, function(set){
				set.strings.forEach(function(string){
					if(string.multiplier < 100){
						string.multiplier++;
					}
				});
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
			$scope.sets = [];
			stopAll();
			
			// todo, load from URL; temporary code:
			$scope.addPreset([4, 5, 6], 30);
			$scope.addPreset([21, 25], 30);
		};
		function _export(){
			return ''; // todo
		}
		
		function calculateFrequency(stringId, stack){
			var frequency;
			var baseFrequency;
			
			if(set.normalize.target > 0){
				stack = stack || [];
				if(stack.indexOf(stringId) !== -1){
					alert('Normalize target hook! There are no sets, that normalize to the default baseFrequency!');
					return 0;
				}else{
					stack.push(stringId);
					baseFrequency = calculateFrequency(set.normalize.target, stack);
				}
			}else{
				baseFrequency = $scope.baseFrequency
			}
			
			findStringById(stringId, function(string, index, array, set){
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
							findStringById(set.normalize.subject, function(string){
								normalizedBaseFreq = baseFrequency / string.multiplier;
							})
							break;
						}
					}
					
					frequency = normalizedBaseFreq * string.multiplier;
				}
			});
			
			return frequency;
		}
		
		function calculateVolume(stringId){
			var volume = 0;
			findStringById(stringId, function(string){
				volume = string.volume / 100;
			});
			return volume;
		}
		function calculateMasterVolume(setId){
			var volume = 0;
			findSetById(setId, function(set){
				volume = set.volume / 100;
			});
			return volume;
		}
		
		function updateNormalizeStringTargets(){
			$scope._normalizeStringTargets = {};
			$scope.sets.forEach(function(set){
				$scope._normalizeStringTargets[set.id] = getNormalizeStringTargets(set.id);
			});
		}
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			if(newValue !== oldValue){
				$scope.sets.forEach(function(set){
					set.strings.forEach(function(string){
						if(oscillators[string.id]){
							oscillators[string.id].frequency.value = calculateFrequency(string.id);
						}
					});
				});
			}
			updateNormalizeStringTargets();
		});
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				if(JSON.stringify(newValue) === '[]' && JSON.stringify(oldValue) === '[]'){
					return ;
				}
				
				
				
				// todo
				/*
				var ratios = [];
				
				if(loadedFromURL === null){
					stopAll();
				}
				
				newValue.forEach(function(value){
					(
						oldValue.some(function(oldValue){
							return (value.id === oldValue.id);
						})
						? changed
						: added
					).push(value);
					ratios.push(value.multiplier);
				});
				
				oldValue.forEach(function(value){
					if(!changed.some(function(chg){
						return (chg.id === value.id);
					}) && !added.some(function(add){
						return (add.id === value.id);
					})){
						removed.push(value);
					}
				});
				
				changed.forEach(function(string){
					oscillators[string.id].frequency.value = $scope.baseFrequency * string.multiplier;
					gains[string.id].gain.value = string.volume / 100;
				});
				
				added.forEach(function(string){
					var o = addFreq(ctx, $scope.baseFrequency * string.multiplier);
					var g = ctx.createGain();
					g.connect(mainGain);
					o.connect(g);
					g.gain.value = string.volume / 100;
					
					oscillators[string.id] = o;
					gains[string.id] = g;
				});
				
				removed.forEach(function(string){
					gains[string.id].disconnect(mainGain);
					oscillators[string.id].stop();
					delete gains[string.id];
					delete oscillators[string.id];
				});
				
				ratios = ratios.sort(function(a, b){
					return a - b;
				});
				if($scope.normalize){
					var normalizedBaseFreq = $scope.baseFrequency / ratios[0];
					var i = 0;
					Object.keys(oscillators).forEach(function(stringId){
						oscillators[stringId].frequency.value = normalizedBaseFreq * ratios[i];
						i++;
					})
				}
				*/
				
				updateNormalizeStringTargets();
			}
		}, true);
		
		// this was loading unnecessarily many times in the previous version:
		$http.get('presets.json').success(function(data){
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[0];
		});
		
		_import();
	}]);
	
	/*
	app.controller('MonochordCtrl', ['$scope', '$http', '$stateParams', '$state', '$rootScope', function($scope, $http, $stateParams, $state, $rootScope){
		
		// ------------------
		
		$scope.$watch('normalize', function(newValue){
			if(newValue){
				var ratios = [];
				$scope.strings.forEach(function(string){
					ratios.push(string.multiplier);
				});
				ratios = ratios.sort(function(a, b){
					return a - b;
				});
				var normalizedBaseFreq = $scope.baseFrequency / ratios[0];
				var i = 0;
				Object.keys(oscillators).forEach(function(stringId){
					oscillators[stringId].frequency.value = normalizedBaseFreq * ratios[i];
					i++;
				})
			}else{
				$scope.strings.forEach(function(string){
					if(oscillators[string.id]){
						oscillators[string.id].frequency.value = $scope.baseFrequency * string.multiplier;
					}
				});
			}
		});
	}]);
	*/
})();