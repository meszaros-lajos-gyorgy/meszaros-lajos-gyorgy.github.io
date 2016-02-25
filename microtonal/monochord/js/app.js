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
		
		// retuning:
		//   default: off
		//   default for new: inherit(from default)
		
		var setId;
		
		setTimeout(function(){
			setId = model.sets.add();
			
			model.strings.add(setId, 2);
			model.strings.add(setId, 3);
			
			model.commit();
		}, 0);
		
		// retuning:
		//   chaning 'default for new' now will not affect current sets, just future ones
		
		// returning:
		//   set#1: will inherit from 'default for new'
		//          since it's inherit by default, it will inherit from 'default'
		
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