(function(){
	'use strict';
	
	var $scope;
	
	function init(){
		var onChange = function(e){
			if(e.target.hasAttribute('data-model')){
				var model = e.target.getAttribute('data-model');
				var value = e.target.value;
				if(!$scope.hasOwnProperty(model)){
					$scope.register(model);
				}
				$scope[model] = value;
			}
		};
		
		if(document.readyState === 'interactive' || document.readyState === 'complete'){
			document.body.addEventListener('change', onChange, true);
			document.body.addEventListener('input', onChange, true);
		}else{
			document.addEventListener('readystatechange', function(){
				if(document.readyState === 'interactive'){
					document.body.addEventListener('change', onChange, true);
					document.body.addEventListener('input', onChange, true);
				}
			});
		}
		
		$scope.$watch('__changed', function(e){
			var model = e.property;
			[].slice.call(document.querySelectorAll('[data-model="' + model + '"]')).forEach(function(element){
				if(['input', 'textarea', 'select'].indexOf(element.nodeName.toLowerCase()) !== -1){
					element.value = e.newValue;
				}else{
					element.textContent = e.newValue;
				}
			});
		});
	}
	
	function initValues(view){
		[].slice.call(view.querySelectorAll('[data-model]')).forEach(function(element){
			var model = element.getAttribute('data-model');
			var value = '';
			if($scope.hasOwnProperty(model)){
				value = $scope[model];	
			}
			if(['input', 'textarea', 'select'].indexOf(element.nodeName.toLowerCase()) !== -1){
				element.value = value;
			}else{
				element.textContent = value;
			}
		});
	}
	
	window.Binder = {
		bindScope : function(newScope){
			if(!(newScope instanceof MicroScope)){
				throw new TypeError();
			}
			$scope = newScope;
			init();
		},
		initValues : initValues
	};
})();