// requires:
//   modules.AudioModel
//   modules.Math
//   modules.Scope
//   modules.UI
//   modules.TuningModel

/*
$scope.sets = [{
	id : <int>,	// setId
	muted : <bool>,
	volume : 0..100,
	strings : [{
		id : <int>, // stringId
		multiplier : lowestHarmonic..highestHarmonic,
		muted : <bool>,
		volume : 0..100
	}, ...],
	retune : {
		subject : <stringId|0>, // 0=baseFrequency, stringId=string in different set
		target : <stringId>,
		type : 'off|lowest|highest|manual'
	}
}, ...];
*/
(function(modules){
	'use strict';
	
	if(!modules.AudioModel.supported){
		alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
		return ;
	}
	
	var $scope = new modules.Scope();
	
	$scope.$register('baseVolume', 10);
	$scope.$register('baseFrequency', 50);
	$scope.$register('sets', []);
	
	var model = new modules.SetModel([$scope, 'sets']);
	
	modules.AudioModel
		.setMainVolume($scope.baseVolume / 100)
		.updateReal()
	;
	
	// --------------
	
	function updateFrequencies(model){
		$scope.sets.forEach(function(set){
			set.strings.forEach(function(string){
				modules.AudioModel.setString(string.id, {
					frequency : model.calculate.frequency(string.id)
				});
			});
		});
		modules.AudioModel.updateReal();
	}
	
	function diffSetsChange(newValue, oldValue){
		var sets = {
			added : [],
			removed : [],
			changed : []
		};
		var strings = {
			added : [],
			removed : [],
			changed : []
		};
		
		newValue.forEach(function(newSet){
			var group = 'added';
			var oldSet;
			oldValue.some(function(_oldSet){
				if(_oldSet.id === newSet.id){
					oldSet = _oldSet;
					group = 'changed';
					return true;
				}
			});
			
			sets[group].push(newSet.id);
			
			newSet.strings.forEach(function(newString){
				strings[
					group !== 'added'
					&& oldSet.strings.some(function(oldString){
						return oldString.id == newString.id;
					})
					? 'changed'
					: 'added'
				].push(newString.id);
			});
		});
		
		oldValue.forEach(function(oldSet){
			if(
				sets.added.indexOf(oldSet.id) === -1
				&& sets.changed.indexOf(oldSet.id) === -1
			){
				sets.removed.push(oldSet.id);
				oldSet.strings.forEach(function(oldString){
					strings.removed.push(oldString.id);
				});
			}else{
				oldSet.strings.forEach(function(oldString){
					if(
						strings.added.indexOf(oldString.id) === -1
						&& strings.changed.indexOf(oldString.id) === -1
					){
						strings.removed.push(oldString.id);
					}
				});
			}
		});
		
		return {
			sets : sets,
			strings : strings
		};
	}
	
	// --------------
	
	$scope.$watch('baseVolume', function(newValue, oldValue){
		modules.AudioModel
			.setMainVolume(newValue / 100)
			.updateReal()
		;
	});
	$scope.$watch('baseFrequency', function(newValue, oldValue){
		updateFrequencies(model);
	});
	$scope.$watch('sets', function(newValue, oldValue){
		var diff = diffSetsChange(newValue, oldValue);
		
		diff.sets.removed.forEach(function(setId){
			// Object.keys($scope.keyAssignments).some(function(key){
				// if($scope.keyAssignments[key].setId === setId){
					// $scope.keyAssignments[key].setId = 0;
				// }
			// });
			modules.AudioModel.removeSet(setId);
		});
		diff.sets.added.forEach(function(setId){
			model.sets.findById(setId, function(set){
				modules.AudioModel.addSet(setId, {
					volume : (set.muted ? 0 : set.volume / 100)
				});
			});
		});
		diff.sets.changed.forEach(function(setId){
			model.sets.findById(setId, function(set){
				modules.AudioModel.setSet(setId, {
					volume : (set.muted ? 0 : set.volume / 100)
				});
			});
		});
		
		diff.strings.removed.forEach(modules.AudioModel.removeString);
		
		diff.strings.added.forEach(function(stringId){
			model.strings.findById(stringId, function(string, index, array, set){
				modules.AudioModel.addString(stringId, set.id, {
					frequency : model.calculate.frequency(stringId),
					volume : (string.muted ? 0 : string.volume / 100)
				});
			});
		});
		diff.strings.changed.forEach(function(stringId){
			model.strings.findById(stringId, function(string){
				modules.AudioModel.setString(stringId, {
					frequency : model.calculate.frequency(stringId),
					volume : (string.muted ? 0 : string.volume / 100)
				});
			});
		});
		
		modules.AudioModel.updateReal();
	});
	
	// -----
	
	$scope.baseFrequency = 100;
	
	var setId = model.sets.add();
	
	var limit = 10;
	
	for(var i = 1; i <= limit; i++){
		(function(i){
			setTimeout(function(){
				model.strings.add(setId, i, 100 - (100 / limit * (i - 1)));
				model.commit();
			}, 500 * (i - 1));
		})(i);
	}
	
	// -----
	var baseControls = modules.DOM.createElement('section', {
		'class' : 'base-controls'
	}, [
		modules.DOM.createElement('div', {}, [
			'Fundamental frequency',
			modules.UI.createDragNumber([$scope, 'baseFrequency'], {
				min : 1,
				weight : 5
			})
		]),
		modules.UI.createVolume([$scope, 'baseVolume'])
	]);
	
	modules.DOM.onReady(function(){
		document.body.appendChild(baseControls);
	});
})(window.modules);