// modules.AudioModel
// modules.Math
// modules.UI

(function(modules){
	'use strict';
	
	modules.AudioModel.addSet(1, {
		volume : 1
	});
	modules.AudioModel.addString(1, 1, {
		volume : 1,
		type : 'sine',
		frequency : 440
	});
	modules.AudioModel.addString(2, 1, {
		volume : 1,
		type : 'sine',
		frequency : 330
	});
	modules.AudioModel.setMainVolume(0.1);
	modules.AudioModel.updateReal();
	
	// ----------
	
	var createElement = function(tagName, attributes, children){
		var element = document.createElement(tagName);
		
		for(var name in attributes){
			var value = attributes[name];
			switch(name){
				case 'class' :
					element.className = value;
					break;
				case 'html' :
					element.innerHTML = value;
					break;
				case 'text' :
					element.textContent = value;
					break;
				case 'data' :
					for(var attr in value){
						element.setAttribute('data-' + attr, value[attr]);
					}
					break;
				case 'on' :
					for(var event in value){
						element.addEventListener(event, value[event]);
					}
					break;
				default :
					element.setAttribute(name, value + '');
			}
		}
		
		if(children.push){
			for(var i = 0; i < children.length; i++){
				element.appendChild(children);
			}
		}
		
		return element;
	};
	
	var onReady = function(handler){
		var isValidReadyState = function(){
			return (document.readyState === 'interactive' || document.readyState === 'complete');
		};
		
		if(isValidReadyState()){
			handler();
		}else{
			var rsHandler = function(){
				document.removeEventListener('readystatechange', rsHandler);
				
				if(isValidReadyState()){
					handler();
				}
			};
			document.addEventListener('readystatechange', rsHandler);
		}
	};
	
	// ----------
	
	var mainVolume = 10;
	
	var getMainVolume = function(){
		return mainVolume;
	};
	var setMainVolume = function(newValue){
		if(newValue === mainVolume){
			return;
		}
		
		mainVolume = newValue;
		
		modules.AudioModel.setMainVolume(mainVolume / 100);
		modules.AudioModel.updateReal();
	};
	
	onready(function(){
		document.body.appendChild(createElement('input', {
			type : 'range',
			min : 0,
			max : 100,
			value : getMainVolume(),
			on : {
				input : function(){
					setMainVolume(this.value);
				}
			}
		}));
	});
})(window.modules);