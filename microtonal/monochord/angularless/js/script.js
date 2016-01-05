// modules.AudioModel
// modules.Math
// modules.UI

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
	
	var createElement = function(tagName, attributes, children){
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
	
	var onDocumentReady = function(handler){
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
	
	var Reactor = function(){
		var target = document.createTextNode(null);
		
		this.addEventListener    = target.addEventListener.bind(target);
		this.removeEventListener = target.removeEventListener.bind(target);
		this.dispatchEvent       = target.dispatchEvent.bind(target);
	};
	
	var Scope = function(){
		var data = {};
		var self = this;
		
		this.$register = function(variable, defaultValue){
			data[variable] = {
				oldValue : undefined,
				value : defaultValue,
				events : new Reactor()
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
			data[variable].events.addEventListener('change', callback);
		};
		this.$unwatch = function(variable, callback){
			data[variable].events.removeEventListener('change', callback);
		};
	};
	
	// ---------------
	
	var $scope = new Scope();
	$scope.$register('mainVolume', 10);
	
	modules.AudioModel.setMainVolume($scope.mainVolume / 100);
	modules.AudioModel.updateReal();
	$scope.$watch('mainVolume', function(e){
		modules.AudioModel.setMainVolume(e.newValue / 100);
		modules.AudioModel.updateReal();
	});
	
	var em = createElement('em', {
		data : {
			model : [$scope, 'mainVolume']
		}
	});
	
	var range = createElement('input', {
		type : 'range',
		min : 0,
		max : 100,
		data : {
			model : [$scope, 'mainVolume']
		}
	});
	
	var textField = createElement('input', {
		type : 'text',
		data : {
			model : [$scope, 'mainVolume']
		}
	});
	
	onDocumentReady(function(){
		document.body.appendChild(range);
		document.body.appendChild(textField);
		document.body.appendChild(em);
		
		modules.AudioModel.addSet(1, {
			volume : 1
		});
		modules.AudioModel.addString(1, 1, {
			volume : 1,
			type : 'triangle',
			frequency : 440
		});
		modules.AudioModel.addString(2, 1, {
			volume : 1,
			type : 'sine',
			frequency : 330
		});
		modules.AudioModel.updateReal();
	});
})(window.modules);