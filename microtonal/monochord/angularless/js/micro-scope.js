(function(){
	'use strict';
	
	function MicroScope(){
		var values = {};
		var self = this;
		
		var eventTarget = document.createDocumentFragment();
		
		var update = eventTarget.dispatchEvent.bind(eventTarget);
		this.$watch = eventTarget.addEventListener.bind(eventTarget);
		this.$unwatch = eventTarget.removeEventListener.bind(eventTarget);
		
		this.register = function(prop, value){
			Object.defineProperty(self, prop, {
				enumerable : true,
				get : function(){
					return JSON.parse(JSON.stringify(values[prop]));
				},
				set : function(newValue){
					if(JSON.stringify(newValue) !== JSON.stringify(values[prop])){
						var oldValue = values[prop];
						values[prop] = newValue;
						
						var e = new Event(prop);
						e.newValue = newValue;
						e.oldValue = oldValue;
						
						update(e);
						
						var f = new Event('__changed');
						f.property = prop;
						f.newValue = newValue;
						f.oldValue = oldValue;
						update(f);
					}
				}
			});
			values[prop] = value;
		}
		this.registerAll = function(props){
			Object.keys(props).forEach(function(prop){
				self.register(prop, props[prop]);
			});
		}
	};
	
	window.MicroScope = MicroScope;
})();