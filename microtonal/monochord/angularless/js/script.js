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
		DataModel.updatePreset(data);
	});
	
	// DataModel.addPreset([3,2], 50);
})();