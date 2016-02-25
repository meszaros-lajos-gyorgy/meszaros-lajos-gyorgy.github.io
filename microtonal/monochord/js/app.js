angular
	.module('Monochord', ['Presets', 'SetModel', 'Math'])
	.controller('MonochordCtrl', ['$scope', 'presets', 'SetModel', 'math', function($scope, presets, SetModel, math){
		/*
		presets
			.load()
			.then(function(data){
				$scope.presets = data;
				$scope.$apply();
			})
		;
		*/
		
		// --------------
		
		$scope.baseVolume = 30;
		$scope.baseFrequency = 400;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		
		// --------------
		
		var setId;
		
		setTimeout(function(){
			setId = model.sets.add();
			
			/*
			model.strings.add(setId, 2);
			model.strings.add(setId, 3);
			*/
			
			model.cents.add(setId, 702);
			
			model.commit();
		}, 0);
		
		setTimeout(function(){
			model.sets.findById(setId, function(set){
				set.retune = 'lowestToBaseFreq';
			});
			
			model.commit();
			setTimeout(function(){
				model.sets.findById(setId, function(set){
					set.retune = 'highestToBaseFreq';
				});
				
				model.commit();
			}, 1000);
		}, 1000);
	}])
;

/*
## About retuning

base frequency:100Hz

[Strings]

set:{3, 4, 5}  // retune:off
--------------
set:300Hz, 400Hz, 500Hz


set:{3, 4, 5}  // retune:lowest to base frequency
--------------
set:100Hz, 133.3Hz, 166.6Hz


set:{3, 4, 5}  // retune:highest to base frequency
--------------
set:60Hz, 80Hz, 100Hz


set1:{3, 4, 5}  // retune:off
set2:{2, 3}     // retune:lowest to previous' highest
--------------
set1:300Hz, 400Hz, 500Hz
set2:500Hz, 750Hz


[Cents]


*/