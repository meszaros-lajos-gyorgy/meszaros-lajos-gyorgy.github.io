(function(){
	'use strict';
	
	function generateDefaultSettings(){
		return createElement('section', {'class' : 'defaultSettings'}, [
			createElement('h1', {'text' : 'The Monochord'}),
			createElement('label', {}, [
				'Default volume for strings: ',
				createElement('input', {
					type : 'range',
					min : 0,
					max : 100,
					autocomplete : 'off',
					'data-model' : 'defaultVolume'
				}),
				' (',
				createElement('span', {'data-model' : 'defaultVolume'}),
				'/100)'
			]),
			createElement('br'),
			createElement('br'),
			
			createElement('label', {}, [
				'Base frequency: ',
				createElement('input', {
					type : 'number',
					min : 1,
					autocomplete : 'off',
					'data-model' : 'baseFrequency'
				}),
				' Hz'
			]),
			createElement('br'),
			createElement('label', {}, [
				'Base volume: ',
				createElement('input', {
					type : 'range',
					min : 0,
					max : 100,
					autocomplete : 'off',
					'data-model' : 'baseVolume'
				}),
				' (',
				createElement('span', {'data-model' : 'baseVolume'}),
				'/100)'
			]),
		]);
	}
	
	function generateImportExport(){
		return createElement('section', {'class' : 'importExport'}, [
			createElement('h3', {text : 'Import/Export'}),
			createElement('textarea', {'data-model' : 'rawImportData'}),
			createElement('br'),
			createElement('button', {
				text : 'import',
				'class' : 'import'
			})
		]);
	}
	
	function generatePresetSelector(){
		var options = []; // ng-options="tuning.name for tuning in presets.tunings"
		return createElement('section', {'class' : 'presetSelector'}, [
			createElement('h3', {'text' : 'Presets'}),
			createElement('br'),
			createElement('label', {}, [
				'Tuning: ',
				createElement('select', {
					autocomplete : 'off',
					'data-model' : 'activePresetTuning'
				}, options)
			]),
			createElement('br'),
			/*
			<div ng-repeat="tuning in presets.tunings">
				<div ng-show="tuning == activePresetTuning">
					<button ng-repeat="ratio in tuning.ratios" ng-click="addPreset(ratio.ratio, defaultVolume)">{{ratio.name + ' (' + ratio.ratio.join(':') + ')'}}</button>
				</div>
			</div>
			*/
		]);
	}
	
	function get($scope){
		return createElement('div', {'class' : 'monochord-ui'}, [
			generateDefaultSettings(),
			// todo: sets
			generatePresetSelector(),
			generateImportExport()
		]);
	}
})();