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
		var correctGains = function(diff){
			var correctedDiff = JSON.parse(JSON.stringify(diff));
			
			var totalSetGain = 0;
			var setGainLimit = 1;
			
			Object.keys(diff.added.setGains).forEach(function(gSetId){
				totalSetGain += diff.added.setGains[gSetId].gain.value;
			});
			Object.keys(diff.changed.setGains).forEach(function(gSetId){
				totalSetGain += diff.changed.setGains[gSetId].gain.value;
			});
			
			if(totalSetGain > setGainLimit){
				Object.keys(diff.added.setGains).forEach(function(gSetId){
					diff.added.setGains[gSetId].gain.value *= (setGainLimit / totalSetGain);
				});
				Object.keys(diff.changed.setGains).forEach(function(gSetId){
					diff.changed.setGains[gSetId].gain.value *= (setGainLimit / totalSetGain);
				});
			}
			
			var totalStringGains = {}; // we have to calculate them for every set
			var stringsPerSet = {};
			var stringGainLimiter = 1;
			
			Object.keys(diff.added.stringGains).forEach(function(gStringId){
				var setId = diff.added.stringGains[gStringId].connectTo;
				if(!totalStringGains[setId]){
					totalStringGains[setId] = 0;
				}
				if(!stringsPerSet[setId]){
					stringsPerSet[setId] = 0;
				}
				totalStringGains[setId] += diff.added.stringGains[gStringId].gain.value;
				stringsPerSet[setId]++;
			});
			Object.keys(diff.changed.stringGains).forEach(function(gStringId){
				var setId = diff.changed.stringGains[gStringId].connectTo;
				if(!totalStringGains[setId]){
					totalStringGains[setId] = 0;
				}
				if(!stringsPerSet[setId]){
					stringsPerSet[setId] = 0;
				}
				totalStringGains[setId] += diff.changed.stringGains[gStringId].gain.value;
				stringsPerSet[setId]++;
			});
			
			Object.keys(stringsPerSet).forEach(function(setId){
				stringsPerSet[setId]
				totalStringGains[setId]
				
				
				Object.keys(diff.added.stringGains).forEach(function(gStringId){
					var setId = diff.added.stringGains[gStringId].connectTo;
					
				});
				Object.keys(diff.changed.stringGains).forEach(function(gStringId){
					var setId = diff.changed.stringGains[gStringId].connectTo;
					
				});
			});
			
			/*
			if(totalStringGain > stringGainLimiter){
				Object.keys(diff.added.stringGains).forEach(function(gStringId){
					diff.added.stringGains[gStringId].gain.value *= (stringGainLimiter / totalStringGain);
				});
				Object.keys(diff.changed.stringGains).forEach(function(gStringId){
					diff.changed.stringGains[gStringId].gain.value *= (stringGainLimiter / totalStringGain);
				});
			}
			*/
			
			return correctedDiff;
		};
		var applyDiff = function(diff){
			Object.keys(diff.added.setGains).forEach(function(gSetId){
				var g = ctx.createGain();
				g.connect(mainGain);
				g.gain.value = diff.added.setGains[gSetId].gain.value;
				
				real.setGains[gSetId] = g;
			});
			Object.keys(diff.added.stringGains).forEach(function(gStringId){
				var current = diff.added.stringGains[gStringId];
				
				var g = ctx.createGain();
				g.connect(real.setGains[current.connectTo]);
				g.gain.value = current.gain.value;
				
				real.stringGains[gStringId] = g;
			});
			Object.keys(diff.added.oscillators).forEach(function(oStringId){
				var current = diff.added.oscillators[oStringId];
				
				var o = ctx.createOscillator();
				o.type = current.type;
				o.frequency.value = current.frequency.value;
				o.connect(real.stringGains[current.connectTo]);
				o.start(0);
				
				real.oscillators[oStringId] = o;
			});
			
			Object.keys(diff.changed.setGains).forEach(function(gSetId){
				if(real.setGains[gSetId]){
					real.setGains[gSetId].gain.value = diff.changed.setGains[gSetId].gain.value;
				}
			});
			Object.keys(diff.changed.stringGains).forEach(function(gStringId){
				if(real.stringGains[gStringId]){
					real.stringGains[gStringId].gain.value = diff.changed.stringGains[gStringId].gain.value;
				}
			});
			Object.keys(diff.changed.oscillators).forEach(function(oStringId){
				if(real.oscillators[oStringId]){
					var current = diff.changed.oscillators[oStringId];
					
					real.oscillators[oStringId].frequency.value = current.frequency.value;
					real.oscillators[oStringId].type = current.type;
				}
			});
			
			Object.keys(diff.removed.setGains).forEach(function(gSetId){
				real.setGains[gSetId].disconnect();
				delete real.setGains[gSetId];
			});
			Object.keys(diff.removed.oscillators).forEach(function(oStringId){
				real.oscillators[oStringId].stop(0);
				real.oscillators[oStringId].disconnect();
				delete real.oscillators[oStringId];
			});
			Object.keys(diff.removed.stringGains).forEach(function(gStringId){
				real.stringGains[gStringId].disconnect();
				delete real.stringGains[gStringId];
			});
		};
		var updateReal = function(){
			var parsedVirtual = summarizeVirtual();
			var diff = diffReal(parsedVirtual);
			var correctedDiff = correctGains(diff);
			applyDiff(correctedDiff);
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