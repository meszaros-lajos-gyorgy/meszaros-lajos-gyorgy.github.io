if(!window.modules){
	window.modules = {};
}

// requires:
//   modules.Reactor

(function(modules){
	'use strict';
	
	modules.Scope = function(){
		var data = {};
		var self = this;
		
		this.$register = function(variable, defaultValue){
			data[variable] = {
				oldValue : undefined,
				value : defaultValue,
				events : new modules.Reactor()
			};
			Object.defineProperty(self, variable, {
				get : function(){
					return data[variable].value;
				},
				set : function(newValue){
					if(data[variable].value === newValue){
						return;
					}
					data[variable].oldValue = data[variable].value;
					data[variable].value = newValue;
					
					var event = new Event('change');
					event.oldValue = data[variable].oldValue;
					event.newValue = data[variable].value;
					data[variable].events.dispatchEvent(event);
				}
			});
		};
		this.$watch = function(variable, callback){
			// todo: this should register, if data[variable] doesn't exist yet
			data[variable].events.addEventListener('change', callback);
		};
		this.$unwatch = function(variable, callback){
			data[variable].events.removeEventListener('change', callback);
		};
	};
})(window.modules);