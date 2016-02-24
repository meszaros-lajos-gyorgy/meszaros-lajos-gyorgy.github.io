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
		$scope.baseFrequency = 200;
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
		
		setTimeout(function(){
			var setId = model.sets.add();
			
			model.strings.add(setId, 2);
			model.strings.add(setId, 3);
			
			model.commit();
		}, 0);
		
		// retuning:
		//   chaning 'default for new' now will not affect current sets, just future ones
		
		// returning:
		//   set#1: will inherit from 'default for new'
		//          since it's inherit by default, it will inherit from 'default'
		
		/*
		example retuning definition:
			"retune the current SET's lowest string to the previous SET's highest ..."
			"... if there is no previous, then use baseFrequency"
				subject = sets.filter(id == CURRENT).get(0);
				subject.string = subject.strings.sort(by multiplier, asc).get(0);
				
				_previousSets = sets.filter(id < subject.id);
				if(_previousSets.length){
					target = _previousSets.get(_previousSets.length - 1);
					target.string = target.strings.sort(by multiplier, desc).get(0);
		*/
	}])
;