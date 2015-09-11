(function(){
	'use strict';
	
	var supported = true;
	
	try{
		var ctx = new AudioContext();
	}catch(e){
		supported = false;
	}
	
	var AudioModel;
	
	if(supported){
		var oscillators = {};
		var stringGains = {};
		var setGains = {};
		
		var mainGain = ctx.createGain();
		mainGain.connect(ctx.destination);
		mainGain.gain.value = 1;
		
		AudioModel = {
			supported : true,
			setString : function(stringId, config){
				if(oscillators[stringId]){
					if(config.hasOwnProperty('frequency')){
						oscillators[stringId].frequency.value = config.frequency;
					}
					if(config.hasOwnProperty('type')){
						oscillators[stringId].type = config.type; // todo: implement custom type
					}
				}
				if(stringGains[stringId] && config.hasOwnProperty('volume')){
					stringGains[stringId].gain.value = config.volume;
				}
			},
			setSet : function(setId, config){
				if(setGains[setId] && config.hasOwnProperty('volume')){
					setGains[setId].gain.value = config.volume;
				}
			},
			addString : function(stringId, setId, config){
				var g = ctx.createGain();
				g.connect(setGains[setId]);
				g.gain.value = (config.hasOwnProperty('volume') ? config.volume : 1);
				var o = ctx.createOscillator();
				o.type = 'sine';
				if(config.hasOwnProperty('frequency')){
					o.frequency.value = config.frequency;
				}
				o.connect(g);
				o.start(0);
				
				stringGains[stringId] = g;
				oscillators[stringId] = o;
			},
			addSet : function(setId, config){
				var g = ctx.createGain();
				g.connect(mainGain);
				g.gain.value = (config.hasOwnProperty('volume') ? config.volume : 1);
				
				setGains[setId] = g;
			},
			removeString : function(stringId){
				oscillators[stringId].stop(0);
				oscillators[stringId].disconnect();
				delete oscillators[stringId];
				stringGains[stringId].disconnect();
				delete stringGains[stringId];
			},
			removeSet : function(setId){
				setGains[setId].disconnect();
				delete setGains[setId];
			},
			stopAll : function(){
				Object.keys(oscillators).forEach(function(key){
					oscillators[key].stop(0);
					oscillators[key].disconnect();
				});
				Object.keys(stringGains).forEach(function(key){
					stringGains[key].disconnect();
				});
				Object.keys(setGains).forEach(function(key){
					setGains[key].disconnect();
				});
				
				oscillators = {};
				stringGains = {};
				setGains = {};
			}
		};
	}else{
		AudioModel = {
			supported : false
		};
	}
	
	window.AudioModel = AudioModel;
})();