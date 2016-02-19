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
		
		$scope.baseVolume = 30;
		$scope.baseFrequency = 100;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		
		/*
		setTimeout(function(){
			// JI:
			var setId = model.sets.add(100, false, true);
			model.strings.add(setId, 9, 100, false);
			
			// cents:
			var setId = model.sets.add(100, false, false);
			model.cents.add(setId, 3600 + 200, 100, false);
			
			model.commit();
		}, 100);
		*/
		
		// My example scale:
		var scale = [
			[1, 1], // 1:1
			400,    // 400 cent
			[3, 2], // 3:2
			[2, 1]  // 2:1
		];
		
		setTimeout(function(){
			scale.forEach(function(element){
				var setId = model.sets.add(100, false, true);
				if(Array.isArray(element)){
					element.forEach(function(ratio, index){
						model.strings.add(setId, ratio, 100, index !== 0);
					});
				}else{
					model.cents.add(setId, element, 100, false);
				}
			});
			
			model.commit();
		}, 100);
	}])
;