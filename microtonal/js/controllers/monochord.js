define(['app', 'components/menu', 'components/string-to-number'], function(app){
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
	
	app.controller('MonochordCtrl', ['$scope', '$http', '$stateParams', '$state', '$rootScope', function($scope, $http, $stateParams, $state, $rootScope){
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {};
		$scope.presetVolume = 0;
		
		function findSetById(setId, run){
			$scope.sets.some(function(set, index, array){
				if(set.id === setId){
					run(set, index, array);
					return true;
				};
			});
		}
		function findStringById(stringId, run){
			$scope.sets.some(function(set){
				return set.strings.some(function(string, index, array){
					if(string.id === stringId){
						run(string, index, array, set.id);
						return true;
					}
				});
			});
		}
		
		$scope.addSet = function(){
			$scope.sets.push({
				id : ++lastSetId,
				normalize : {
					type : 'off',
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
			// todo, load from URL; temporary code:
			$scope.addPreset([4, 5, 6], 30);
			$scope.addPreset([21, 25], 30);
		};
		function _export(){
			return ''; // todo
		}
		
		function calculateFrequency(stringId){
			// this did not include the normalize procedure
			// return $scope.baseFrequency * string.multiplier;
			return $scope.baseFrequency; // todo
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
		}, true);
		
		function diffSets(newValue, oldValue){
			var diff = {
				changed : [],
				added : [],
				removed : []
			};
			
			// todo
			/*
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
			*/
			
			return diff;
		}
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				if(JSON.stringify(newValue) === '[]' && JSON.stringify(oldValue) === '[]'){
					return ;
				}
				
				var diff = diffSets(newValue, oldValue);
				
				// todo
				/*
				var ratios = [];
				
				if(loadedFromURL === null){
					stopAll();
				}
				
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
				
				var url = 'basefreq/' + $scope.baseFrequency + '/ratios/' + decodeURIComponent(encodeURIComponent(ratios));
				$state.go('monochord', {route : url}, {notify : false});
				
				if(loadedFromURL !== false){
					loadedFromURL = false;
				}
				*/
			}
		});
		
		// this was loading unnecessarily many times in the previous version:
		$http.get('presets.json').success(function(data){
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[0];
		});
		
		_import();
	}]);
	
	/*
	app.controller('MonochordCtrl', ['$scope', '$http', '$stateParams', '$state', '$rootScope', function($scope, $http, $stateParams, $state, $rootScope){
		var BASE_HREF = '/monochord/';
		var loadedFromURL = false; // change type of $scope.strings: false = by UI, null = by URL, true = should ignore, because we changed URL by code
		
		// ------------------
		
		$scope.setStrings = function(ratios){
			var strings = [];
			ratios.sort(function(a, b){
				return a - b;
			}).forEach(function(multiplier){
				strings.push({
					id : ++lastId,
					volume : 0,
					multiplier : multiplier
				});
			});
			$scope.strings = strings;
		};
		
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
		
		// ------------------
		
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			loadedFromURL = true;
		});
		
		setTimeout(function(){
			var rawRoute = ($stateParams.route || '').trim().split('/');
			var route = {};
			for(var i = 0; i < (rawRoute.length & -2); i += 2){
				route[rawRoute[i]] = rawRoute[i + 1];
			}
			
			if(route.ratios){
				if(loadedFromURL !== true){
					loadedFromURL = null;
				}
				try{
					$scope.setStrings(JSON.parse('[' + route.ratios + ']'));
				}catch(e){}
			}
			if(route.basefreq){
				if(loadedFromURL !== true){
					loadedFromURL = null;
				}
				$scope.baseFrequency = parseInt(route.basefreq);
			}
		}, 0);
	}]);
	*/
});