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
	
	// --------------
	
	/*
	function calculateFrequency(stringId, stack){
		var frequency;
		
		findStringById(stringId, function(string, index, array, set){
			frequency = getBaseFrequency(stringId, set, stack) * string.multiplier;
		});
		
		return frequency;
	}
	
	function getBaseFrequency(stringId, set, stack){
		var baseFrequency;
		
		if(set.retune.target > 0){
			stack = stack || [];
			if(stack.indexOf(stringId) !== -1){
				alert('Infinite normalization target loop! There are no sets, that retune to the default baseFrequency!');
				return 0;
			}else{
				stack.push(stringId);
				baseFrequency = calculateFrequency(set.retune.target, stack);
			}
		}else{
			baseFrequency = $scope.baseFrequency
		}
		
		if(set.retune.type !== 'off'){
			var retunedBaseFreq;
			
			switch(set.retune.type){
				case 'lowest' : {
					var ratios = [];
					set.strings.forEach(function(string){
						ratios.push(string.multiplier);
					});
					ratios = ratios.sort(function(a, b){
						return a - b;
					});
					retunedBaseFreq = baseFrequency / ratios[0];
					break;
				}
				case 'highest' : {
					var ratios = [];
					set.strings.forEach(function(string){
						ratios.push(string.multiplier);
					});
					ratios = ratios.sort(function(a, b){
						return b - a;
					});
					retunedBaseFreq = baseFrequency / ratios[0];
					break;
				}
				case 'manual' : {
					if(set.retune.subject > 0){
						findStringById(set.retune.subject, function(string){
							retunedBaseFreq = baseFrequency / string.multiplier;
						})
					}else{
						retunedBaseFreq = baseFrequency;
					}
					break;
				}
			}
			
			baseFrequency = retunedBaseFreq;
		}
		
		return baseFrequency;
	}
	
	function updateFrequencies(){
		var sets = modules.Utils.clone($scope.sets);
		sets.forEach(function(set){
			set.strings.forEach(function(string){
				modules.AudioModel.setString(string.id, {
					frequency : calculateFrequency(string.id)
				});
			});
		});
		$scope.sets = sets;
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
	*/
	
	// --------------
	
	modules.AudioModel
		.setMainVolume($scope.baseVolume / 100)
		.updateReal()
	;
	
	$scope.$watch('baseVolume', function(newValue, oldValue){
		modules.AudioModel
			.setMainVolume(newValue / 100)
			.updateReal()
		;
	});
	$scope.$watch('baseFrequency', function(newValue, oldValue){
		updateFrequencies();
	});
	$scope.$watch('sets', function(newValue, oldValue){
		/*
		var diff = diffSetsChange(newValue, oldValue);
		
		console.log(diff);
		
		diff.sets.removed.forEach(function(setId){
			// Object.keys($scope.keyAssignments).some(function(key){
				// if($scope.keyAssignments[key].setId === setId){
					// $scope.keyAssignments[key].setId = 0;
				// }
			// });
			AudioModel.removeSet(setId);
		});
		diff.sets.added.forEach(function(setId){
			findSetById(setId, function(set){
				AudioModel.addSet(setId, {
					volume : (set.muted ? 0 : set.volume / 100)
				});
			});
		});
		diff.sets.changed.forEach(function(setId){
			findSetById(setId, function(set){
				AudioModel.setSet(setId, {
					volume : (set.muted ? 0 : set.volume / 100)
				});
			});
		});
		
		diff.strings.removed.forEach(AudioModel.removeString);
		
		diff.strings.added.forEach(function(stringId){
			findStringById(stringId, function(string, index, array, set){
				AudioModel.addString(stringId, set.id, {
					frequency : calculateFrequency(stringId),
					volume : (string.muted ? 0 : string.volume / 100)
				});
			});
		});
		diff.strings.changed.forEach(function(stringId){
			findStringById(stringId, function(string){
				AudioModel.setString(stringId, {
					frequency : calculateFrequency(stringId),
					volume : (string.muted ? 0 : string.volume / 100)
				});
			});
		});
		*/
	});
	
	// -----
	
	/*
	modules.AudioModel
		.addSet(1, {
			volume : 1
		}).addString(1, 1, {
			frequency : $scope.baseFrequency,
			type : 'sine',
			volume : 1
		}).updateReal()
	;
	
	$scope.$watch('baseFrequency', function(newValue, oldValue){
		modules.AudioModel
			.setString(1, {
				frequency : newValue
			}).updateReal()
		;
	});
	
	$scope.$register('test', 10);
	*/
	
	// -----
	
	var model = new modules.SetModel([$scope, 'sets']);
	model.sets.add(100, false);
	model.commit();
	
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
	
	// -----
	
	/*
	var sets = $scope.sets;
	sets.push({
		id: 1,
		muted: false,
		volume: 100,
		strings: [{
			id: 1,
			multiplier: 3,
			muted: false,
			volume: 100
		}, {
			id: 2,
			multiplier: 2,
			muted: false,
			volume: 100
		}],
		retune : {}
	});
	$scope.sets = sets;
	*/
	
})(window.modules);