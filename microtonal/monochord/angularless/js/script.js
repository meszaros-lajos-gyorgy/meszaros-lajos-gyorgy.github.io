// requires:
//   modules.AudioModel
//   modules.Math
//   modules.Scope
//   modules.UI

(function(modules){
	'use strict';
	
	var $scope = new modules.Scope();
	$scope.$register('mainVolume', 10);
	
	modules.AudioModel.setMainVolume($scope.mainVolume / 100);
	modules.AudioModel.updateReal();
	$scope.$watch('mainVolume', function(e){
		modules.AudioModel.setMainVolume(e.newValue / 100);
		modules.AudioModel.updateReal();
	});
	
	var em = modules.UI.createElement('em', {
		data : {
			model : [$scope, 'mainVolume']
		}
	});
	
	var range = modules.UI.createElement('input', {
		type : 'range',
		min : 0,
		max : 100,
		data : {
			model : [$scope, 'mainVolume']
		}
	});
	
	var textField = modules.UI.createElement('input', {
		type : 'text',
		data : {
			model : [$scope, 'mainVolume']
		}
	});
	
	modules.UI.onDOMReady(function(){
		document.body.appendChild(range);
		document.body.appendChild(textField);
		document.body.appendChild(em);
		
		modules.AudioModel.addSet(1, {
			volume : 1
		});
		modules.AudioModel.addString(1, 1, {
			volume : 1,
			type : 'triangle',
			frequency : 440
		});
		modules.AudioModel.addString(2, 1, {
			volume : 1,
			type : 'sine',
			frequency : 330
		});
		modules.AudioModel.updateReal();
	});
})(window.modules);