// requires:
//   modules.AudioModel
//   modules.Math
//   modules.Scope
//   modules.UI

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
	
	// --------------
	
	modules.AudioModel.setMainVolume($scope.baseVolume / 100);
	modules.AudioModel.updateReal();
	
	$scope.$watch('baseVolume', function(e){
		modules.AudioModel.setMainVolume(e.detail.newValue / 100);
		modules.AudioModel.updateReal();
	});
	
	// -----
	
	modules.AudioModel.addSet(1, {
		volume : 1
	});
	modules.AudioModel.addString(1, 1, {
		frequency : $scope.baseFrequency,
		type : 'sine',
		volume : 1
	});
	modules.AudioModel.updateReal();
	
	$scope.$watch('baseFrequency', function(e){
		modules.AudioModel.setString(1, {
			frequency : e.detail.newValue
		});
		modules.AudioModel.updateReal();
	})
	
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