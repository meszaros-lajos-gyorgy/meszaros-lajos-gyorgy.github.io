if(!window.modules){
	window.modules = {};
}

(function(modules){
	'use strict';
	
	var bindToVariable = function(element, tagName, target){
		var $scope = target[0];
		var variable = target[1];
		
		switch(tagName){
			case 'input' :
				element.addEventListener('input', function(){
					$scope[variable] = this.value;
				});
				element.addEventListener('init', function(){
					var self = this;
					$scope.$watch(variable, function(e){
						if(e.newValue !== e.oldValue){
							self.value = e.newValue;
						}
					});
					element.value = $scope[variable];
				});
				break;
			default :
				element.addEventListener('init', function(){
					var self = this;
					$scope.$watch(variable, function(e){
						if(e.newValue !== e.oldValue){
							self.textContent = e.newValue;
						}
					});
					element.textContent = $scope[variable];
				});
		}
	};
	
	function createElement(tagName, attributes, children){
		var element = document.createElement(tagName);
		
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
				if(typeof child === 'string'){
					child = document.createTextNode(child);
				}
				element.appendChild(children);
			}
		}
		
		element.dispatchEvent(new Event('init'));
		
		return element;
	};
	
	function onDOMReady(handler){
		var isValidReadyState = function(){
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
	};
	
	modules.UI = {
		createElement : createElement,
		onDOMReady : onDOMReady
	};
})(window.modules);