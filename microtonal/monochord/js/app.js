angular
	.module('Monochord', ['Presets', 'SetModel', 'Math'])
	.controller('MonochordCtrl', ['$scope', 'presets', 'SetModel', '$http', function($scope, presets, SetModel, $http){
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
		
		$http
			.get('resources/scala-scales/carlos_alpha.scl', {
				responseType : 'text'
			})
			.then(function(response){
				console.log(response.data);
			})
		;
	}])
;