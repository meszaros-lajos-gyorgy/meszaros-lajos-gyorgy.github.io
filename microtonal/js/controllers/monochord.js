define(['app', 'components/menu', 'components/string-to-number'], function(app){
	'use strict';
	
	// https://en.wikipedia.org/wiki/List_of_pitch_intervals
	// https://en.wikipedia.org/wiki/Equal_temperament
	
	var lastStringId = 0;
	var lastSetId = 0;
	
	var oscillators = {};
	var stringGains = {};
	var setGains = {};
	
	function stopAll(){
		// todo
		/*
		Object.keys(gains).forEach(function(key){
			var gain = gains[key];
			gain.gain.value = 0;
			gain.disconnect(mainGain);
			
			var oscillator = oscillators[key];
			oscillator.stop();
			oscillator.disconnect(gain);
		});
		*/
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
	
	var ctx;
	try{
		ctx = new (window.AudioContext || window.webkitAudioContext)();
	}catch(e){
		alert('Web Audio API is not supported by this browser');
	}
	
	var mainGain = ctx.createGain();
	mainGain.connect(ctx.destination);
	mainGain.gain.value = 1;
	*/
	
	// ---------------------
	
	app.controller('MonochordCtrl', ['$scope', '$http', '$stateParams', '$state', '$rootScope', function($scope, $http, $stateParams, $state, $rootScope){
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.presets = {};
		
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
		};
		$scope.removeSet = function(setId){
			$scope.sets.some(function(set, index, array){
				if(set.id === setId){
					array.splice(index, 1);
					return true;
				}
			});
		};
		
		$scope.addString = function(setId){
			$scope.sets.some(function(set){
				if(set.id === setId){
					set.strings.push({
						id : ++lastStringId,
						volume : 0,
						multiplier : 1
					});
					return true;
				}
			});
		};
		$scope.removeString = function(stringId){
			$scope.sets.some(function(set){
				return set.strings.some(function(string, index, array){
					if(string.id === stringId){
						array.splice(index, 1);
						return true;
					}
				});
			});
		};
		
		function _import(){
			// todo
			return [{
				id : 1,
				normalize : {
					type : 'manual',
					target : 2
				},
				volume : 100,
				strings : [{
					id : 1,
					volume : 0.3,
					multiplier : 4
				}, {
					id : 2,
					volume : 0.3,
					multiplier : 5
				}, {
					id : 3,
					volume : 0.3,
					multiplier : 6
				}]
			}, {
				id : 2,
				normalize : {
					type : 'manual',
					target : 4
				},
				volume : 100,
				strings : [{
					id : 4,
					volume : 0.3,
					multiplier : 21
				}, {
					id : 5,
					volume : 0.3,
					multiplier : 25
				}]
			}];
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
			return 0; // todo
		}
		function calculateMasterVolume(setId){
			return 0; // todo
		}
		
		$scope.$watch('baseFrequency', function(){
			$scope.sets.forEach(function(set){
				set.strings.forEach(function(string){
					if(oscillators[string.id]){
						oscillators[string.id].frequency.value = calculateFrequency(string.id);
					}
				});
			});
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
		});
		
		// this was loading unnecessarily many times in the previous version:
		$http.get('presets.json').success(function(data){
			$scope.presets = data;
		});
		
		// temporary code:
		$scope.sets = _import();
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