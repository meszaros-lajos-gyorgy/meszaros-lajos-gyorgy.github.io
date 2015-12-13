(function(){
	'use strict';
	
	var supported = true;
	
	try{
		var ctx = new AudioContext();
	}catch(e){
		supported = false;
	}
	
	function clone(obj){
		return JSON.parse(JSON.stringify(obj));
	}
	
	var AudioModel;
	
	if(supported){
		var real = {
			oscillators : {},
			gains : {}
		};
		
		var virtual = {
			oscillators : {},
			stringGains : {},
			setGains : {},
			mainGain : {
				gain : {
					value : 1
				}
			}
		};
		
		var summarizeVirtual = function(virtual){
			var parsedVirtual = {
				oscillators : {},
				stringGains : {},
				setGains : {},
				mainGain : {
					gain : {
						value : 0
					}
				}
			};
			
			if(virtual.mainGain.gain.value > 0){
				parsedVirtual.mainGain.gain.value = virtual.mainGain.gain.value;
				var setIds = Object.keys(virtual.setGains);
				var gStringIds = Object.keys(virtual.stringGains);
				var oStringIds = Object.keys(virtual.oscillators)
				var i = setIds.length, j, k;
				while(i--){
					var gSetId = setIds[i];
					// skip, if set is muted
					if(virtual.setGains[gSetId].gain.value <= 0){
						continue;
					}
					j = gStringIds.length;
					while(j--){
						var gStringId = gStringIds[j];
						// skip, if string is not connected to current set or muted
						if(virtual.stringGains[gStringId].connectTo !== gSetId || virtual.stringGains[gStringId].gain.value <= 0){
							continue;
						}
						k = oStringIds.length;
						while(k--){
							var oStringId = oStringIds[k];
							// if string oscillator is connected to current string gain, and has valid frequency, then record it and we're done
							if(virtual.oscillators[oStringId].connectTo === gStringId && virtual.oscillators[oStringId].frequency.value > 0){
								parsedVirtual.oscillators[oStringId] = clone(virtual.oscillators[oStringId]);
								parsedVirtual.stringGains[gStringId] = clone(virtual.stringGains[gStringId]);
								parsedVirtual.setGains[gSetId] = clone(virtual.setGains[gSetId]);
								break;
							}
						}
					}
				}
			}
			
			return parsedVirtual;
		};
		var correctGains = function(parsedVirtual){
			var correctedVirtual = parsedVirtual;
			
			// correct set gains
			
			var totalSetGain = 0;
			var setGainLimit = 1;
			var i,j;
			
			var setIds = Object.keys(correctedVirtual.setGains);
			i = setIds.length;
			while(i--){
				totalSetGain += correctedVirtual.setGains[setIds[i]].gain.value;
			}
			
			if(totalSetGain > setGainLimit){
				i = setIds.length;
				while(i--){
					correctedVirtual.setGains[setIds[i]].gain.value *= (setGainLimit / totalSetGain);
				}
			}
			
			// correct string gains per set to result in sum(string gains) = 1 per set
			
			var totalStringGains = {};
			var stringGainLimit = 1;
			
			var stringIds = Object.keys(correctedVirtual.stringGains);
			i = stringIds.length;
			while(i--){
				var setId = correctedVirtual.stringGains[stringIds[i]].connectTo;
				totalStringGains[setId] = (totalStringGains[setId] ? totalStringGains[setId] : 0) + correctedVirtual.stringGains[stringIds[i]].gain.value;
			}
			
			var setIds = Object.keys(totalStringGains);
			j = setIds.length;
			while(j--){
				var setId = setIds[j];
				if(totalStringGains[setId] > stringGainLimit){
					i = stringIds.length;
					while(i--){
						if(correctedVirtual.stringGains[stringIds[i]].connectTo === setId){
							correctedVirtual.stringGains[stringIds[i]].gain.value *= (stringGainLimit / totalStringGains[setId]);
						}
					}
				}
			}
			
			// apply set gains and main gain to string gains
			
			correctedVirtual.gains = {};
			
			Object.keys(correctedVirtual.stringGains).forEach(function(stringId){
				var setId = correctedVirtual.stringGains[stringId].connectTo;
				delete correctedVirtual.oscillators[stringId].connectTo;
				correctedVirtual.gains[stringId] = {
					gain : {
						value :
							correctedVirtual.stringGains[stringId].gain.value
							* correctedVirtual.setGains[setId].gain.value
							* correctedVirtual.mainGain.gain.value
					}
				};
			});
			
			delete correctedVirtual.stringGains;
			delete correctedVirtual.setGains;
			delete correctedVirtual.mainGain;
			
			// collapse gains and oscillators
			
			Object.keys(correctedVirtual.oscillators).forEach(function(stringId, index, array){
				if(index > 0){
					for(var i = 0; i < index; i++){
						if(
							correctedVirtual.oscillators[array[i]] // <- we might have deleted it already
							&& correctedVirtual.oscillators[array[i]].frequency.value === correctedVirtual.oscillators[stringId].frequency.value
							&& correctedVirtual.oscillators[array[i]].type === correctedVirtual.oscillators[stringId].type
						){
							correctedVirtual.gains[array[i]].gain.value += correctedVirtual.gains[stringId].gain.value;
							delete correctedVirtual.gains[stringId];
							delete correctedVirtual.oscillators[stringId];
							break;
						}
					}
				}
			});
			
			return correctedVirtual;
		};
		var diffReal = function(parsedVirtual){
			var diff = {
				added : {
					oscillators : {},
					gains : {}
				},
				changed : {
					oscillators : {},
					gains : {}
				},
				removed : {
					oscillators : {},
					gains : {}
				}
			};
			
			var stringIds = Object.keys(parsedVirtual.oscillators);
			var i = stringIds.length;
			var stringId;
			while(i--){
				stringId = stringIds[i];
				diff[real.oscillators[stringId] ? 'changed' : 'added'].oscillators[stringId] = parsedVirtual.oscillators[stringId];
			}
			
			stringIds = Object.keys(parsedVirtual.gains);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				diff[real.gains[stringId] ? 'changed' : 'added'].gains[stringId] = parsedVirtual.gains[stringId];
			}
			
			stringIds = Object.keys(real.oscillators);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				if(!parsedVirtual.oscillators[stringId]){
					diff.removed.oscillators[stringId] = real.oscillators[stringId];
				}
			}
			
			stringIds = Object.keys(real.gains);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				if(!parsedVirtual.gains[stringId]){
					diff.removed.gains[stringId] = real.gains[stringId];
				}
			}
			
			return diff;
		};
		var applyDiff = function(diff){
			var stringIds = Object.keys(diff.added.gains);
			var i = stringIds.length;
			var stringId, current;
			while(i--){
				stringId = stringIds[i];
				current = diff.added.gains[stringId];
				
				var g = ctx.createGain();
				g.connect(ctx.destination);
				g.gain.value = current.gain.value;
				
				real.gains[stringId] = g;
			}
			
			stringIds = Object.keys(diff.added.oscillators);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				current = diff.added.oscillators[stringId];
				
				var o = ctx.createOscillator();
				o.type = current.type;
				o.frequency.value = current.frequency.value;
				o.connect(real.gains[stringId]);
				o.start(0);
				
				real.oscillators[stringId] = o;
			}
			
			stringIds = Object.keys(diff.changed.gains);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				if(real.gains[stringId]){
					real.gains[stringId].gain.value = diff.changed.gains[stringId].gain.value;
				}
			}
			
			stringIds = Object.keys(diff.changed.oscillators);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				if(real.oscillators[stringId]){
					current = diff.changed.oscillators[stringId];
					
					real.oscillators[stringId].frequency.value = current.frequency.value;
					real.oscillators[stringId].type = current.type;
				}
			}
			
			stringIds = Object.keys(diff.removed.oscillators);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				real.oscillators[stringId].stop(0);
				real.oscillators[stringId].disconnect();
				delete real.oscillators[stringId];
			}
			
			stringIds = Object.keys(diff.removed.gains);
			i = stringIds.length;
			while(i--){
				stringId = stringIds[i];
				real.gains[stringId].disconnect();
				delete real.gains[stringId];
			}
		};
		var updateReal = function(){
			var parsedVirtual = summarizeVirtual(virtual);
			var correctedVirtual = correctGains(parsedVirtual);
			var diff = diffReal(correctedVirtual);
			applyDiff(diff);
		};
		
		AudioModel = {
			supported : true,
			setMainVolume : function(volume){
				virtual.mainGain.gain.value = volume / 100;
				updateReal();
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
				Object.keys(gains).forEach(function(key){
					real.gains[key].disconnect();
				});
				real = {
					oscillators : {},
					gains : {}
				}
				virtual.oscillators = {};
				virtual.stringGains = {};
				virtual.setGains = {};
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