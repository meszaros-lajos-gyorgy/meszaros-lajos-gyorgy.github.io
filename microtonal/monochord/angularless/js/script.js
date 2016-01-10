// requires:
//   modules.AudioModel
//   modules.Math
//   modules.Scope
//   modules.UI

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
	
	var lastStringId = 0;
	var lastSetId = 0;
	var lowestHarmonic = 1;
	var highestHarmonic = 5000;
	
	$scope.$register('baseVolume', 10);
	$scope.$register('baseFrequency', 50);
	
	$scope.sets = [];
	
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
	
	// -----
	
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