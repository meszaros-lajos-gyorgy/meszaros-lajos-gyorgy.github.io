if(!window.modules){
	window.modules = {};
}

(function(modules){
	'use strict';
	
	// http://stackoverflow.com/a/384380/1806628
	function isNode(o){
		return (
			typeof Node === 'object'
			? o instanceof Node
			:
				o
				&& typeof o === 'object'
				&& typeof o.nodeType === 'number'
				&& typeof o.nodeName === 'string'
		);
	}
	
	function bindToVariable(element, tagName, target){
		var $scope = target[0];
		var variable = target[1];
		
		switch(tagName){
			case 'input' :
				element.addEventListener('input', function(){
					$scope[variable] = this.value;
				});
				element.addEventListener('change', function(){
					$scope[variable] = this.value;
				});
				element.addEventListener('init', function(){
					var self = this;
					$scope.$watch(variable, function(newValue, oldValue){
						if(newValue !== oldValue){
							self.value = newValue;
						}
					});
					element.value = $scope[variable];
				});
				break;
			default :
				element.addEventListener('init', function(){
					var self = this;
					$scope.$watch(variable, function(newValue, oldValue){
						if(newValue !== oldValue){
							self.textContent = newValue;
						}
					});
					element.textContent = $scope[variable];
				});
		}
	}
	
	function createElement(tagName, attributes, children){
		var element = (
			tagName === 'text'
			? document.createTextNode(null)
			: document.createElement(tagName)
		);
		
		if(attributes){
			for(var name in attributes){
				var value = attributes[name];
				switch(name){
					case 'html' :
						element.innerHTML = value;
						break;
					case 'text' :
						element.textContent = value;
						break;
					case 'data' :
						for(var attr in value){
							if(attr === 'model'){
								bindToVariable(element, tagName, value[attr]);
							}else{
								element.setAttribute('data-' + attr, value[attr]);
							}
						}
						break;
					case 'on' :
						for(var event in value){
							element.addEventListener(event, value[event]);
						}
						break;
					default :
						element.setAttribute(name, value + '');
				}
			}
		}
		
		if(children && children.push){
			for(var i = 0; i < children.length; i++){
				var child = children[i];
				if(!isNode(child)){
					child = document.createTextNode(child + '');
				}
				element.appendChild(child);
			}
		}
		
		element.dispatchEvent(new Event('init'));
		
		return element;
	}
	
	function onReady(handler){
		function isValidReadyState(){
			return (document.readyState === 'interactive' || document.readyState === 'complete');
		};
		
		if(isValidReadyState()){
			handler();
		}else{
			var rsHandler = function(){
				document.removeEventListener('readystatechange', rsHandler);
				if(isValidReadyState()){
					handler();
				}
			};
			document.addEventListener('readystatechange', rsHandler);
		}
	}
	
	function loadJSON(src){
		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src);
			xhr.addEventListener('readystatechange', function(){
				if(xhr.readyState === 4){
					if(xhr.status === 200){
						try{
							resolve(JSON.parse(xhr.responseText));
						}catch(e){
							reject(e);
						}
					}else{
						reject(new Error('loadJSON responded with status: ' + xhr.status));
					}
				}
			});
			xhr.send();
		});
	}
	
	modules.DOM = {
		createElement : createElement,
		onReady : onReady,
		isNode : isNode,
		loadJSON : loadJSON
	};
})(window.modules);