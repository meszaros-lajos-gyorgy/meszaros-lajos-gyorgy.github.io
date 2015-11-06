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