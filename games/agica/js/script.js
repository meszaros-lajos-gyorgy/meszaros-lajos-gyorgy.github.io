var loadCounter = 0;
var pressed = false;
var meow, normal, active;

function loaded(e){
	loadCounter++;
	if(loadCounter === 3){
		document.body.addEventListener('keydown', function(e){
			if(e.keyCode === 32 && !pressed){
				pressed = true;
				meow.play();
				normal.className = 'hidden';
				active.className = '';
			}
		});
		document.body.addEventListener('keyup', function(e){
			if(e.keyCode === 32 && pressed){
				pressed = false;
				meow.pause();
				meow.currentTime = 0;
				normal.className = '';
				active.className = 'hidden';
			}
		});
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