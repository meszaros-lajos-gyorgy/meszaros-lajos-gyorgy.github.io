angular
	.module('Monochord', ['Presets', 'AudioModel', 'SetModel'])
	.controller('MonochordCtrl', ['$scope', 'presets', 'audioModel', 'setModel', function($scope, presets, audioModel, setModel){
		/*
		presets
			.load()
			.then(function(data){
				$scope.presets = data;
			})
		;
		*/
		
		// --------------
		
		$scope.baseVolume = 10;
		$scope.baseFrequency = 50;
		$scope.sets = [];
		
		var model = new setModel([$scope, 'sets']);
		
		
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
		
		
		// --------------
		
		function updateFrequencies(model){
			$scope.sets.forEach(function(set){
				set.strings.forEach(function(string){
					audioModel.setString(string.id, {
						frequency : model.calculate.frequency(string.id)
					});
				});
			});
			audioModel.commit();
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
			audioModel
				.setMainVolume(newValue / 100)
				.commit()
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
				audioModel.removeSet(setId);
			});
			diff.sets.added.forEach(function(setId){
				model.sets.findById(setId, function(set){
					audioModel.addSet(setId, {
						volume : (set.muted ? 0 : set.volume / 100)
					});
				});
			});
			diff.sets.changed.forEach(function(setId){
				model.sets.findById(setId, function(set){
					audioModel.setSet(setId, {
						volume : (set.muted ? 0 : set.volume / 100)
					});
				});
			});
			
			diff.strings.removed.forEach(audioModel.removeString);
			
			diff.strings.added.forEach(function(stringId){
				model.strings.findById(stringId, function(string, index, array, set){
					audioModel.addString(stringId, set.id, {
						frequency : model.calculate.frequency(stringId),
						volume : (string.muted ? 0 : string.volume / 100)
					});
				});
			});
			diff.strings.changed.forEach(function(stringId){
				model.strings.findById(stringId, function(string){
					audioModel.setString(stringId, {
						frequency : model.calculate.frequency(stringId),
						volume : (string.muted ? 0 : string.volume / 100)
					});
				});
			});
			
			audioModel.commit();
		}, true);
	}])
;