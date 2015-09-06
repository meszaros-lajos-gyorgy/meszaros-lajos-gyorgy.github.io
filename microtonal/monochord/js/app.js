/*
Todos:
	- supporting the old webkitAudioContext
	- alternative waveforms (audioContext.createPeriodicWave()
	- minimal design for the textarea, so that it becomes larger
	- display Hz for every string
	- normalize ids in _export()
	- displaying volume numerically
	- mainGain volume control
	- 'assign set to key' feature
	- import/export to Dave Ryan's notation/format (http://arxiv.org/ftp/arxiv/papers/1508/1508.07739.pdf)

Ratios:
	https://en.wikipedia.org/wiki/List_of_pitch_intervals
	https://en.wikipedia.org/wiki/Equal_temperament

Custom waveforms:
	http://chromium.googlecode.com/svn/trunk/samples/audio/wave-tables/
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createPeriodicWave
	https://github.com/corbanbrook/dsp.js/
	http://stackoverflow.com/questions/24743732/arbitrary-wave-table-for-a-custom-oscillator
	http://www.sitepoint.com/using-fourier-transforms-web-audio-api/

Porting webkitAudioContext:
	https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
*/

(function(){
	'use strict';
	
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
	
	app.factory('AudioService', [function(){
		// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
		function createContext(){
			return new (window.AudioContext || window.webkitAudioContext)();
		}
		function getDestination(ctx){
			return ctx.destination;
		}
		
		function createGain(ctx){
			var gain;
			try{
				gain = ctx.createGain();
			}catch(e){
				gain = ctx.createGainNode();
			}
			return gain;
		}
		function connectGain(gain, connectTarget){
			gain.connect(connectTarget);
		}
		function setGainValue(gain, value){
			gain.gain.value = value;
		}
		function disconnectGain(gain, target){
			if(target){
				gain.disconnect(target);
			}else{
				gain.disconnect();
			}
		}
		
		function createOscillator(ctx){
			return ctx.createOscillator();
		}
		function connectOscillator(oscillator, connectTarget){
			oscillator.connect(connectTarget);
		}
		function setOscillatorType(oscillator, type){
			if(!window.AudioContext){
				switch(type){
					case "sine" : {
						type = oscillator.SINE;
						break;
					}
					case "square" :{
						type = oscillator.SQUARE;
						break;
					}
					case "sawtooth" :{
						type = oscillator.SAWTOOTH;
						break;
					}
					case "triangle" :{
						type = oscillator.TRIANGLE;
						break;
					}
				}
			}
			oscillator.type = type;
		}
		function setOscillatorFrequency(oscillator, frequency){
			oscillator.frequency.value = frequency;
		}
		function startOscillator(oscillator){
			try{
				oscillator.start();
			}catch(e){
				oscillator.noteOn(0);
			}
		}
		function stopOscillator(oscillator){
			try{
				oscillator.stop();
			}catch(e){
				oscillator.noteOff();
			}
		}
		function disconnectOscillator(oscillator, target){
			if(target){
				oscillator.disconnect(target);
			}else{
				oscillator.disconnect();
			}
		}
		
		
		var ctx;
		var oscillators = {};
		var stringGains = {};
		var setGains = {};
		
		try{
			ctx = createContext();
		}catch(e){
			alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
		}
		
		var mainGain = createGain(ctx);
		connectGain(mainGain, getDestination(ctx));
		setGainValue(mainGain, 1);
		
		return {
			setString : function(stringId, config){
				if(oscillators[stringId]){
					if(config.frequency){
						setOscillatorFrequency(oscillators[stringId], config.frequency);
					}
				}
				if(stringGains[stringId]){
					if(config.hasOwnProperty('volume')){
						setGainValue(stringGains[stringId], config.volume);
					}
				}
			},
			setSet : function(setId, config){
				if(setGains[setId]){
					if(config.hasOwnProperty('volume')){
						setGainValue(setGains[setId], config.volume);
					}
				}
			},
			addString : function(stringId, setId, config){
				var g = createGain(ctx);
				connectGain(g, setGains[setId]);
				setGainValue(g, config.hasOwnProperty('volume') ? config.volume : 1);
				var o = createOscillator(ctx);
				setOscillatorType(o, 'sine'); // square|square|sawtooth|triangle|custom
				if(config.frequency){
					setOscillatorFrequency(o, config.frequency);
				}
				connectOscillator(o, g);
				startOscillator(o);
				
				stringGains[stringId] = g;
				oscillators[stringId] = o;
			},
			addSet : function(setId, config){
				var g = createGain(ctx);
				connectGain(g, mainGain);
				setGainValue(g, config.hasOwnProperty('volume') ? config.volume : 1);
				
				setGains[setId] = g;
			},
			removeString : function(stringId){
				stopOscillator(oscillators[stringId]);
				disconnectOscillator(oscillators[stringId]);
				delete oscillators[stringId];
				disconnectGain(stringGains[stringId]);
				delete stringGains[stringId];
			},
			removeSet : function(setId){
				disconnectGain(setGains[setId]);
				delete setGains[setId];
			},
			stopAll : function(){
				Object.keys(oscillators).forEach(function(key){
					oscillators[key].stop();
					oscillators[key].disconnect();
					stopOscillator(oscillators[key]);
					disconnectOscillator(oscillators[key]);
				});
				Object.keys(stringGains).forEach(function(key){
					disconnectGain(stringGains[key]);
				});
				Object.keys(setGains).forEach(function(key){
					disconnectGain(setGains[key]);
				});
				
				oscillators = {};
				stringGains = {};
				setGains = {};
			}
		};
	}]);
	
	var lastStringId = 0;
	var lastSetId = 0;
	
	app.controller('MonochordCtrl', ['AudioService', '$scope', '$http', '$rootScope', '$location', function(audio, $scope, $http, $rootScope, $location){
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {};
		$scope.defaultVolume = 0;
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
					volume : typeof volume !== 'undefined' ? volume : $scope.defaultVolume
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
				audio.stopAll();
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
		};
		function _export(){
			var raw = angular.copy($scope.sets);
			
			// todo: normalize ID-s
			
			$scope.rawImportData = JSON.stringify(raw);
		}
		
		$scope._import = _import;
		
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
					audio.setString(string.id, {
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
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			if(newValue !== oldValue){
				updateFrequencies();
			}
			updateNormalizeStringTargets();
		});
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				var diff = diffSetsChange(newValue, oldValue);
				
				diff.sets.removed.forEach(audio.removeSet);
				diff.sets.added.forEach(function(setId){
					findSetById(setId, function(set){
						audio.addSet(setId, {
							volume : set.volume / 100
						});
					});
				});
				diff.sets.changed.forEach(function(setId){
					findSetById(setId, function(set){
						audio.setSet(setId, {
							volume : set.volume / 100
						});
					});
				});
				
				diff.strings.removed.forEach(audio.removeString);
				
				diff.strings.added.forEach(function(stringId){
					findStringById(stringId, function(string, index, array, set){
						audio.addString(stringId, set.id, {
							frequency : calculateFrequency(stringId),
							volume : string.volume / 100
						});
					});
				});
				diff.strings.changed.forEach(function(stringId){
					findStringById(stringId, function(string){
						audio.setString(stringId, {
							frequency : calculateFrequency(stringId),
							volume : string.volume / 100
						});
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
	}]);
})();