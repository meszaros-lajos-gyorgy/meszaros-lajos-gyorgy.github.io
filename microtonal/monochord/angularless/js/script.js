/*
(function(){
	'use strict';
	
	if(!AudioModel.supported){
		alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
		return ;
	}
	
	function loadPresets(callBack){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				try{
					callBack(JSON.parse(xhr.responseText));
				}catch(e){}
			}
		}
		xhr.open('GET', '../presets.json', true);
		xhr.send();
	}
	
	loadPresets(function(data){
		dataModel.updatePreset(data);
	});
})();
*/

var $scope = new MicroScope();

$scope.register('baseFrequency', 100);

$scope.watch('baseFrequency', function(e){
	console.log('newValue: ', e.newValue, ' | oldValue: ', e.oldValue);
});

$scope.baseFrequency = 100;
$scope.baseFrequency = 102;