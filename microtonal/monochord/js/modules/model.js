/*
$scope.sets = [{
	id : <int>,	// setId
	muted : <bool>,
	volume : 0..100,
	cents : [{
		id : <int>, // centId
		multiplier : <float>,
		muted : <bool>,
		volume : 0..100,
		type : <string:sine|square|sawtooth|triangle>
	}, ...],
	strings : [{
		id : <int>, // stringId
		multiplier : lowestHarmonic..highestHarmonic,
		muted : <bool>,
		volume : 0..100,
		type : <string:sine|square|sawtooth|triangle>
	}, ...],
	retune : <string>
}, ...];
*/
angular
	.module('Model', ['AudioModel', 'Retune', 'Harmonics', 'Calculate', 'Sets', 'Elements'])
	.factory('Model', ['audioModel', 'Retune', 'Harmonics', 'Calculate', 'Sets', 'Elements', function(audioModel, Retune, Harmonics, Calculate, Sets, Element){
		'use strict';
		
		return function($scope, models){
			var self = this;
			
			this._lastSetId = 0;
			this._lastStringId = 0;
			
			this._lowestHarmonic = 1;
			this._highestHarmonic = 1e6;
			this._lowestCent = 0;
			this._highestCent = Infinity;
			
			this.commit = function(){
				$scope.$apply();
			};
			
			this.TYPE = {
				STRING : 0x01,
				CENT : 0x02
			};
			
			this.retune = new Retune(this, $scope, models);
			this.sets = new Sets(this, $scope, models);
			this.strings = new Element(this, $scope, models, this.TYPE.STRING);
			this.cents = new Element(this, $scope, models, this.TYPE.CENT);
			this.harmonics = new Harmonics(this, $scope, models);
			this.calculate = new Calculate(this, $scope, models);
			
			// -----------------
			
			function diffScopeChange(newValue, oldValue){
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
				var cents = {
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
					
					newSet.cents.forEach(function(newCent){
						cents[
							group !== 'added'
							&& oldSet.cents.some(function(oldCent){
								return oldCent.id == newCent.id;
							})
							? 'changed'
							: 'added'
						].push(newCent.id);
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
						oldSet.cents.forEach(function(oldCent){
							cents.removed.push(oldCent.id);
						})
					}else{
						oldSet.strings.forEach(function(oldString){
							if(
								strings.added.indexOf(oldString.id) === -1
								&& strings.changed.indexOf(oldString.id) === -1
							){
								strings.removed.push(oldString.id);
							}
						});
						oldSet.cents.forEach(function(oldCent){
							if(
								cents.added.indexOf(oldCent.id) === -1
								&& cents.changed.indexOf(oldCent.id) === -1
							){
								cents.removed.push(oldCent.id);
							}
						});
					}
				});
				
				return {
					sets : sets,
					strings : strings,
					cents : cents
				};
			}
			
			$scope.$watch(models.sets, function(newValue, oldValue){
				var diff = diffScopeChange(newValue, oldValue);
				
				diff.sets.removed.forEach(function(setId){
					audioModel.removeSet(setId);
				});
				diff.sets.added.forEach(function(setId){
					self.sets.findById(setId, function(set){
						audioModel.addSet(setId, {
							volume : (set.muted ? 0 : set.volume / 100)
						});
					});
				});
				diff.sets.changed.forEach(function(setId){
					self.sets.findById(setId, function(set){
						audioModel.setSet(setId, {
							volume : (set.muted ? 0 : set.volume / 100)
						});
					});
				});
				
				diff.strings.removed.forEach(audioModel.removeString);
				
				diff.strings.added.forEach(function(stringId){
					self.strings.findById(stringId, function(string, index, array, set){
						audioModel.addString(stringId, set.id, {
							frequency : self.calculate.frequency(stringId, self.TYPE.STRING),
							volume : (string.muted ? 0 : string.volume / 100),
							type : string.type
						});
					});
				});
				diff.strings.changed.forEach(function(stringId){
					self.strings.findById(stringId, function(string){
						audioModel.setString(stringId, {
							frequency : self.calculate.frequency(stringId, self.TYPE.STRING),
							volume : (string.muted ? 0 : string.volume / 100),
							type : string.type
						});
					});
				});
				
				diff.cents.removed.forEach(audioModel.removeCent);
				
				diff.cents.added.forEach(function(centId){
					self.cents.findById(centId, function(cent, index, array, set){
						audioModel.addCent(centId, set.id, {
							frequency : self.calculate.frequency(centId, self.TYPE.CENT),
							volume : (cent.muted ? 0 : cent.volume / 100),
							type : cent.type
						});
					});
				});
				diff.cents.changed.forEach(function(centId){
					self.cents.findById(centId, function(cent){
						audioModel.setCent(centId, {
							frequency : self.calculate.frequency(centId, self.TYPE.CENT),
							volume : (cent.muted ? 0 : cent.volume / 100),
							type : cent.type
						});
					});
				});
				
				audioModel.commit();
			}, true);
			
			$scope.$watch(models.baseFrequency, function(newValue){
				var dirty = false;
				
				$scope[models.sets].forEach(function(set){
					set.strings.forEach(function(string){
						dirty = true;
						audioModel.setString(string.id, {
							frequency : self.calculate.frequency(string, self.TYPE.STRING)
						});
					});
					
					set.cents.forEach(function(cent){
						dirty = true;
						audioModel.setCent(cent.id, {
							frequency : self.calculate.frequency(cent, self.TYPE.CENT)
						});
					});
				});
				
				if(dirty){
					audioModel.commit();
				}
			});
			
			$scope.$watch(models.baseVolume, function(newValue){
				audioModel
					.setMainVolume(newValue / 100)
					.commit()
				;
			});
			
			$scope.$watch(models.retune, function(newValue, oldValue){
				if(newValue.default === oldValue.default){
					return ;
				}
				
				var dirty = false;
				
				// todo: can we extract this and the above copy into an "update frequencies" method?
				$scope[models.sets].forEach(function(set){
					if(set.retune !== 'inherit'){
						return ;
					}
					
					set.strings.forEach(function(string){
						dirty = true;
						audioModel.setString(string.id, {
							frequency : self.calculate.frequency(string, self.TYPE.STRING)
						});
					});
					
					set.cents.forEach(function(cent){
						dirty = true;
						audioModel.setCent(cent.id, {
							frequency : self.calculate.frequency(cent, self.TYPE.CENT)
						});
					});
				});
				
				if(dirty){
					audioModel.commit();
				}
			}, true)
		};
	}])
;