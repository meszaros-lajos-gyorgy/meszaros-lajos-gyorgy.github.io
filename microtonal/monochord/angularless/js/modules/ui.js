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
		
		return modules.DOM.createElement('input', attrs);
	}
	
	modules.UI = {
		createVolume : createVolume,
		createDragNumber : createDragNumber
	};
})(window.modules);