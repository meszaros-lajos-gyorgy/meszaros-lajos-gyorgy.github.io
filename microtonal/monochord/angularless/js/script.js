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
	
	/*
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
	model.strings.add(setId, 3);
	model.strings.add(setId, 2);
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
	*/
	
	// -----------------
	
	/*
	function clearChildren(node){
		var l = node.childNodes.length;
		while(l--){
			node.removeChild(node.childNodes[l]);
		}
	}
	
	function renderChildren(node, amount){
		var i = 0;
		while(++i <= amount){
			var li = modules.DOM.createElement('li', {}, [
				i
			]);
			node.appendChild(li);
		}
	}
	
	var list = modules.DOM.createElement('ul', {
		on : {
			init : function(){
				var self = this;
				renderChildren(self, $scope.cntr);
				
				$scope.$watch('cntr', function(newValue, oldValue){
					clearChildren(self);
					renderChildren(self, newValue);
				});
			}
		}
	});
	
	// ----
	
	$scope.$register('cntr', 3);
	
	modules.DOM.onReady(function(){
		document.body.appendChild(list);
		
		setTimeout(function(){
			$scope.cntr = 10;
		}, 1000);
		
		setTimeout(function(){
			$scope.cntr = 5;
		}, 2000);
	});
	*/
	
	// -----------------
	
	function appendArray(a, b){
		var sum = a.splice(0);
		Array.prototype.push.apply(sum, b);
		return sum;
	}
	
	function getter(s){
		var sSize = s.length;
		var tmp = s[0];
		if(sSize > 1){
			for(var i = 1; i < sSize; i++){
				tmp = tmp[s[i]];
			}
		}
		return tmp;
	}
	
	// complex value for scope variable
	$scope.$register('valami', [{a : 12}, {a : 15}, {a : 18}]);
	
	// bind it to a local variable
	var outerScope = [$scope, 'valami'];
	
	// watch for scope
	outerScope[0].$watch(outerScope[1], function(newValue, oldValue){
		if(newValue === oldValue){
			return ;
		}
		// query some stuff through the scope
		(function(scope){
			console.info('values from scope:', scope[0].a, scope[1].a, scope[2].a);
		})(getter(outerScope));
	});
	
	// assign inner scope
	var innerScope = appendArray(outerScope, [0]);
	
	// watch for innerScope
	innerScope[0].$watch(innerScope[1], function(newValue, oldValue){
		if(newValue === oldValue){
			return ;
		}
		// query some stuff through the scope
		(function(scope){
			console.info('values from innerScope:', scope.a);
		})(getter(innerScope));
	});
	
	// change the scope variable
	setTimeout(function(){
		var tmp = modules.Utils.clone($scope.valami);
		tmp[0].a = 1;
		tmp[1].a = 2;
		tmp[2].a = 3;
		$scope.valami = tmp;
	}, 1000);
	
	/*
	$scope.$register('alma', {a : 12});
	
	var scope = Object.getOwnPropertyDescriptor($scope, 'alma')
	
	console.log(scope.get());
	*/
	
	/*
	var tmp = $scope.alma;
	tmp.a = 14;
	$scope.alma = tmp;
	
	console.log(scope);
	*/
	
	/*
	console.log('value: ', $scope.alma.a);
	console.log('typeof value: ', typeof $scope.alma.a);
	console.log('gopd: ', Object.getOwnPropertyDescriptor($scope.alma, 'a'));
	console.log('typeof gopd: ', typeof Object.getOwnPropertyDescriptor($scope.alma, 'a'));
	console.log('gopd.get: ', Object.getOwnPropertyDescriptor($scope.alma, 'a').get);
	console.log('typeof gopd.get', typeof Object.getOwnPropertyDescriptor($scope.alma, 'a').get);
	*/
	
	/*
	console.log($scope.alma.alma);
	
	console.log(Object.getOwnPropertyDescriptor.apply(undefined, [$scope.alma, 'alma']));
	console.log(Object.getOwnPropertyDescriptor.apply(undefined, [$scope.alma, 'alma']).get.name);
	*/
	
	/*
	var test = modules.DOM.createElement('div', {
		$scope : $scope,
		text : function(scope){
			return [scope, 'alma'];
		}
	});
	modules.DOM.onReady(function(){
		document.body.appendChild(test);
		
		setTimeout(function(){
			$scope.alma = 15;
		}, 1000);
	});
	*/
	
	// -----------------
	
	/*
	modules.DOM.loadJSON('presets.json').then(function(data){
		console.log(data);
	});
	*/
})(window.modules);