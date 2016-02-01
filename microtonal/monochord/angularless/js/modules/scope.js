if(!window.modules){
	window.modules = {};
}

// requires:
//   modules.Reactor

(function(modules){
	'use strict';
	
	modules.Scope = function(){
		var data = {};
		
		this.$register = function(variable, defaultValue){
			if(data.hasOwnProperty(variable)){
				this[variable] = defaultValue;
			}else{
				data[variable] = {
					oldValue : undefined,
					value : defaultValue,
					events : new modules.Reactor(),
					handlers : {}
				};
				
				Object.defineProperty(this, variable, {
					get : function ScopeGetter(){
						return data[variable].value;
					},
					set : function ScopeSetter(newValue){
						if(data[variable].value === newValue){
							return ;
						}
						
						data[variable].oldValue = data[variable].value;
						data[variable].value = newValue;
						
						data[variable].events.dispatchEvent(new CustomEvent('change', {detail : {
							oldValue : data[variable].oldValue,
							newValue : data[variable].value
						}}));
					}
				});
			}
			
			return this;
		};
		this.$watch = function(variable, callback){
			if(!data.hasOwnProperty(variable)){
				this.$register(variable);
			}
			
			// BUG! Only one callback is allowed???
			data[variable].handlers[callback] = function(e){
				callback(e.detail.newValue, e.detail.oldValue);
			};
			data[variable].events.addEventListener('change', data[variable].handlers[callback]);
			callback(data[variable].value, function(){});
			
			return this;
		};
		this.$unwatch = function(variable, callback){
			if(!data.hasOwnProperty(variable)){
				this.$register(variable);
			}
			data[variable].events.removeEventListener('change', data[variable].handlers[callback]);
			
			return this;
		};
	};
})(window.modules);