angular
	.module('Monochord', ['Math', 'AudioModel'])
	.controller('MonochordCtrl', ['$scope', 'audioModel', function($scope, audioModel){
		audioModel
			.setMainVolume(0.3)
			.addSet(1, {
				volume : 1
			})
			.addString(1, 1, {
				volume : 1,
				type : 'sine',
				frequency : 330
			})
			.addString(2, 1, {
				volume : 1,
				type : 'triangle',
				frequency : 220
			})
			.updateReal()
		;
		
		setTimeout(audioModel.stopAll, 1000);
	}])
;