angular
	.module('Monochord', ['Math', 'AudioModel'])
	.controller('MonochordCtrl', ['$scope', 'audioModel', function($scope, audioModel){
		/*
		audioModel
			.setMainVolume(0.3)
			.addSet(1, {
				volume : 1
			})
			.addString(1, 1, {
				volume : 1,
				type : 'sine',
				frequency : 330
			})
			.addString(2, 1, {
				volume : 1,
				type : 'triangle',
				frequency : 220
			})
			.commit()
		;
		
		setTimeout(audioModel.stopAll, 1000);
		*/
		
		// ----------------
		
		$scope.baseVolume = 10;
		
		$scope.$watch('baseVolume', function(newValue, oldValue){
			audioModel
				.setMainVolume(newValue / 100)
				.commit()
			;
		});
		
		/*
		$scope.$register('baseFrequency', 50);
		$scope.$register('sets', []);
		
		var model = new modules.SetModel([$scope, 'sets']);
		
		
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
		});
		*/
		
		
		
	}])
;