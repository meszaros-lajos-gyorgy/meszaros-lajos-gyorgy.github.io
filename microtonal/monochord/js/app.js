angular
	.module('Monochord', ['Presets', 'SetModel', 'Math'])
	.controller('MonochordCtrl', ['$scope', 'presets', 'SetModel', 'math', function($scope, presets, SetModel, math){
		/*
		presets
			.load()
			.then(function(data){
				$scope.presets = data;
			})
		;
		*/
		
		// --------------
		
		/*
		$scope.baseVolume = 30;
		$scope.baseFrequency = 50;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		*/
		
		console.log(3/2);
		console.log(math.calculateCents(2, 3));
		console.log(math.calculateRatio(701.9550008653874));
		
		// -------
		
		/*
		var setId;
		setTimeout(function(){
			setId = model.sets.add(100, false, true);
			model.strings.add(setId, 4);
			model.strings.add(setId, 6);
			model.commit();
		}, 500);
		
		setTimeout(function(){
			model.strings.add(setId, 7);
			model.commit();
		}, 1000);
		setTimeout(function(){
			model.strings.add(setId, 8);
			model.commit();
		}, 1500);
		setTimeout(function(){
			model.strings.add(setId, 9);
			model.commit();
		}, 2000);
		setTimeout(function(){
			model.strings.add(setId, 12);
			model.commit();
		}, 2500);
		
		setTimeout(function(){
			$scope.baseFrequency = 51;
			$scope.$apply();
		}, 4000);
		setTimeout(function(){
			$scope.baseFrequency = 50;
			$scope.$apply();
		}, 5000);
		*/
	}])
;