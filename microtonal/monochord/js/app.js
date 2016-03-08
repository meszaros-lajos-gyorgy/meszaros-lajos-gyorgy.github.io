angular
	.module('Monochord', ['SetModel', 'Importer'])
	.controller('MonochordCtrl', ['$scope', 'SetModel', 'importer', function($scope, SetModel, importer){
		$scope.baseVolume = 30;
		$scope.baseFrequency = 200;
		$scope.sets = [];
		$scope.retune = {
			default : 'lowestToBaseFreq',
			defaultForNew : 'inherit'
		};
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume',
			retune : 'retune'
		});
		
		// --------------
		
		importer
			.load('resources/scala-scales/carlos_alpha.scl', importer.types.SCALA)
			.then(function(data){
				console.log('Successfully parsed SCL file!');
				
				setTimeout(function(){
					var set, type;
					
					data.notes.some(function(note){
						set = model.sets.add();
						type = (note.type === 'ratio' ? 'strings' : 'cents');
						note.multipliers.forEach(function(multiplier){
							model[type].add(set.id, multiplier);
						});
					});
					
					model.commit();
				}, 100);
			}, function(error){
				console.error(error);
			})
		;
	}])
;