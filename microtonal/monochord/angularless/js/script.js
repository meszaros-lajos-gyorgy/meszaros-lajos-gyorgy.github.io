(function(){
	'use strict';
	
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
	
	// -------------------
	
	if(!AudioModel.supported){
		alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
		return ;
	}
	
	loadPresets(function(data){
		DataModel.updatePreset(data);
	});
	
	Binder.bindScope(DataModel.$scope);
	var ui = UI.get(DataModel.$scope);
	Binder.initValues(ui);
	
	document.addEventListener('readystatechange', function(){
		if(document.readyState === 'complete'){
			document.body.appendChild(ui);
		}
	});
})();

// var rawImportData = '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]';