angular
	.module('Monochord', ['Model', 'Converter'])
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
		
		converter
			.bindModel($scope, model)
			.load('resources/scala-scales/carlos_alpha.scl', converter.types.SCALA)
			.then(converter.injectIntoModel)
			.then(model.commit, console.error)
		;
		
		/*
		setTimeout(function(){
			var set = model.sets.add();
			model.strings.add(set, {multiplier:30});
			model.strings.add(set, {multiplier:40});
			
			console.log('strings: ', model.calculate.frequencies(set, model.TYPE.STRING));
			console.log('cents: ', model.calculate.frequencies(set, model.TYPE.CENT));
			
			model.harmonics.normalize(set, model.TYPE.STRING);
			
			console.log('strings: ', model.calculate.frequencies(set, model.TYPE.STRING));
			console.log('cents: ', model.calculate.frequencies(set, model.TYPE.CENT));
			
			model.commit();
		}, 100);
		*/
	}])
;