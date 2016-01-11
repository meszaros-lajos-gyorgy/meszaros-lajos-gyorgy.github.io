if(!window.modules){
	window.modules = {};
}

(function(modules){
	'use strict';
	
	modules.Utils = {
		clone : function(obj){
			return JSON.parse(JSON.stringify(obj));
		}
	};
})(window.modules);