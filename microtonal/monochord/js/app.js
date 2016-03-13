angular
	.module('Monochord', ['Model', 'Importer'])
	.controller('MonochordCtrl', ['$scope', 'Model', 'importer', function($scope, Model, importer){
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
		
		setTimeout(function(){
			var set = model.sets.add();
			model.strings.add(set, {multiplier:2});
			model.strings.add(set, {multiplier:3});
			
			model.commit();
		});
	}])
;