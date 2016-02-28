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
		$scope.baseFrequency = 300;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		
		// --------------
		
		setTimeout(function(){
			model.cents.add(model.sets.add(), 70);
			model.commit();
		}, 0);
		
		setTimeout(function(){
			model.cents.add(model.sets.add(), 70);
			model.commit();
			setTimeout(function(){
				model.cents.add(model.sets.add(), 70);
				model.commit();
				setTimeout(function(){
					model.cents.add(model.sets.add(), 70);
					model.commit();
				}, 1000);
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