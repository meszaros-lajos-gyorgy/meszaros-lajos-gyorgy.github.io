if(!window.modules){
	window.modules = {};
}

(function(modules){
	'use strict';
	
	modules.Reactor = function(){
		var target = document.createTextNode(null);
		
		this.addEventListener    = target.addEventListener.bind(target);
		this.removeEventListener = target.removeEventListener.bind(target);
		this.dispatchEvent       = target.dispatchEvent.bind(target);
	};
})(window.modules);