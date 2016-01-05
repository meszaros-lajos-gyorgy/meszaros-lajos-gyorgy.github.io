// modules.AudioModel
// modules.Math
// modules.UI

(function(modules){
	'use strict';
	
	/*
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
		
		if(attributes){
			for(var name in attributes){
				var value = attributes[name];
				switch(name){
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
		}
		
		if(children && children.push){
			for(var i = 0; i < children.length; i++){
				if(typeof child === 'string'){
					child = document.createTextNode(child);
				}
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
	
	onReady(function(){
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
	*/
	
	// ----------
	
	var Reactor = function(options) {
		var target = document.createTextNode(null);
		
		this.addEventListener    = target.addEventListener.bind(target);
		this.removeEventListener = target.removeEventListener.bind(target);
		this.dispatchEvent       = target.dispatchEvent.bind(target);
	}
	
	var reactor = new Reactor();
	
	reactor.addEventListener('event1', function(){
		console.log('event #1 being called');
	});
	reactor.addEventListener('event2', function(){
		console.log('event #2 being called');
	})
	
	reactor.dispatchEvent(new Event('event1'));
	reactor.dispatchEvent(new Event('event2'));
})(window.modules);