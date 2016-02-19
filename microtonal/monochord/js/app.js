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
		// My example scale:
		var scale = [
			[1, 1], // 1:1
			400,    // 400 cent
			[3, 2], // 3:2
			[2, 1]  // 2:1
		];
		*/
		
		$scope.baseVolume = 30;
		$scope.baseFrequency = 50;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		
		setTimeout(function(){
			// JI:
			var setId = model.sets.add(100, false, true);
			model.strings.add(setId, 5, 100, false);
			
			// cents:
			var setId = model.sets.add(100, false, false);
			model.cents.add(setId, 2400 + 400, 100, false);
			
			model.commit();
		}, 100);
	}])
;