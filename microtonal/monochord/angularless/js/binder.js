(function(){
	'use strict';
	
	var $scope;
	
	function isInput(element){
		return (['input', 'textarea', 'select'].indexOf(element.nodeName.toLowerCase()) !== -1);
	}
	
	function onChangeHandler(e){
		if(e.target.hasAttribute('data-model')){
			var model = e.target.getAttribute('data-model');
			var value = e.target.value;
			if(!$scope.hasOwnProperty(model)){
				$scope.register(model);
			}
			$scope[model] = value;
		}
	};
	
	function initValues(view){
		var elements = [].slice.call(view.querySelectorAll('[data-model]'));
		if(view.hasAttribute('data-model')){
			elements.unshift(view);
		}
		elements.forEach(function(element){
			var model = element.getAttribute('data-model');
			var value = '';
			if($scope.hasOwnProperty(model)){
				value = $scope[model];	
			}
			element[isInput(element) ? 'value' : 'textContent'] = value;
		});
	}
	
	function initDomEvents(){
		document.body.addEventListener('change', onChangeHandler, true);
		document.body.addEventListener('input', onChangeHandler, true);
		
		new MutationObserver(function(data){
			[].slice.call(data[0].addedNodes).filter(function(){
				return (data[0].addedNodes[0].nodeName.toLowerCase() !== '#text');
			}).forEach(function(element){
				initValues(element);
			});
		}).observe(document.body, {
			childList : true,
			attributes : true,
			characterData : false,
			subtree: true
		});
	}
	
	function init(){
		if(document.readyState === 'interactive' || document.readyState === 'complete'){
			initDomEvents();
		}else{
			document.addEventListener('readystatechange', function(){
				if(document.readyState === 'interactive'){
					initDomEvents();
				}
			});
		}
		
		$scope.$watch('__changed', function(e){
			var model = e.property;
			[].slice.call(document.querySelectorAll('[data-model="' + model + '"]')).forEach(function(element){
				element[isInput(element) ? 'value' : 'textContent'] = e.newValue;
			});
		});
	}
	
	window.Binder = {
		bindScope : function(newScope){
			if(!(newScope instanceof MicroScope)){
				throw new TypeError();
			}
			$scope = newScope;
			init();
		}
	};
})();