(function(){
	
	
	
	/*
	var input = document.querySelector('input');
	
	var listening = false;
	var startClientY;
	var startValue;

	input.addEventListener('focus', function(){
		this.blur();
	});
	input.addEventListener('mousedown', function(e){
		listening = true;
		startClientY = e.clientY;
		startValue = parseInt(this.value, 10) || 0;
	});
	input.addEventListener('mouseup', function(){
		listening = false;
	});
	input.addEventListener('mousemove', function(e){
		if(listening){
			var weight = parseInt(this.getAttribute('data-weight'), 10);
			if(weight <= 0){
				weight = 1;
			}
			var value = Math.floor((e.clientY - startClientY) * -1 / weight) + startValue;
			var min = parseInt(this.getAttribute('data-min'), 10);
			var max = parseInt(this.getAttribute('data-max'), 10);
			if(value < min){
				value = min;
			}else if(value > max){
				value = max;
			}
			this.value = value;
		}
	});
	*/
	
})();