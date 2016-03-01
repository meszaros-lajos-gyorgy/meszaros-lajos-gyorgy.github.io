angular
	.module('Monochord', [/*'Presets',*/ 'SetModel', 'Importer'])
	.controller('MonochordCtrl', ['$scope', /*'presets',*/ 'SetModel', 'importer', function($scope, /*presets,*/ SetModel, importer){
		/*
		presets
			.load()
			.then(function(data){
				$scope.presets = data;
				$scope.$apply();
			})
		;
		*/
		
		// --------------
		
		/*
		$scope.baseVolume = 30;
		$scope.baseFrequency = 100;
		$scope.sets = [];
		$scope.retune = {
			default : 'lowestToPrevHighest',
			defaultForNew : 'inherit'
		};
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume',
			retune : 'retune'
		});
		*/
		
		// --------------
		
		importer
			.load('resources/scala-scales/carlos_alpha.scl', importer.types.SCALA)
			.then(function(data){
				console.log('Successfully parsed SCL file!', data);
			}, function(error){
				console.error(error);
			})
		;
	}])
;