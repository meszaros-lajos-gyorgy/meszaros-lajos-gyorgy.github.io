// https://github.com/tc39/proposal-object-values-entries/blob/master/polyfill.js
// Simple ES7 Object.values and Object.entries polyfill, until MDN comes up with a proper one
if(!Object.values){
	Object.values = function(O){
		return Object.keys(O).reduce(function(v, k){
			return v.concat(typeof k === 'string' && O.propertyIsEnumerable(k) ? [O[k]] : []);
		}, []);
	};
}

if(!Object.entries){
	Object.entries = function(O){
		return Object.keys(O).reduce(function(e, k){
			return e.concat(typeof k === 'string' && O.propertyIsEnumerable(k) ? [[k, O[k]]] : []);
		}, []);
	};
}