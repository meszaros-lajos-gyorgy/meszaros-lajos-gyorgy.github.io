(function(){
	'use strict';
	
	var $scope = new MicroScope();
	
	document.addEventListener('readystatechange', function(){
		if(document.readyState === 'complete'){
			var onChange = function(e){
				if(e.target.hasAttribute('data-model')){
					var model = e.target.getAttribute('data-model');
					var value = e.target.value;
					if(!$scope.hasOwnProperty(model)){
						$scope.register(model);
						$scope.$watch(model, function(e){
							[].slice.call(document.querySelectorAll('[data-model="' + model + '"]')).forEach(function(element){
								if(['input', 'textarea', 'select'].indexOf(element.nodeName.toLowerCase()) !== -1){
									element.value = e.newValue;
								}else{
									element.textContent = e.newValue;
								}
							});
						});
					}
					$scope[model] = value;
				}
			};
			document.body.addEventListener('change', onChange, true);
			document.body.addEventListener('input', onChange, true);
		}
	});
})();