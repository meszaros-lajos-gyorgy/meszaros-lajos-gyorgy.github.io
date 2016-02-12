angular
	.module('Monochord', ['Presets', 'SetModel', 'Math'])
	.controller('MonochordCtrl', ['$scope', 'presets', 'SetModel', 'math', function($scope, presets, SetModel, math){
		/*
		presets
			.load()
			.then(function(data){
				$scope.presets = data;
			})
		;
		*/
		
		// --------------
		
		/*
		// My example scale:
		var scale = [
			[1, 1],	// 1:1
			400,	// 400 cent
			[3, 2],	// 3:2
			[2, 1]	// 2:1
		];
		
		// 400 cents look horrible as a ratio: 3149802624737183 / 2500000000000000
		*/
		
		$scope.baseVolume = 30;
		$scope.baseFrequency = 50;
		$scope.sets = [];
		
		var model = new SetModel($scope, {
			sets : 'sets',
			baseFrequency : 'baseFrequency',
			baseVolume : 'baseVolume'
		});
		
		/*
		setTimeout(function(){
			for(var i = 0; i < scale.length; i++){
				var setId = model.sets.add(100, false, true);
				if(Array.isArray(scale[i])){
					scale[i].forEach(function(multiplier){
						model.strings.add(setId, multiplier);
					});
				}else{
					var ratio = math.fractionToRatio(math.centsToFraction(scale[i]));
					ratio.forEach(function(multiplier){
						model.strings.add(setId, multiplier);
					});
				}
			}
			model.commit();
		}, 100);
		*/
		
		var precision = 7;
		var cents = 900;
		
		function eee(cents, precision){
			var prec = Math.pow(10, precision);
			var fraction = Math.floor(prec * math.centsToFraction(cents)) / prec;
			var ratio = math.fractionToRatio(fraction);
			var gcd = math.greatestCommonDivisor(ratio[0], ratio[1]);
			var ratio2 = [ratio[0] / gcd, ratio[1] / gcd];
			
			console.log(cents, precision, fraction, ratio, gcd, ratio2);
		}
		
		for(var i = 15; i >= 0; i--){
			eee(900, i);
		}		
		
		// bug:
		// we need to call model.commit(); here, if we add sets, strings, etc. here
		// but we cannot, a loop is active already
		// without it we don't have sound
		// we need a setTimeout
		
		/*
		var setId;
		setTimeout(function(){
			setId = model.sets.add(100, false, true);
			model.strings.add(setId, 4);
			model.strings.add(setId, 6);
			model.commit();
		}, 500);
		
		setTimeout(function(){
			model.strings.add(setId, 7);
			model.commit();
		}, 1000);
		setTimeout(function(){
			model.strings.add(setId, 8);
			model.commit();
		}, 1500);
		setTimeout(function(){
			model.strings.add(setId, 9);
			model.commit();
		}, 2000);
		setTimeout(function(){
			model.strings.add(setId, 12);
			model.commit();
		}, 2500);
		
		setTimeout(function(){
			$scope.baseFrequency = 51;
			$scope.$apply();
		}, 4000);
		setTimeout(function(){
			$scope.baseFrequency = 50;
			$scope.$apply();
		}, 5000);
		*/
	}])
;