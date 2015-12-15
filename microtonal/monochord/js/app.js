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
(function(){
	'use strict';
	
	// -------------
	
	window.addEventListener('touchstart', function(e){
		if(e.target.tagName === 'HTML' || e.target.tagName === 'BODY'){
			e.preventDefault();
		}
	});
	
	// -------------
	
	var app = angular.module('Microtonal', ['AudioModel', 'Math', 'DragnumberDirective', 'HoldclickDirective']);
	
	app.controller('MonochordCtrl', ['$scope', '$http', 'audio', 'math', function($scope, $http, AudioModel, math){
		if(!AudioModel.supported){
			alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
			return ;
		}
		
		var lastStringId = 0;
		var lastSetId = 0;
		var lowestHarmonic = 1;
		var highestHarmonic = 5000;
		
		$scope.baseVolume = 10;
		$scope.baseFrequency = 50;
		$scope.sets = [];
		$scope.presets = {
			tunings : [],
			misc : []
		};
		$scope.stringToEdit = {};
		
		// ---------------
		
		// initialize the base volume
		AudioModel.setMainVolume($scope.baseVolume);
		
		// ---------------
		
		function findSetById(setId, run){
			$scope.sets.some(function(set, index, array){
				if(set.id === setId){
					run(set, index, array);
					return true;
				}
			});
		}
		
		function findPreviousSet(setId, run){
			var prevSet = null;
			$scope.sets.some(function(set){
				if(set.id === setId && prevSet !== null){
					run(prevSet);
					return true;
				}else{
					prevSet = set;
				}
			});
		}
		function findNextSet(setId, run){
			var prevSet = null;
			$scope.sets.some(function(set){
				if(prevSet !== null && prevSet.id === setId){
					run(set);
					return true;
				}else{
					prevSet = set;
				}
			});
		}
		
		function findStringById(stringId, run){
			$scope.sets.some(function(set){
				return set.strings.some(function(string, index, array){
					if(string.id === stringId){
						run(string, index, array, set);
						return true;
					}
				});
			});
		}
		
		function findStringByHarmonic(set, harmonic, run){
			set.strings.some(function(string, index, array){
				if(string.multiplier === harmonic){
					run(string, index, array, set);
					return true;
				}
			});
		}
		
		function getRetuneStringTargets(excludedSetId){
			var list = [{
				label : 'Base frequency (' + $scope.baseFrequency + ' Hz)',
				value : 0,
				group : 'Miscellaneous'
			}];
			
			$scope.sets.forEach(function(set, index){
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
			
			return list;
		}
		
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
		
		function calculateCent(stringId){
			var cents;
			
			findStringById(stringId, function(string, index, array, set){
				var baseFrequency = getBaseFrequency(stringId, set);
				cents = math.calculateCents(baseFrequency, baseFrequency * string.multiplier);
			});
			
			return cents;
		}
		
		function calculateFrequencies(set){
			var arr = [];
			
			set.strings.forEach(function(string){
				arr.push(calculateFrequency(string.id));
			});
			
			return arr;
		}
		function calculateCents(set){
			var arr = [];
			
			set.strings.forEach(function(string){
				arr.push(calculateCent(string.id));
			});
			
			return arr;
		}
		
		function updateFrequencies(){
			$scope.sets.forEach(function(set){
				set.strings.forEach(function(string){
					AudioModel.setString(string.id, {
						frequency : calculateFrequency(string.id)
					});
				});
			});
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
		
		$scope.$watch('baseFrequency', function(newValue, oldValue){
			if(newValue !== oldValue){
				updateFrequencies();
			}
			updateRetuneStringTargets();
		});
		$scope.$watch('baseVolume', function(newValue, oldValue){
			if(newValue !== oldValue){
				AudioModel.setMainVolume(newValue);
			}
		});
		
		$scope.$watch('sets', function(newValue, oldValue){
			if(newValue !== oldValue){
				var diff = diffSetsChange(newValue, oldValue);
				
				diff.sets.removed.forEach(function(setId){
					/*
					Object.keys($scope.keyAssignments).some(function(key){
						if($scope.keyAssignments[key].setId === setId){
							$scope.keyAssignments[key].setId = 0;
						}
					});
					*/
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
				
				updateRetuneStringTargets();
			}
		}, true);
		
		// ---------------
		
		function addSet(volume, muted, dontAddString){
			$scope.sets.push({
				id : ++lastSetId,
				retune : {
					type : 'off',
					subject : 0,
					target : 0
				},
				strings : [],
				volume : typeof volume !== 'undefined' ? volume : 100,
				muted : typeof muted !== 'undefined' ? muted : false
			});
			if(dontAddString !== true){
				addString(lastSetId, 1);
			}
			return lastSetId;
		}
		function removeSet(setId){
			findSetById(setId, function(set, index, array){
				array.splice(index, 1);
			});
			$scope.stringToEdit = {};
		}
		function addString(setId, multiplier, volume, muted){
			findSetById(setId, function(set){
				set.strings.push({
					id : ++lastStringId,
					multiplier : multiplier || 1,
					volume : typeof volume !== 'undefined' ? volume : 100,
					muted : typeof muted !== 'undefined' ? muted : false
				});
			});
			return lastStringId;
		}
		function removeString(stringId){
			findStringById(stringId, function(string, index, array, set){
				if(set.strings.length === 1){
					removeSet(set.id);
				}else{
					array.splice(index, 1);
					if($scope.stringToEdit.id === stringId){
						$scope.stringToEdit = {};
					}
				}
			});
		}
		
		function getLowestHarmonic(set){
			return getMultipliers(set).sort(function(a, b){
				return a - b;
			})[0];
		}
		function canLowerHarmonics(set){
			return getLowestHarmonic(set) > lowestHarmonic;
		}
		function canHalveHarmonics(set){
			return !set.strings.some(function(string){
				return (string.multiplier % 2 !== 0 || string.multiplier / 2 < lowestHarmonic);
			});
		}
		function lowerHarmonics(setId){
			findSetById(setId, function(set){
				if(canLowerHarmonics(set)){
					set.strings.forEach(function(string){
						string.multiplier--;
					});
				}
			});
		}
		function halveHarmonics(setId){
			findSetById(setId, function(set){
				if(canHalveHarmonics(set)){
					set.strings.forEach(function(string){
						string.multiplier /= 2;
					});
				}
			});
		}
		function getHighestHarmonic(set){
			return getMultipliers(set).sort(function(a, b){
				return b - a;
			})[0];
		}
		function canRaiseHarmonics(set){
			return getHighestHarmonic(set) < highestHarmonic;
		}
		function canDoubleHarmonics(set){
			return (getHighestHarmonic(set) * 2 < highestHarmonic);
		}
		function raiseHarmonics(setId){
			findSetById(setId, function(set){
				if(canRaiseHarmonics(set)){
					set.strings.forEach(function(string){
						string.multiplier++;
					});
				}
			});
		}
		function doubleHarmonics(setId){
			findSetById(setId, function(set){
				if(canDoubleHarmonics(set)){
					set.strings.forEach(function(string){
						string.multiplier *= 2;
					});
				}
			});
		}
		function canLowerString(string){
			return string.multiplier > lowestHarmonic;
		}
		function lowerString(string){
			string.multiplier--;
		}
		function canRaiseString(string){
			return string.multiplier < highestHarmonic;
		}
		function raiseString(string){
			string.multiplier++;
		}
		
		function addPreset(ratio){
			var setId = addSet(undefined, undefined, true);
			var ratio = ratio.slice(0);
			ratio.sort(function(a, b){
				return a - b;
			}).forEach(function(multiplier){
				addString(setId, multiplier);
			});
		}
		function updatePresets(data){
			data.tunings.forEach(function(tuning){
				tuning.ratios.forEach(function(ratio){
					ratio.ratio.sort(function(a, b){
						return b - a;
					});
				});
			});
			$scope.presets = data;
			$scope.activePresetTuning = $scope.presets.tunings[$scope.presets.tunings.length - 1];
		}
		
		function getMultipliers(set){
			var multipliers = [];
			set.strings.forEach(function(string){
				multipliers.push(string.multiplier);
			});
			return multipliers;
		}
		
		function canBeNormalized(set){
			if(set.strings.length > 1){
				if(math.greatestCommonDivisor.apply(null, getMultipliers(set)) > 1){
					return true;
				}
			}
			return false;
		}
		
		function normalize(setId){
			findSetById(setId, function(set){
				if(set.strings.length > 1){
					var gcd = math.greatestCommonDivisor.apply(null, getMultipliers(set));
					if(gcd > 1){
						set.strings.forEach(function(string){
							string.multiplier = string.multiplier / gcd;
						});
					}
				}
			});
		}
		
		function findKnownRatios(set){
			var multipliers = [];
			set.strings.forEach(function(string){
				if(!string.muted){
					multipliers.push(string.multiplier);
				}
			});
			multipliers.sort(function(a, b){
				return b - a;
			});
			multipliers = angular.toJson(multipliers);
			
			var ratios = [];
			
			$scope.presets.tunings.forEach(function(tuning){
				tuning.ratios.forEach(function(ratio){
					if(angular.toJson(ratio.ratio) === multipliers){
						ratios.push(tuning.name + '>' + ratio.name);
					}
				});
			});
			
			return ratios.join(', ');
		}
		
		function setStringToEdit(string, set){
			$scope.stringToEdit = string;
			$scope.setOfStringToEdit = set;
		}
		
		$scope.addSet = addSet;
		$scope.removeSet = removeSet;
		$scope.addString = addString;
		$scope.removeString = removeString;
		$scope.lowerHarmonics = lowerHarmonics;
		$scope.raiseHarmonics = raiseHarmonics;
		$scope.halveHarmonics = halveHarmonics;
		$scope.doubleHarmonics = doubleHarmonics;
		$scope.addPreset = addPreset;
		$scope.updatePresets = updatePresets;
		$scope.normalize = normalize;
		$scope.calculateFrequency = calculateFrequency;
		$scope.calculateFrequencies = calculateFrequencies;
		$scope.calculateCent = calculateCent;
		$scope.calculateCents = calculateCents;
		
		$scope.canBeNormalized = canBeNormalized;
		$scope.canLowerHarmonics = canLowerHarmonics;
		$scope.canRaiseHarmonics = canRaiseHarmonics;
		$scope.canHalveHarmonics = canHalveHarmonics;
		$scope.canDoubleHarmonics = canDoubleHarmonics;
		$scope.ratioKnownAs = findKnownRatios;
		$scope.setStringToEdit = setStringToEdit;
		$scope.canLowerString = canLowerString;
		$scope.lowerString = lowerString;
		$scope.canRaiseString = canRaiseString;
		$scope.raiseString = raiseString;
		$scope.getMultipliers = getMultipliers;
		
		$http.get('presets.json').then(function(reply){
			updatePresets(reply.data);
		});
		
		document.querySelector('.wrapper>.main').addEventListener('click', function(e){
			if(e.target === this){
				$scope.stringToEdit = {};
				$scope.$apply();
			}
		});
		
		// ------------------
		
		$scope.popup = '';
		$scope.retuningSetId = 0;
		
		function showKeyboard(){
			closePopup();
			$scope.popup = 'keyboard';
			$scope.sets.forEach(function(set){
				set.muted = true;
			});
		}
		function showRetune(setId){
			closePopup();
			$scope.popup = 'retune';
			$scope.retuningSetId = setId;
		}
		function showImportExport(){
			closePopup();
			$scope.popup = 'import-export';
		}
		
		function closePopup(){
			switch($scope.popup){
				case 'keyboard' :
					$scope.sets.forEach(function(set){
						set.muted = false;
					});
				break;
			}
			$scope.popup = '';
		}
		
		$scope.showKeyboard = showKeyboard;
		$scope.showRetune = showRetune;
		$scope.showImportExport = showImportExport;
		$scope.closePopup = closePopup;
		
		// ------------------
		
		// RETUNE:
		
		// $scope.retuningSetId
		
		$scope._retuneStringTargets = {};
		
		function updateRetuneStringTargets(){
			var targets = {};
			$scope.sets.forEach(function(set){
				targets[set.id] = getRetuneStringTargets(set.id);
			});
			$scope._retuneStringTargets = targets;
		}
		
		// ------------------
		
		// KEYBOARD:
		
		if(window.TouchEvent){
			// todo: implement touch events
			// todo: double tap on key = toggle key hold
		}else{
			var listening = false;
			
			// todo: doubleclick?
			document.body.addEventListener('mousedown', function(e){
				if(!document.querySelector('.dialog .keyboard').classList.contains('hidden')){
					listening = true;
					findSetById(parseInt(e.target.getAttribute('data-set')), function(set){
						set.muted = false;
					});
					$scope.$apply();
				}
			});
			document.body.addEventListener('mouseup', function(e){
				if(!document.querySelector('.dialog .keyboard').classList.contains('hidden')){
					listening = false;
					$scope.sets.forEach(function(set){
						set.muted = true;
					});
					$scope.$apply();
				}
			});
			document.body.addEventListener('mouseover', function(e){
				if(listening){
					findSetById(parseInt(e.relatedTarget.getAttribute('data-set')), function(set){
						set.muted = true;
					});
					findSetById(parseInt(e.target.getAttribute('data-set')), function(set){
						set.muted = false;
					});
					$scope.$apply();
				}
			});
		}
		
		// ------------------
		
		/*
		$scope.keyAssignments = {
			65 : {label:'A',active:false,setId:0},
			66 : {label:'B',active:false,setId:0},
			67 : {label:'C',active:false,setId:0},
			68 : {label:'D',active:false,setId:0},
			69 : {label:'E',active:false,setId:0},
			70 : {label:'F',active:false,setId:0},
			71 : {label:'G',active:false,setId:0},
			72 : {label:'H',active:false,setId:0},
			73 : {label:'I',active:false,setId:0},
			74 : {label:'J',active:false,setId:0},
			75 : {label:'K',active:false,setId:0},
			76 : {label:'L',active:false,setId:0},
			77 : {label:'M',active:false,setId:0},
			78 : {label:'N',active:false,setId:0},
			79 : {label:'O',active:false,setId:0},
			80 : {label:'P',active:false,setId:0},
			81 : {label:'Q',active:false,setId:0},
			82 : {label:'R',active:false,setId:0},
			83 : {label:'S',active:false,setId:0},
			84 : {label:'T',active:false,setId:0},
			85 : {label:'U',active:false,setId:0},
			86 : {label:'V',active:false,setId:0},
			87 : {label:'W',active:false,setId:0},
			88 : {label:'X',active:false,setId:0},
			89 : {label:'Y',active:false,setId:0},
			90 : {label:'Z',active:false,setId:0}
		};
		
		function assignSetToKey(setId, keyCode){
			if(isSetAssignedToKey(setId) !== false){
				return ;
			}
			$scope.keyAssignments[keyCode].setId = setId;
			findSetById(setId, function(set){
				set.muted = true;
			});
		}
		function unassignSetFromKeys(setId){
			Object.keys($scope.keyAssignments).some(function(key){
				if($scope.keyAssignments[key].setId === setId){
					findSetById(setId, function(set){
						set.muted = false;
					});
					$scope.keyAssignments[key].setId = 0;
					return true;
				}
			});
		}
		function isSetAssignedToKey(setId){
			return Object.keys($scope.keyAssignments).some(function(key){
				return ($scope.keyAssignments[key].setId === setId);
			});
		}
		function getAssignedKeyOfSet(setId){
			var ret = 0;
			Object.keys($scope.keyAssignments).some(function(key){
				if($scope.keyAssignments[key].setId === setId){
					ret = key;
					return true;
				}
			});
			return ret;
		}
		
		$scope.assignSetToKey = assignSetToKey;
		$scope.unassignSetFromKeys = unassignSetFromKeys;
		$scope.isSetAssignedToKey = isSetAssignedToKey;
		$scope.getAssignedKeyOfSet = getAssignedKeyOfSet;
		
		$scope.$watch('keyAssignments', function(newValue, oldValue){
			Object.keys($scope.keyAssignments).forEach(function(key){
				findSetById($scope.keyAssignments[key].setId, function(set){
					set.muted = !$scope.keyAssignments[key].active;
				});
			});
		}, true);
		
		document.body.addEventListener('keydown', function(e){
			if(e.target === document.body && $scope.keyAssignments.hasOwnProperty(e.keyCode) && !$scope.keyAssignments[e.keyCode].active){
				$scope.keyAssignments[e.keyCode].active = true;
				$scope.$apply();
			}
		});
		document.body.addEventListener('keyup', function(e){
			if(e.target === document.body && $scope.keyAssignments.hasOwnProperty(e.keyCode) && $scope.keyAssignments[e.keyCode].active){
				$scope.keyAssignments[e.keyCode].active = false;
				$scope.$apply();
			}
		});
		*/
		
		// === debug for sitebuild ===
		
		setTimeout(function(){
			$scope.addPreset([4, 5]);
			/*
			$scope.addPreset([5, 6]);
			$scope.addPreset([6, 7]);
			$scope.addPreset([7, 8]);
			*/
			
			/*
			$scope.baseVolume = 10;
			$scope.showKeyboard();
			*/
			// $scope.baseVolume = 0;
			// $scope.showRetune();
			
			$scope.$apply();
		}, 0);
	}]);
})();