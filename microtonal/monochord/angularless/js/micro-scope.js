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
					return values[prop];
				},
				set : function(newValue){
					if(newValue !== values[prop]){
						var oldValue = values[prop];
						values[prop] = newValue;
						
						var e = new Event(prop);
						e.newValue = newValue;
						e.oldValue = oldValue;
						
						update(e);
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