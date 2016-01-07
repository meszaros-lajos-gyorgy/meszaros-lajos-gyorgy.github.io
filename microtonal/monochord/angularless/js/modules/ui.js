if(!window.modules){
	window.modules = {};
}

// requires:
//   modules.DOM

(function(modules){
	'use strict';
	
	function createVolume(model){
		return modules.DOM.createElement('div', {}, [
			'Master volume: ',
			
			modules.DOM.createElement('label', {
				'class' : 'ui volume'
			}, [
				modules.DOM.createElement('input', {
					type : 'range',
					min : 0,
					max : 100,
					autocomplete : 'off',
					data : {
						model : model
					}
				}),
				modules.DOM.createElement('span', {}, [
					modules.DOM.createElement('text', {
						data : {
							model : model
						}
					}),
					'%'
				])
			])
		]);
	}
	
	function createDragNumber(model, params){
		var params = params || {};
		
		var attrs = {
			'class' : 'dragnumber',
			autocomplete : 'off',
			type : 'number',
			data : {
				model : model,
				weight : (params.weight !== undefined ? params.weight : 10)
			}
		};
		
		if(params.min !== undefined){
			attrs.min = params.min;
		}
		if(params.max !== undefined){
			attrs.max = params.max;
		}
		
		function getY(e){
			var y = undefined;
			if(e.clientY){
				y = e.clientY;
			}else if(e.targetTouches){
				y = e.targetTouches[0].clientY;
			}
			return (y === undefined ? 0 : y);
		}
		
		function startHandler(e){
			if(this.classList.contains('edit')){
				return ;
			}
			listening = true;
			startClientY = getY(e);
			startValue = parseInt(this.value, 10) || 0;
			e.stopPropagation();
		}
		
		function stopHandler(e){
			if(this.classList.contains('edit')){
				return ;
			}
			stopClientY = getY(e);
			listening = false;
			e.stopPropagation();
			e.preventDefault();
		}
		
		function moveHandler(e){
			if(this.classList.contains('edit')){
				return ;
			}
			if(listening){
				var weight = parseInt(this.getAttribute('data-weight'), 10);
				if(isNaN(weight) || weight <= 0){
					weight = 1;
				}
				var value = Math.floor((getY(e) - startClientY) * -1 / weight) + startValue;
				if(this.hasAttribute('min')){
					var min = parseInt(this.getAttribute('min'), 10);
					if(value < min){
						value = min;
					}
				}
				if(this.hasAttribute('max')){
					var max = parseInt(this.getAttribute('max'), 10);
					if(value > max){
						value = max;
					}
				}
				
				this.value = value;
				this.dispatchEvent(new Event('change'));
			}
			e.stopPropagation();
			e.preventDefault();
		}
		
		var listening = false;
		var startClientY;
		var startValue;
		var stopClientY;
		
		attrs.on = {
			focus : function(){
				if(!this.classList.contains('edit')){
					this.blur();
				}
			},
			blur : function(){
				if(this.classList.contains('edit')){
					this.classList.remove('edit');
				}
			},
			click : function(){
				if(stopClientY === startClientY){
					this.classList.add('edit');
					this.focus();
				}else if(!this.classList.contains('edit')){
					this.blur();
				}
			},
			mousedown : startHandler,
			touchstart : startHandler,
			mouseup : stopHandler,
			touchend : stopHandler,
			mousemove : moveHandler,
			touchmove : moveHandler
		};
		
		return modules.DOM.createElement('input', attrs);
	}
	
	modules.UI = {
		createVolume : createVolume,
		createDragNumber : createDragNumber
	};
})(window.modules);