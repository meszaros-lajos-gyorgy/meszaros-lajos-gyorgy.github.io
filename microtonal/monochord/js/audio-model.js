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
		var mainGain = ctx.createGain();
		mainGain.connect(ctx.destination);
		mainGain.gain.value = 1;
		
		var real = {
			oscillators : {},
			stringGains : {},
			setGains : {}
		};
		
		var virtual = {
			oscillators : {},
			stringGains : {},
			setGains : {}
		};
		
		var summarizeVirtual = function(){
			var parsedVirtual = {
				oscillators : {},
				stringGains : {},
				setGains : {}
			};
			
			Object.keys(virtual.setGains).forEach(function(gSetId){
				if(virtual.setGains[gSetId].gain.value <= 0){
					return ;
				}
				Object.keys(virtual.stringGains).forEach(function(gStringId){
					if(virtual.stringGains[gStringId].connectTo !== gSetId || virtual.stringGains[gStringId].gain.value <= 0){
						return ;
					}
					Object.keys(virtual.oscillators).forEach(function(oStringId){
						if(virtual.oscillators[oStringId].connectTo !== gStringId || virtual.oscillators[oStringId].frequency.value < 0){
							return ;
						}
						
						parsedVirtual.oscillators[oStringId] = virtual.oscillators[oStringId];
						parsedVirtual.stringGains[gStringId] = virtual.stringGains[gStringId];
						parsedVirtual.setGains[gSetId] = virtual.setGains[gSetId];
					});
				});
			});
			
			return parsedVirtual;
		};
		var diffReal = function(parsedVirtual){
			var diff = {
				added : {},
				changed : {},
				removed : {}
			};
			
			
			
			return diff;
		};
		var applyDiff = function(diff){
			
		};
		var updateReal = function(){
			var parsedVirtual = summarizeVirtual();
			var diff = diffReal(parsedVirtual);
			
			// applyDiff(diff);
		};
		
		AudioModel = {
			supported : true,
			setMainVolume : function(volume){
				mainGain.gain.value = volume / 100;
			},
			setString : function(stringId, config){
				if(virtual.oscillators[stringId]){
					if(config.hasOwnProperty('frequency')){
						virtual.oscillators[stringId].frequency.value = config.frequency;
					}
					if(config.hasOwnProperty('type')){
						virtual.oscillators[stringId].type = config.type;
					}
				}
				if(virtual.stringGains[stringId] && config.hasOwnProperty('volume')){
					virtual.stringGains[stringId].gain.value = config.volume;
				}
				updateReal();
			},
			setSet : function(setId, config){
				if(virtual.setGains[setId] && config.hasOwnProperty('volume')){
					virtual.setGains[setId].gain.value = config.volume;
				}
				updateReal();
			},
			addString : function(stringId, setId, config){
				virtual.stringGains[stringId] = {
					gain : {
						value : (config.hasOwnProperty('volume') ? config.volume : 1)
					},
					connectTo : setId + ''
				};
				virtual.oscillators[stringId] = {
					type : (config.hasOwnProperty('type') ? config.type : 'sine'),
					frequency : {
						value : (config.hasOwnProperty('frequency') ? config.frequency : 0)
					},
					connectTo : stringId + ''
				};
				updateReal();
			},
			addSet : function(setId, config){
				virtual.setGains[setId] = {
					gain : {
						value : (config.hasOwnProperty('volume') ? config.volume : 1)
					}
				};
				updateReal();
			},
			removeString : function(stringId){
				delete virtual.oscillators[stringId];
				delete virtual.stringGains[stringId];
				updateReal();
			},
			removeSet : function(setId){
				delete virtual.setGains[setId];
				updateReal();
			},
			stopAll : function(){
				Object.keys(real.oscillators).forEach(function(key){
					real.oscillators[key].stop(0);
					real.oscillators[key].disconnect();
				});
				Object.keys(stringGains).forEach(function(key){
					real.stringGains[key].disconnect();
				});
				Object.keys(setGains).forEach(function(key){
					real.setGains[key].disconnect();
				});
				
				real = {
					oscillators : {},
					stringGains : {},
					setGains : {}
				}
				virtual = {
					oscillators : {},
					stringGains : {},
					setGains : {}
				}
			}
		};
		
		/*
		AudioModel = {
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
			}
		};
		*/
	}else{
		AudioModel = {
			supported : false
		};
	}
	
	angular
		.module('AudioModel', [])
		.factory('audio', function(){
			return AudioModel;
		})
	;
})();