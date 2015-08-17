function addFreq(ctx, freq){
	var o = ctx.createOscillator();
	o.type = 'sine';
	o.frequency.value = freq;
	o.start();
	return o;
}

// ---------

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

(function(){
	'use strict';
	
	var app = angular.module('Monochord', []);
	
	app.controller('MainCtrl', ['$scope', function($scope){
		var lastId = 0;
		$scope.strings = [];
		
		$scope.baseFrequency = 100;
		
		$scope.addString = function(){
			lastId++;
			
			$scope.strings.push({
				id : lastId,
				volume : 0,
				multiplier : 1
			});
			
			return lastId;
		};
		
		$scope.removeString = function(id){
			for(var i = 0; i < $scope.strings.length; i++){
				if($scope.strings[i].id === id){
					var string = $scope.strings.splice(i, 1);
					break;
				}
			}
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
				
				oscillators[lastId] = o;
				gains[lastId] = g;
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