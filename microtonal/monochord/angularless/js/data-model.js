(function(){
	'use strict';
	
	var lastStringId = 0;
	var lastSetId = 0;
	
	var $scope = new MicroScope();
	$scope.registerAll({
		baseFrequency : 100,
		sets : [],
		presets : {},
		defaultVolume : 0,
		_normalizeStringTargets : {},
		rawImportData : '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]'
	});
	
	// ---------------
	
	function findSetById(setId, run){
		var sets = $scope.sets;
		sets.some(function(set, index, array){
			if(set.id === setId){
				run(set, index, array);
				return true;
			}
		});
		$scope.sets = sets;
	}
	
	function findStringById(stringId, run){
		var sets = $scope.sets;
		sets.some(function(set){
			return set.strings.some(function(string, index, array){
				if(string.id === stringId){
					run(string, index, array, set);
					return true;
				}
			});
		});
		$scope.sets = sets;
	}
	function getNormalizeStringTargets(excludedSetId){
		var list = [{
			label : 'Base frequency (' + $scope.baseFrequency + ' Hz)',
			value : 0,
			group : 'Miscellaneous'
		}];
		
		var sets = $scope.sets;
		sets.forEach(function(set, index){
			if(set.id !== excludedSetId){
				set.strings.forEach(function(string){
					list.push({
						label : 'String with harmonic level ' + string.multiplier,
						value : string.id,
						group : 'String set #' + (index + 1)
					});
				});
			}
		});
		$scope.sets = sets;
		
		return list;
	}
	
	function _import(){
		var raw = null;
		
		try{
			raw = JSON.parse($scope.rawImportData);
		}catch(e){
			alert('Invalid data');
		}
		
		// todo: validate
		
		if(raw !== null){
			AudioModel.stopAll();
			$scope.sets = raw;
			
			lastSetId = raw.reduce(function(previousValue, currentValue){
				previousValue.push(currentValue.id);
				return previousValue;
			}, []).sort(function(a, b){
				return b - a;
			})[0] || 0;
			
			lastStringId = raw.reduce(function(previousValue, currentValue){
				currentValue.strings.forEach(function(string){
					previousValue.push(string.id);
				});
				return previousValue;
			}, []).sort(function(a, b){
				return b - a;
			})[0] || 0;
		}
	}
	
	function _export(){
		var raw = $scope.sets;
		
		// todo: normalize ID-s
		
		$scope.rawImportData = JSON.stringify(raw);
	}
	function calculateFrequency(stringId, stack){
		var frequency;
		var baseFrequency;
		
		findStringById(stringId, function(string, index, array, set){
			if(set.normalize.target > 0){
				stack = stack || [];
				if(stack.indexOf(stringId) !== -1){
					alert('Infinite normalization target loop! There are no sets, that normalize to the default baseFrequency!');
					return 0;
				}else{
					stack.push(stringId);
					baseFrequency = calculateFrequency(set.normalize.target, stack);
				}
			}else{
				baseFrequency = $scope.baseFrequency
			}
			
			if(set.normalize.type === 'off'){
				frequency = baseFrequency * string.multiplier;
			}else{
				var normalizedBaseFreq;
				
				switch(set.normalize.type){
					case 'lowest' : {
						var ratios = [];
						set.strings.forEach(function(string){
							ratios.push(string.multiplier);
						});
						ratios = ratios.sort(function(a, b){
							return a - b;
						});
						normalizedBaseFreq = baseFrequency / ratios[0];
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
						normalizedBaseFreq = baseFrequency / ratios[0];
						break;
					}
					case 'manual' : {
						if(set.normalize.subject > 0){
							findStringById(set.normalize.subject, function(string){
								normalizedBaseFreq = baseFrequency / string.multiplier;
							})
						}else{
							normalizedBaseFreq = baseFrequency;
						}
						break;
					}
				}
				
				frequency = normalizedBaseFreq * string.multiplier;
			}
		});
		
		return frequency;
	}
	
	function updateNormalizeStringTargets(){
		var targets = {};
		var sets = $scope.sets;
		sets.forEach(function(set){
			targets[set.id] = getNormalizeStringTargets(set.id);
		});
		$scope.sets = sets;
		$scope._normalizeStringTargets = targets;
	}
	
	function updateFrequencies(){
		var sets = $scope.sets;
		sets.forEach(function(set){
			set.strings.forEach(function(string){
				AudioModel.setString(string.id, {
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
	
	// ---------------
	
	$scope.$watch('baseFrequency', function(e){
		if(e.newValue !== e.oldValue){
			updateFrequencies();
		}
		updateNormalizeStringTargets();
	});
	
	$scope.$watch('sets', function(e){
		if(e.newValue !== e.oldValue){
			var diff = diffSetsChange(e.newValue, e.oldValue);
			
			diff.sets.removed.forEach(AudioModel.removeSet);
			diff.sets.added.forEach(function(setId){
				findSetById(setId, function(set){
					AudioModel.addSet(setId, {
						volume : set.volume / 100
					});
				});
			});
			diff.sets.changed.forEach(function(setId){
				findSetById(setId, function(set){
					AudioModel.setSet(setId, {
						volume : set.volume / 100
					});
				});
			});
			
			diff.strings.removed.forEach(AudioModel.removeString);
			
			diff.strings.added.forEach(function(stringId){
				findStringById(stringId, function(string, index, array, set){
					AudioModel.addString(stringId, set.id, {
						frequency : calculateFrequency(stringId),
						volume : string.volume / 100
					});
				});
			});
			diff.strings.changed.forEach(function(stringId){
				findStringById(stringId, function(string){
					AudioModel.setString(stringId, {
						frequency : calculateFrequency(stringId),
						volume : string.volume / 100
					});
				});
			});
			
			_export();
			updateNormalizeStringTargets();
		}
	});
	
	// ---------------
	
	function addSet(){
		var sets = $scope.sets;
		sets.push({
			id : ++lastSetId,
			normalize : {
				type : 'off',
				subject : 0,
				target : 0
			},
			volume : 100,
			strings : []
		});
		$scope.sets = sets;
		return lastSetId;
	}
	function removeSet(setId){
		findSetById(setId, function(set, index, array){
			array.splice(index, 1);
		});
	}
	function addString(setId, multiplier, volume){
		findSetById(setId, function(set){
			set.strings.push({
				id : ++lastStringId,
				multiplier : multiplier || 1,
				volume : typeof volume !== 'undefined' ? volume : $scope.defaultVolume
			});
		});
		return lastStringId;
	}
	function removeString(stringId){
		findStringById(stringId, function(string, index, array){
			array.splice(index, 1);
		});
	}
	function lowerHarmonics(setId){
		findSetById(setId, function(set){
			var ratios = [];
			set.strings.forEach(function(string){
				ratios.push(string.multiplier);
			});
			if(ratios.sort(function(a, b){
				return a - b;
			})[0] > 1){
				set.strings.forEach(function(string){
					string.multiplier--;
				});
			}
		});
	}
	function raiseHarmonics(setId){
		findSetById(setId, function(set){
			var ratios = [];
			set.strings.forEach(function(string){
				ratios.push(string.multiplier);
			});
			if(ratios.sort(function(a, b){
				return b - a;
			})[0] < 100){
				set.strings.forEach(function(string){
					string.multiplier++;
				});
			}
		});
	}
	function addPreset(ratio, volume){
		var setId = addSet();
		ratio.sort(function(a, b){
			return a - b;
		}).forEach(function(multiplier){
			addString(setId, multiplier, volume);
		});
	}
	function updatePresets(data){
		$scope.presets = data;
		$scope.activePresetTuning = $scope.presets.tunings[0];
	}
	
	window.DataModel = {
		addSet : addSet,
		removeSet : removeSet,
		addString : addString,
		removeString : removeString,
		lowerHarmonics : lowerHarmonics,
		raiseHarmonics : raiseHarmonics,
		addPreset : addPreset,
		_import : _import,
		updatePresets : updatePresets
	};
})();