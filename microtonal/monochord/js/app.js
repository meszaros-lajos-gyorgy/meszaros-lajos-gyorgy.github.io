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
		
		var model = new Model($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume',
			retune : 'retune'
		});
		
		// --------------
		
		/*
		importer
			.load('resources/scala-scales/carlos_alpha.scl', importer.types.SCALA)
			.then(function(data){
				console.log('Successfully parsed SCL file!');
				
				setTimeout(function(){
					var set, type, min;
					
					$scope.retune = 'lowestToBaseFreq';
					
					data.notes.some(function(note){
						set = model.sets.add();
						type = (note.type === 'ratio' ? 'strings' : 'cents');
						min = note.multipliers.sort()[0];
						note.multipliers.forEach(function(multiplier, index){
							model[type].add(set, {
								multiplier : multiplier,
								muted : min === multiplier
							});
						});
					});
					
					model.commit();
				}, 100);
			}, function(error){
				console.error(error);
			})
		;
		*/
		
		/*
		converter
			.fromHTTP('resources/scala-scales/carlos_alpha.scl')
			.then(function(data){
				return converter.to(data, converter.types.SCALA)
			})
			.then(converter.toScala)
			.then(function(data){
				console.log(data);
			}, function(error){
				console.error(error);
			})
		;
		*/
		
		// http -> scala -> json -> injectIntoModel
		/*
		http->rawtext (loading it through http)
		rawtext->scala (identifying it)
		scala->json (converting it to json)
		*/
		
		
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