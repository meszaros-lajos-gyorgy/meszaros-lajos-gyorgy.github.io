(function(){
	'use strict';
	
	function isValidReadyState(){
		return (document.readyState === 'interactive' || document.readyState === 'complete');
	}
	
	function onReady(handler){
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
	}
	
	var load = {
		_loads : {
			image : {},
			audio : {}
		},
		from : function(resources){
			var self = this;
			this._resources = resources;
			return this;
		},
		to : function(){
			return this._loads;
		},
		image : function(index){
			var src = 'resources/image/' + (!isNaN(index) ? this._resources.image[index] : index);
			var self = this;
			return new Promise(function(resolve, reject){
				var img = document.createElement('img');
				img.addEventListener('load', function(){
					self._loads.image[index] = this;
					resolve(src);
				});
				img.addEventListener('error', function(e){
					reject(new Error('Could not load image: "' + src + '"'));
				});
				img.src = src;
			});
		},
		audio : function(index){
			var src = 'resources/audio/' + (!isNaN(index) ? this._resources.audio[index] : index);
			var self = this;
			return new Promise(function(resolve, reject){
				var audio = document.createElement('audio');
				audio.addEventListener('canplaythrough', function(){
					self._loads.audio[index] = this;
					resolve(src);
				});
				audio.addEventListener('error', function(e){
					reject(new Error('could not load audio: "' + src + '"'));
				});
				audio.src = src;
				audio.controls = true;
				audio.load();
			});
		}
	};
	
	load.all = {
		_source : function(type){
			var sources = [];
			Object.keys(load._resources[type]).forEach(function(index){
				sources.push(load[type](index));
			});
			return Promise.all(sources);
		},
		image : function(){
			return this._source('image');
		},
		audio : function(){
			return this._source('audio');
		}
	};
	
	function setText(text){
		document.querySelector('p').innerHTML = text;
	}
	
	function bindControls(onPress, onRelease){
		var keyPressed = false;
		var pressed = 0;
		
		document.body.addEventListener('keydown', function(e){
			if(e.keyCode === SPACE && !keyPressed){
				keyPressed = true;
				if(pressed === 0){
					onPress();
				}
				pressed++;
			}
		});
		document.body.addEventListener('keyup', function(e){
			if(e.keyCode === SPACE && keyPressed){
				keyPressed = false;
				pressed--;
				if(pressed === 0){
					onRelease();
				}
			}
		});
		
		document.body.addEventListener('touchstart', function(e){
			e.preventDefault();
			if(pressed === 0){
				onPress();
			}
			pressed++;
		});
		document.body.addEventListener('touchend', function(){
			pressed--;
			if(pressed === 0){
				onRelease()
			}
		});
		document.body.addEventListener('mousedown', function(e){
			e.preventDefault();
			if(pressed === 0){
				onPress();
			}
			pressed++;
		});
		document.body.addEventListener('mouseup', function(){
			pressed--;
			if(pressed === 0){
				onRelease();
			}
		});
	}
	
	function show(what){
		document.querySelector('.photo').classList.add(what);
	}
	
	function hide(what){
		document.querySelector('.photo').classList.remove(what);
	}
	
	function toggle(what){
		document.querySelector('.photo').classList.toggle(what);
	}
	
	// ------------------
	
	var SPACE = 32;
	
	var resources = {
		audio : [
			'meow.mp3',
			'meow-dark.mp3',
			'growl.mp3',
			'tension-loop.mp3',
			'heartbeat-loop.mp3'
		]
	};
	
	var texts = {
		loading : 'Loading resources, please wait...',
		welcome : 'Press and hold <code>space</code> or hold down the mouse button/touch screen anywhere!',
		warning1 : 'Watch out, don\'t nag her for too long!',
		warning2 : 'She\'s getting angrier, stop!',
		doom : 'Look what you have done now! Run!'
	};
	
	// ------------------
	
	var finishResolve;
	var finishReject;
	var finished = new Promise(function(resolve, reject){
		finishResolve = resolve;
		finishReject = reject;
	});
	
	var finishedImage = !(resources.image && resources.image.length);
	var finishedAudio = !(resources.audio && resources.audio.length);
	
	load.from(resources);
	
	load.all.audio().then(function(){
		onReady(function(){
			var elements = load.to();
			Object.values(elements.audio).forEach(function(audioTag){
				document.body.appendChild(audioTag);
				audioTag.classList.add('hidden');
			});
			
			finishedAudio = true;
			if(finishedImage && finishedAudio){
				finishResolve();
			}
		});
	}, finishReject);
	
	onReady(function(){
		setText(texts.loading);
	});
	
	finished.then(function(){
		var stage = 0;
		var clickCounter = 0;
		
		var normal = [
			'normal',
			'normal-desat1',
			'normal-desat2',
			'normal-desat3',
			'normal-desat4'
		];
		var active = [
			'active',
			'active-desat1',
			'active-desat2',
			'active-desat3',
			'active-desat4'
		];
		
		var meow = document.querySelector('audio[src$="meow.mp3"]');
		var darkMeow = document.querySelector('audio[src$="meow-dark.mp3"]');
		var growl = document.querySelector('audio[src$="growl.mp3"]');
		var tention = document.querySelector('audio[src$="tension-loop.mp3"]');
		var heartbeat = document.querySelector('audio[src$="heartbeat-loop.mp3"]');
		
		Array.from(document.querySelectorAll('audio[src$="-loop.mp3"]')).forEach(function(audio){
			audio.loop = true;
		});
		
		// --------
		
		function setStage(newStage){
			hide(normal[stage]);
			hide(active[stage]);
			
			switch(newStage){
				case 1:
					setText(texts.warning1);
					heartbeat.volume = .2;
					heartbeat.play();
					tention.volume = .2;
					tention.play();
					break;
				case 2:
					heartbeat.volume = .5;
					heartbeat.playbackRate = 1.3;
					tention.volume = .5;
					break;
				case 3:
					setText(texts.warning2);
					heartbeat.volume = .7;
					heartbeat.playbackRate = 1.7;
					tention.volume = .8;
					break;
				case 4:
					setText(texts.doom);
					show(active[4]);
					growl.play();
					setTimeout(function(){
						toggle(normal[4]);
						toggle(active[4]);
						setInterval(function(){
							if(Math.random() < 0.75){
								toggle(normal[4]);
								toggle(active[4]);
								darkMeow.play();
								setTimeout(function(){
									toggle(normal[4]);
									toggle(active[4]);
									darkMeow.currentTime = 0;
									darkMeow.pause();
								}, Math.floor(Math.random() * 800) + 200);
							}
						}, 5000);
					}, 10000);
					break;
			}
			
			stage = newStage;
		}
		
		// --------
		
		setText(texts.welcome);
		show(normal[0]);
		
		bindControls(function(){
			if(stage < 4){
				if(++clickCounter > 10){
					clickCounter = 0;
					setStage(stage + 1);
				}
			}
			
			if(stage < 4){
				meow.play();
				hide(normal[stage]);
				show(active[stage]);
			}
		}, function(){
			if(stage < 4){
				meow.pause();
				meow.currentTime = 0;
				hide(active[stage]);
				show(normal[stage]);
			}
		});
	}, function(e){
		console.error(e);
	});
})();