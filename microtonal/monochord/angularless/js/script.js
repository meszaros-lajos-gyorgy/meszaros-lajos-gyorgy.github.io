(function(){
	'use strict';
	
	function loadJSON(URL, callBack){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				try{
					callBack(JSON.parse(xhr.responseText));
				}catch(e){}
			}
		}
		xhr.open('GET', URL, true);
		xhr.send();
	}
	
	// -------------------
	
	if(!AudioModel.supported){
		alert('Web Audio API is not supported by this browser.\nTo see, which browsers support the Web Audio API, visit: http://caniuse.com/#feat=audio-api');
		return ;
	}
	
	loadJSON('../presets.json', function(data){
		DataModel.updatePresets(data);
	});
	
	Binder.bindScope(DataModel.$scope);
	var ui = UI.get(DataModel.$scope);
	
	// ng-click
	[].slice.call(ui.querySelectorAll('button.import')).forEach(function(button){
		button.addEventListener('click', function(){
			try{
				DataModel._import(DataModel.$scope.rawImportData);
			}catch(e){
				alert(e.message)
			}
		})
	});
	
	// ng-show
	DataModel.$scope.$watch('presets', function(e){
		[].slice.call(ui.querySelectorAll('section.presetSelector')).forEach(function(element){
			element.classList[e.newValue.tunings ? 'remove' : 'add']('hidden');
		});
	});
	if(!DataModel.$scope.presets.tunings){
		[].slice.call(ui.querySelectorAll('section.presetSelector')).forEach(function(element){
			element.classList.add('hidden');
		});
	}
	
	document.addEventListener('readystatechange', function(){
		if(document.readyState === 'complete'){
			document.body.appendChild(ui);
		}
	});
	
	DataModel.$scope.register('rawImportData', '[{"id":3,"normalize":{"type":"off","subject":0,"target":0},"volume":100,"strings":[{"id":6,"multiplier":4,"volume":"25"},{"id":7,"multiplier":5,"volume":"50"},{"id":8,"multiplier":"6","volume":"50"}]},{"id":5,"normalize":{"type":"manual","subject":9,"target":7},"volume":100,"strings":[{"id":9,"multiplier":21,"volume":"0"},{"id":10,"multiplier":25,"volume":"50"}]}]')
})();