(function(){
	'use strict';
	
	/*
	<section ng-repeat="set in sets">
		
		<table ng-show="set.strings.length > 0" class="hidden">
			<thead>
			<tr>
				<th>Normalize</th>
				<th colspan="3">Harmonic of the base frequency</th>
				<th>Volume</th>
				<th></th>
			</tr>
			<tr>
				<th>
					Type: <select autocomplete="off" ng-model="set.normalize.type">
						<option value="off">none</option>
						<option value="lowest">(auto) lowest harmony</option>
						<option value="highest">(auto) highest harmony</option>
						<option value="manual">(manual) user select</option>
					</select>
					Target: <select autocomplete="off" ng-model="set.normalize.target" ng-options="value.value as value.label group by value.group for value in _normalizeStringTargets[set.id]"></select>
				</th>
				<th colspan="3">
				</th>
				<th>
					<input type="range" class="master" min="0" max="100" autocomplete="off" ng-model="set.volume" />
				</th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			<tr ng-repeat="string in set.strings">
				<td>
					<input ng-show="set.normalize.type === 'manual'" type="radio" autocomplete="off" ng-value="string.id" ng-model="set.normalize.subject" />
				</td>
				<td rowspan="{{set.strings.length}}" ng-show="$first">
					<button ng-click="lowerHarmonics(set.id)">▼ | lower all harmonics</button>
				</td>
				<td>
					<input type="range" class="freq" min="1" max="100" autocomplete="off" ng-model="string.multiplier" />
					<input type="number" class="freq" min="1" max="100" autocomplete="off" string-to-number ng-model="string.multiplier" />
				</td>
				<td rowspan="{{set.strings.length}}" ng-show="$first">
					<button ng-click="raiseHarmonics(set.id)">▲ | raise all harmonics</button>
				</td>
				<td><input type="range" class="volume" min="0" max="100" autocomplete="off" ng-model="string.volume" /></td>
				<td><button ng-click="removeString(string.id)">x | delete this string</button></td>
			</tr>
			</tbody>
		</table>
		<br />
		<button ng-click="addString(set.id)">+ | add a new string</button>
		<button ng-click="removeSet(set.id)">x | delete this set</button>
		<button>assign to key</button>
		<br />
		<br />
	</section>
	<button ng-click="addSet()">+ | add a new set</button>
	
	<br />
	<br />
	
	<hr ng-show="presets.tunings" />
	<div ng-show="presets.tunings">
		<h3>Presets</h3>
		
		<br />
		<label>Tuning: <select autocomplete="off" ng-model="activePresetTuning" ng-options="tuning.name for tuning in presets.tunings"></select></label><br />
		<br />
		<div ng-repeat="tuning in presets.tunings">
			<div ng-show="tuning == activePresetTuning">
				<button ng-repeat="ratio in tuning.ratios" ng-click="addPreset(ratio.ratio, defaultVolume)">{{ratio.name + ' (' + ratio.ratio.join(':') + ')'}}</button>
			</div>
		</div>
	</div>
	*/
	
	function createElement(tag, attributes, children, onReady){
		var attributes = attributes || {};
		var children = children || [];
		var element = document.createElement(tag);
		Object.keys(attributes).forEach(function(attribute){
			var value = attributes[attribute];
			switch(attribute){
				case 'text' : {
					element.textContent = value;
				}
				break;
				case 'html' : {
					element.innerHTML = value;
				}
				break;
				default : {
					element.setAttribute(attribute, value);
				}
			}
		});
		
		children.forEach(function(child){
			if(typeof child === 'string'){
				child = document.createTextNode(child);
			}
			element.appendChild(child);
		});
		
		if(typeof onReady === 'function'){
			onReady(element);
		}
		
		return element;
	}
	
	function get($scope){
		return createElement('div', {'class' : 'monochord-ui'}, [
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
			createElement('br'),
			createElement('br'),
			createElement('hr'),
			
			createElement('div', {}, [
				createElement('h3', {text : 'Import/Export'}),
				createElement('textarea', {'data-model' : 'rawImportData'}),
				createElement('br'),
				createElement('button', {
					text : 'import',
					'class' : 'import'
				})
			])
		]);
	}
	
	window.UI = {
		get : get
	};
	
	/*
	// <input data-model="asdf" type="text" class="dragnumber" data-min="0" data-max="100" value="0" autocomplete="off" data-weight="10" />
	
	var input = document.querySelector('input');
	
	var listening = false;
	var startClientY;
	var startValue;

	input.addEventListener('focus', function(){
		this.blur();
	});
	input.addEventListener('mousedown', function(e){
		listening = true;
		startClientY = e.clientY;
		startValue = parseInt(this.value, 10) || 0;
	});
	input.addEventListener('mouseup', function(){
		listening = false;
	});
	input.addEventListener('mousemove', function(e){
		if(listening){
			var weight = parseInt(this.getAttribute('data-weight'), 10);
			if(weight <= 0){
				weight = 1;
			}
			var value = Math.floor((e.clientY - startClientY) * -1 / weight) + startValue;
			var min = parseInt(this.getAttribute('data-min'), 10);
			var max = parseInt(this.getAttribute('data-max'), 10);
			if(value < min){
				value = min;
			}else if(value > max){
				value = max;
			}
			this.value = value;
		}
	});
	*/
})();