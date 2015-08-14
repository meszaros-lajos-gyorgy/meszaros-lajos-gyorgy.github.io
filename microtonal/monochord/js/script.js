function addFreq(ctx, oscillators, freq){
	var o = ctx.createOscillator();
	o.type = 'sine';
	o.frequency.value = freq;
	o.start();
	oscillators.push(o);
	return o;
}

function connectAll(oscillators, gain){
	oscillators.forEach(function(o){
		connect(o, gain);
	});
}

function connect(o, gain){
	o.connect(gain);
}

function disconnectAll(oscillators, gain){
	oscillators.forEach(function(o){
		o.disconnect(gain);
	});
}

function setVolume(gain, volume){
	gain.gain.value = volume;
}

// ---------

var ctx;
try {
	ctx = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
	alert('Web Audio API is not supported by this browser');
}

var mainGain = ctx.createGain();
mainGain.connect(ctx.destination);
setVolume(mainGain, 1);

var baseFreq = 100;
var oscillators = [];
var gains = [];

function changeVolume(id, value){
	setVolume(gains[id - 1], value / 100);
}

function changeFreq(id, value){
	oscillators[id - 1].frequency.value = baseFreq * value;
}

function onRangeChange(input){
	input.nextSibling.value = input.value;
	changeFreq(input.parentNode.getAttribute('data-id'), input.value);
}

function onRangeVolumeChange(input){
	changeVolume(input.parentNode.getAttribute('data-id'), input.value);
}

function onInputChange(input){
	input.previousSibling.value = input.value;
	changeFreq(input.parentNode.getAttribute('data-id'), input.value);
}

var prevs = {};

window.onload = function(){
	[].slice.call(document.querySelectorAll('input[type="range"]')).forEach(function(input){
		if(input.className === 'freq'){
			prevs['freq' + input.parentNode.getAttribute('data-id')] = input.value;
			prevs['freq2' + input.parentNode.getAttribute('data-id')] = input.value;
			input.addEventListener('input', function(){
				if(this.value !== prevs['freq' + this.parentNode.getAttribute('data-id')]){
					onRangeChange(this);
					prevs['freq' + this.parentNode.getAttribute('data-id')] = this.value;
				}
			});
			input.addEventListener('change', function(){
				if(this.value !== prevs['freq' + this.parentNode.getAttribute('data-id')]){
					onRangeChange(this);
					prevs['freq' + this.parentNode.getAttribute('data-id')] = this.value;
				}
			});
			
			input.nextSibling.addEventListener('change', function(){
				if(this.value !== prevs['freq2' + this.parentNode.getAttribute('data-id')]){
					onInputChange(this);
					prevs['freq2' + this.parentNode.getAttribute('data-id')] = this.value;
				}
			});
			input.nextSibling.addEventListener('input', function(){
				if(this.value !== prevs['freq2' + this.parentNode.getAttribute('data-id')]){
					onInputChange(this);
					prevs['freq2' + this.parentNode.getAttribute('data-id')] = this.value;
				}
			});
		}else if(input.className === 'volume'){
			prevs['volume' + input.parentNode.getAttribute('data-id')] = input.value;
			input.addEventListener('input', function(){
				if(this.value !== prevs['volume' + this.parentNode.getAttribute('data-id')]){
					onRangeVolumeChange(this);
					prevs['volume' + this.parentNode.getAttribute('data-id')] = this.value;
				}
			});
			input.addEventListener('change', function(){
				if(this.value !== prevs['volume' + this.parentNode.getAttribute('data-id')]){
					onRangeVolumeChange(this);
					prevs['volume' + this.parentNode.getAttribute('data-id')] = this.value;
				}
			});
		}
	});
	
	document.getElementById('basefreq').addEventListener('input', function(){
		if(this.value !== baseFreq){
			baseFreq = this.value;
			[].slice.call(document.querySelectorAll('input[type="range"].freq')).forEach(function(input){
				changeFreq(input.parentNode.getAttribute('data-id'), input.value);
			});
		}
	});
	document.getElementById('basefreq').addEventListener('change', function(){
		if(this.value !== baseFreq){
			baseFreq = this.value;
			[].slice.call(document.querySelectorAll('input[type="range"].freq')).forEach(function(input){
				changeFreq(input.parentNode.getAttribute('data-id'), input.value);
			});
		}
	});
	
	[].slice.call(document.querySelectorAll('div[data-id]')).forEach(function(div){
		var o = addFreq(ctx, oscillators, baseFreq * div.querySelector('input[type="range"].freq').value);
		var oGain = ctx.createGain();
		oGain.connect(mainGain);
		gains.push(oGain);
		setVolume(oGain, div.querySelector('input[type="range"].volume').value / 100);
		connect(o, oGain);
	});
};