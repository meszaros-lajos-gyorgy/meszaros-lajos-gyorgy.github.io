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
				added : {
					oscillators : {},
					stringGains : {},
					setGains : {}
				},
				changed : {
					oscillators : {},
					stringGains : {},
					setGains : {}
				},
				removed : {
					oscillators : {},
					stringGains : {},
					setGains : {}
				}
			};
			
			Object.keys(parsedVirtual.oscillators).forEach(function(oStringId){
				diff[real.oscillators[oStringId] ? 'changed' : 'added'].oscillators[oStringId] = parsedVirtual.oscillators[oStringId];
			});
			Object.keys(parsedVirtual.stringGains).forEach(function(gStringId){
				diff[real.stringGains[gStringId] ? 'changed' : 'added'].stringGains[gStringId] = parsedVirtual.stringGains[gStringId];
			});
			Object.keys(parsedVirtual.setGains).forEach(function(gSetId){
				diff[real.setGains[gSetId] ? 'changed' : 'added'].setGains[gSetId] = parsedVirtual.setGains[gSetId];
			});
			
			Object.keys(real.oscillators).forEach(function(oStringId){
				if(!parsedVirtual.oscillators[oStringId]){
					diff.removed.oscillators[oStringId] = real.oscillators[oStringId];
				}
			});
			Object.keys(real.stringGains).forEach(function(gStringId){
				if(!parsedVirtual.stringGains[gStringId]){
					diff.removed.stringGains[gStringId] = real.stringGains[gStringId];
				}
			});
			Object.keys(real.setGains).forEach(function(gSetId){
				if(!parsedVirtual.setGains[gSetId]){
					diff.removed.setGains[gSetId] = real.setGains[gSetId];
				}
			});
			
			return diff;
		};
		var applyDiff = function(diff){
			Object.keys(diff.added.setGains).forEach(function(gSetId){
				var g = ctx.createGain();
				g.connect(mainGain);
				g.gain.value = diff.added.setGains[gSetId].gain.value;
				
				real.setGains[gSetId] = g;
			});
			Object.keys(diff.added.stringGains).forEach(function(gStringId){
				var g = ctx.createGain();
				/*
				g.connect(setGains[setId]);
				g.gain.value = (config.hasOwnProperty('volume') ? config.volume : 1);
				
				stringGains[stringId] = g;
				*/
			});
			Object.keys(diff.added.oscillators).forEach(function(oStringId){
				var o = ctx.createOscillator();
				/*
				o.type = 'sine';
				if(config.hasOwnProperty('frequency')){
					o.frequency.value = config.frequency;
				}
				o.connect(stringGains[stringId]);
				o.start(0);
				
				oscillators[stringId] = o;
				*/
			});
			
			Object.keys(diff.changed.setGains).forEach(function(gSetId){
				/*
				if(setGains[setId] && config.hasOwnProperty('volume')){
					setGains[setId].gain.value = config.volume;
				}
				*/
			});
			Object.keys(diff.changed.stringGains).forEach(function(gStringId){
				/*
				if(stringGains[stringId] && config.hasOwnProperty('volume')){
					stringGains[stringId].gain.value = config.volume;
				}
				*/
			});
			Object.keys(diff.changed.oscillators).forEach(function(oStringId){
				/*
				if(oscillators[stringId]){
					if(config.hasOwnProperty('frequency')){
						oscillators[stringId].frequency.value = config.frequency;
					}
					if(config.hasOwnProperty('type')){
						oscillators[stringId].type = config.type; // todo: implement custom type
					}
				}
				*/
			});
			
			Object.keys(diff.removed.setGains).forEach(function(gSetId){
				/*
				setGains[setId].disconnect();
				delete setGains[setId];
				*/
			});
			Object.keys(diff.removed.oscillators).forEach(function(oStringId){
				/*
				oscillators[stringId].stop(0);
				oscillators[stringId].disconnect();
				delete oscillators[stringId];
				*/
			});
			Object.keys(diff.removed.stringGains).forEach(function(gStringId){
				/*
				stringGains[stringId].disconnect();
				delete stringGains[stringId];
				*/
			});
		};
		var updateReal = function(){
			var parsedVirtual = summarizeVirtual();
			var diff = diffReal(parsedVirtual);
			applyDiff(diff);
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