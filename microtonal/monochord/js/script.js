(function(){
	'use strict';
	
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

	var oscillators = {};
	var gains = {};
	
	var app = angular.module('Monochord', []);
	
	app.controller('MainCtrl', ['$scope', function($scope){
		var lastId = 0;
		
		$scope.strings = [];
		$scope.baseFrequency = 100;
		
		// https://en.wikipedia.org/wiki/List_of_pitch_intervals
		// https://en.wikipedia.org/wiki/Equal_temperament
		$scope.ratios = [
			{
				name : 'unision',
				ratio : [1, 1]
			},
			{
				name : 'ji minor second',
				ratio : [16, 15]
			},
			{
				name : 'ji major second',
				ratio : [9, 8]
			},
			{
				name : 'ji minor third',
				ratio : [6, 5]
			},
			{
				name : 'ji major third',
				ratio : [5, 4]
			},
			{
				name : 'ji perfect fourth',
				ratio : [4, 3]
			},
			{
				name : 'ji tritone',
				ratio : [7, 5]
			},
			{
				name : 'ji perfect fifth',
				ratio : [3, 2]
			},
			{
				name : 'ji minor sixth',
				ratio : [8, 5]
			},
			{
				name : 'ji major sixth',
				ratio : [5, 3]
			},
			{
				name : 'ji minor seventh',
				ratio : [16, 9]
			},
			{
				name : 'ji major seventh',
				ratio : [15, 8]
			},
			{
				name : 'octave',
				ratio : [2, 1]
			},
			{
				name : 'bp great limma',
				ratio : [27, 25]
			},
			{
				name : 'bp quasi-tempered minor third',
				ratio : [25, 21]
			},
			{
				name : 'bp septimal major third',
				ratio : [9, 7]
			},
			{
				name : 'bp lesser septimal tritone',
				ratio : [7, 5]
			},
			{
				name : 'bp fifth',
				ratio : [75, 49]
			},
			{
				name : 'bp greater just minor seventh',
				ratio : [9, 5]
			},
			{
				name : 'bp eighth',
				ratio : [49, 25]
			},
			{
				name : 'bp septimal minor ninth',
				ratio : [15, 7]
			},
			{
				name : 'bp septimal minimal tenth',
				ratio : [7, 3]
			},
			{
				name : 'bp quasi-tempered major tenth',
				ratio : [63, 25]
			},
			{
				name : 'bp classic augmented eleventh',
				ratio : [25, 9]
			},
			{
				name : 'just twelfth/bp tritave',
				ratio : [3, 1]
			}
		];
		
		$scope.addString = function(){
			lastId++;
			
			$scope.strings.push({
				id : lastId,
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
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			$scope.strings.forEach(function(string){
				oscillators[string.id].frequency.value = newValue * string.multiplier;
			});
		}, true);
		
		$scope.$watch('strings', function(newValue, oldValue){
			var changed = [];
			var removed = [];
			var added = [];
			
			newValue.forEach(function(value){
				(
					oldValue.some(function(oldValue){
						return (value.id === oldValue.id);
					})
					? changed
					: added
				).push(value);
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
		}, true);
	}]);
	
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
})();