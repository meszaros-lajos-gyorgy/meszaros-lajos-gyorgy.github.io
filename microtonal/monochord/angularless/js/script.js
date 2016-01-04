// modules.AudioModel
// modules.Math
// modules.UI

(function(modules){
	'use strict';
	
	modules.AudioModel.addSet(1, {
		volume : 1
	});
	modules.AudioModel.addString(1, 1, {
		volume : 1,
		type : 'sine',
		frequency : 220
	});
	modules.AudioModel.addString(2, 1, {
		volume : 1,
		type : 'sine',
		frequency : 330
	});
	modules.AudioModel.setMainVolume(0.1);
	modules.AudioModel.updateReal();
})(window.modules);