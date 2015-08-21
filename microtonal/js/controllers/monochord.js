define(['app', 'components/menu', 'components/string-to-number'], function(app){
	'use strict';
	
	function addFreq(ctx, freq){
		var o = ctx.createOscillator();
		o.type = 'sine';
		o.frequency.value = freq;
		o.start();
		return o;
	}
	
	function stopAll(){
		Object.keys(gains).forEach(function(key){
			var gain = gains[key];
			gain.gain.value = 0;
			gain.disconnect(mainGain);
			
			var oscillator = oscillators[key];
			oscillator.stop();
			oscillator.disconnect(gain);
		});
		gains = [];
		oscillators = [];
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
	
	var oscillators = {};
	var gains = {};
	var lastId = 0;
	
	app.controller('MonochordCtrl', ['$scope', '$http', '$stateParams', '$state', '$rootScope', function($scope, $http, $stateParams, $state, $rootScope){
		// https://en.wikipedia.org/wiki/List_of_pitch_intervals
		// https://en.wikipedia.org/wiki/Equal_temperament
		
		var BASE_HREF = '/monochord/';
		var loadedFromURL = false; // change type of $scope.strings: false = by UI, null = by URL, true = should ignore, because we changed URL by code
		
		$scope.ratios = [];
		$scope.strings = [];
		$scope.baseFrequency = 100;
		
		// ------------------
		
		$scope.addString = function(){
			$scope.strings.push({
				id : ++lastId,
				volume : 0,
				multiplier : 1
			});
		};
		
		$scope.removeString = function(id){
			for(var i = 0; i < $scope.strings.length; i++){
				if($scope.strings[i].id === id){
					var string = $scope.strings.splice(i, 1);
					break;
				}
			}
		};
		
		$scope.setStrings = function(ratios){
			var strings = [];
			ratios.forEach(function(multiplier){
				strings.push({
					id : ++lastId,
					volume : 0,
					multiplier : multiplier
				});
			});
			$scope.strings = strings;
		};
		
		// ------------------
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			$scope.strings.forEach(function(string){
				if(oscillators[string.id]){
					oscillators[string.id].frequency.value = newValue * string.multiplier;
				}
			});
		}, true);
		
		$scope.$watch('strings', function(newValue, oldValue){
			if(JSON.stringify(newValue) === '[]' && JSON.stringify(oldValue) === '[]'){
				return ;
			}
			
			var changed = [];
			var removed = [];
			var added = [];
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
			
			var url = 'basefreq/' + $scope.baseFrequency + '/ratios/' + decodeURIComponent(encodeURIComponent(ratios));
			$state.go('monochord', {route : url}, {notify : false});
			
			if(loadedFromURL !== false){
				loadedFromURL = false;
			}
		}, true);
		
		// ------------------
		
		$http.get('ratios.json').success(function(data){
			$scope.ratios = data;
		});
		
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			loadedFromURL = true;
		});
		
		setTimeout(function(){
			var rawRoute = ($stateParams.route.trim() || '').split('/');
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
});