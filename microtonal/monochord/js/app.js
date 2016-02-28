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
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.retune = {
			default : 'lowestToPrevHighest',
			defaultForNew : 'inherit'
		};
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume',
			retune : 'retune'
		});
		
		// --------------
		
		var step = 700;
		
		setTimeout(function(){
			var setId = model.sets.add();
			model.cents.add(setId, 0, 100, true);
			model.cents.add(setId, step);
			
			model.commit();
			setTimeout(function(){
				var setId = model.sets.add();
				model.cents.add(setId, 0, 100, true);
				model.cents.add(setId, step);
				model.commit();
				setTimeout(function(){
					var setId = model.sets.add();
					model.cents.add(setId, 0, 100, true);
					model.cents.add(setId, step);
					model.commit();
					setTimeout(function(){
						var setId = model.sets.add();
						model.cents.add(setId, 0, 100, true);
						model.cents.add(setId, step);
						model.commit();
					}, 1000);
				}, 1000);
			}, 1000);
		}, 0);
		
		/*
		setTimeout(function(){
			var setId = model.sets.add();
			
			model.cents.add(setId, 400);
			model.cents.add(setId, 700);
			
			model.commit();
			setInterval(function(){
				if($scope.retune.default === 'lowestToBaseFreq'){
					$scope.retune.default = 'highestToBaseFreq';
				}else{
					$scope.retune.default = 'lowestToBaseFreq';
				}
				$scope.$apply();
			}, 1000);
		}, 0);
		*/
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

set:{400¢, 700¢}  // retune:off; could be converted to ratio: {1.2599, 1.4983}
---------------
set:125.99Hz, 149.83Hz


set:{400¢, 700¢}  // retune:lowest to base frequency
---------------
set:100Hz, 118.92Hz


set:{400¢, 700¢}  // retune:highest to base frequency
---------------
set:84.08Hz, 100Hz

==================================

String multipliers actually indicate ratios on their own:
3, 4, 5 are actually three ratios, namingly 1:3, 1:4 and 1:5

Cents' being ratios are more straightforward:
400¢, 700¢ are actually 1:1.2599, 1:1.4983
*/