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
			if(e.keyCode === 32 && !keyPressed){
				keyPressed = true;
				if(pressed === 0){
					onPress();
				}
				pressed++;
			}
		});
		document.body.addEventListener('keyup', function(e){
			if(e.keyCode === 32 && keyPressed){
				keyPressed = false;
				pressed--;
				if(pressed === 0){
					onRelease();
				}
			}
		});
		if(window.TouchEvent){
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
		}else{
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
	}
	
	function show(what){
		what.classList.remove('hidden');
	}
	
	function hide(what){
		what.classList.add('hidden');
	}
	
	function toggle(what){
		what.classList.toggle('hidden');
	}
	
	// ------------------
	
	var SPACE = 32;
	
	var resources = {
		image : [
			'active.jpg',
			'active-desat1.jpg',
			'active-desat2.jpg',
			'active-desat3.jpg',
			'active-desat4.jpg',
			'normal.jpg',
			'normal-desat1.jpg',
			'normal-desat2.jpg',
			'normal-desat3.jpg',
			'normal-desat4.jpg'
		],
		audio : [
			'meow.mp3',
			'meow-dark.mp3',
			'growl.mp3',
			'tension-loop.mp3',
			'heartbeat-normal.mp3',
			'heartbeat-faster.mp3',
			'heartbeat-fast.mp3'
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
	
	load.all.image().then(function(){
		onReady(function(){
			var elements = load.to();
			Object.values(elements.image).forEach(function(imgTag){
				document.querySelector('body>div').appendChild(imgTag);
				imgTag.classList.add('hidden');
			});
			
			finishedImage = true;
			if(finishedImage && finishedAudio){
				finishResolve();
			}
		});
	}, finishReject);
	
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
			document.querySelector('img[src$="normal.jpg"]'),
			document.querySelector('img[src$="normal-desat1.jpg"]'),
			document.querySelector('img[src$="normal-desat2.jpg"]'),
			document.querySelector('img[src$="normal-desat3.jpg"]'),
			document.querySelector('img[src$="normal-desat4.jpg"]')
		];
		var active = [
			document.querySelector('img[src$="active.jpg"]'),
			document.querySelector('img[src$="active-desat1.jpg"]'),
			document.querySelector('img[src$="active-desat2.jpg"]'),
			document.querySelector('img[src$="active-desat3.jpg"]'),
			document.querySelector('img[src$="active-desat4.jpg"]')
		];
		
		var meow = document.querySelector('audio[src$="meow.mp3"]');
		var darkMeow = document.querySelector('audio[src$="meow-dark.mp3"]');
		var growl = document.querySelector('audio[src$="growl.mp3"]');
		var tention = document.querySelector('audio[src$="tension-loop.mp3"]');
		var heartbeat = [
			document.querySelector('audio[src$="heartbeat-normal.mp3"]'),
			document.querySelector('audio[src$="heartbeat-faster.mp3"]'),
			document.querySelector('audio[src$="heartbeat-fast.mp3"]')
		];
		heartbeat.concat(tention).forEach(function(audio){
			audio.loop = true;
		});
		
		// --------
		
		function setStage(newStage){
			hide(normal[stage]);
			hide(active[stage]);
			
			switch(newStage){
				case 1:
					setText(texts.warning1);
					heartbeat[0].volume = .2;
					heartbeat[0].play();
					tention.volume = .2;
					tention.play();
					break;
				case 2:
					heartbeat[0].currentTime = 0;
					heartbeat[0].pause();
					heartbeat[1].volume = .5;
					heartbeat[1].play();
					tention.volume = .5;
					break;
				case 3:
					setText(texts.warning2);
					heartbeat[1].currentTime = 0;
					heartbeat[1].pause();
					heartbeat[2].volume = .7;
					heartbeat[2].play();
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
							if(Math.random() < 0.5){
								toggle(normal[4]);
								toggle(active[4]);
								darkMeow.play();
								setTimeout(function(){
									toggle(normal[4]);
									toggle(active[4]);
									darkMeow.currentTime = 0;
									darkMeow.pause();
								}, Math.floor(Math.random() * 1000));
							}
						}, 5000);
					}, 9000);
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