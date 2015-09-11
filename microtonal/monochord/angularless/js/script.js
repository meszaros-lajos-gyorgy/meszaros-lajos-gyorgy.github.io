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
})();

// var rawImportData = '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]';

// ? how to do the UI ?
// we have: DataModel.$scope
// hook onto all future elements, which have data-model attribute

/*
window.onload = function(){
	// http://stackoverflow.com/a/3219767
	// http://stackoverflow.com/a/14570614
	document.querySelectorAll('[data-model]')
};
*/