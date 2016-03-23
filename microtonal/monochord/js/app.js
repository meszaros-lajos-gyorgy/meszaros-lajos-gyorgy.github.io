angular
	.module('Monochord', ['Model', 'Converter', 'UI'])
	.controller('MonochordCtrl', ['$scope', 'Model', 'converter', function($scope, Model, converter){
		$scope.baseVolume = 30;
		$scope.baseFrequency = 200;
		$scope.sets = [];
		$scope.retune = {
			default : 'off',
			defaultForNew : 'inherit'
		};
		
		var model = new Model($scope);
		
		// --------------
		
		/*
		converter
			.bindModel($scope, model)
			.load('resources/scala-scales/carlos_alpha.scl', converter.types.SCALA)
			.then(converter.injectIntoModel)
			.then(model.commit, console.error)
		;
		*/
	}])
;