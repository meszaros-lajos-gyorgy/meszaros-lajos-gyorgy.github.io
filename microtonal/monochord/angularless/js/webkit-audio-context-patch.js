// Code based on: https://github.com/cwilso/webkitAudioContext-MonkeyPatch
// and: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext

(function(){
	'use strict';
	
	if(!window.hasOwnProperty('AudioContext') && window.hasOwnProperty('webkitAudioContext')){
		var a = window.AudioContext = window.webkitAudioContext;
		
		if(!a.prototype.hasOwnProperty('createGain')){
			a.prototype.createGain = a.prototype.createGainNode;
		}
		
		if(!OscillatorNode.prototype.hasOwnProperty('start')){
			OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
		}
		// make the first parameter optional for firefox <30
		var oldStart = OscillatorNode.prototype.start;
		OscillatorNode.prototype.start = function(t){
			oldStart(t || 0);
		};
		
		if(!OscillatorNode.prototype.hasOwnProperty('stop')){
			OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;
		}
		// make the first parameter optional for firefox <30
		var oldStop = OscillatorNode.prototype.stop;
		OscillatorNode.prototype.stop = function(t){
			oldStop(t || 0);
		};
		
		Object.defineProperty(OscillatorNode.prototype, 'type', {
			get : function(){
				return ['sine', 'square', 'sawtooth', 'triangle', 'custom'][this.type];
			},
			set : function(type){
				this.type = OscillatorNode.prototype[type.toUpperCase()];
			}
		});
	}
})();