/*
(function(){
	'use strict';

	var loadCounter = 0;
	var pressed = 0;
	var keyPressed = false;
	var meow, normal, active;

	function onPress(){
		if(pressed === 0){
			meow.play();
			normal.className = 'hidden';
			active.className = '';
		}
		pressed++;
	}
	
	function onRelease(){
		pressed--;
		if(pressed === 0){
			meow.pause();
			meow.currentTime = 0;
			normal.className = '';
			active.className = 'hidden';
		}
	}
	
	function loaded(e){
		loadCounter++;
		if(loadCounter === 3){
			document.body.addEventListener('keydown', function(e){
				if(e.keyCode === 32 && !keyPressed){
					keyPressed = true;
					onPress();
				}
			});
			document.body.addEventListener('keyup', function(e){
				if(e.keyCode === 32 && keyPressed){
					keyPressed = false;
					onRelease();
				}
			});
			if(window.TouchEvent){
				document.body.addEventListener('touchstart', function(e){
					e.preventDefault();
					onPress();
				});
				document.body.addEventListener('touchend', onRelease);
			}else{
				document.body.addEventListener('mousedown', function(e){
					e.preventDefault();
					onPress();
				});
				document.body.addEventListener('mouseup', onRelease);
			}
			
			normal.className = '';
		}
	}

	document.addEventListener('readystatechange', function(){
		if(document.readyState === 'interactive'){
			meow = document.querySelector('audio');
			meow.addEventListener('canplaythrough', loaded);
			
			normal = document.querySelector('img.normal');
			normal.addEventListener('load', loaded);
			
			active = document.querySelector('img.active');
			active.addEventListener('load', loaded);
		}
	})
})();
*/

(function(){
	'use strict';
	
	var load = {
		_loads : {
			image : {},
			audio : {}
		},
		from : function(resources){
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
	
	// -----------
	
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
			'tension-loop.mp3',
			'heartbeat-normal.mp3',
			'heartbeat-faster.mp3',
			'heartbeat-fast.mp3'
		]
	};
	
	load
		.from(resources)
		.all.image()
			.then(function(){
				modules.DOM.onReady(function(){
					var elements = load.to();
					Object.keys(elements.image).forEach(function(index){
						document.body.appendChild(elements.image[index]);
					});
				});
			}, function(e){
				console.error(e);
			})
	load
		.all.audio()
			.then(function(){
				modules.DOM.onReady(function(){
					var elements = load.to();
					Object.keys(elements.audio).forEach(function(index){
						document.body.appendChild(elements.audio[index]);
					});
				});
			}, function(e){
				console.error(e);
			});
	;
})();