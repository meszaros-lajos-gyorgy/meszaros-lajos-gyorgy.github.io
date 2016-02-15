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
		
		// My example scale:
		var scale = [
			[1, 1], // 1:1
			400,    // 400 cent
			[3, 2], // 3:2
			[2, 1]  // 2:1
		];
		
		$scope.baseVolume = 30;
		$scope.baseFrequency = 50;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		
		setTimeout(function(){
			
			model.commit();
		}, 100);
	}])
;