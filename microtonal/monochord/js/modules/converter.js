angular
	.module('Converter', [])
	.factory('converter', ['$http', function($http){
		'use strict';
		
		function parseScalaLines(raw){
			var lines = raw.split(/[ \t]*\r?\n[ \t]*/);
			
			var POINTER_START = 0x01;
			var POINTER_FIRST_COMMENT_BLOCK = 0x02;
			var POINTER_DESCRIPTION = 0x04;
			var POINTER_NOTE_COUNT = 0x08;
			var POINTER_NOTES = 0x10;
			var POINTER_END = 0x20;
			
			var data = {
				description : '',
				noteCount : 0,
				notes : []
			};
			
			var pointer = POINTER_START;
			var lineCounter = 0;
			
			lines.some(function(line){
				lineCounter++;
				switch(pointer){
					case POINTER_START :
						if(line[0] === '!'){
							pointer = POINTER_FIRST_COMMENT_BLOCK;
						}else{
							pointer = POINTER_DESCRIPTION;
							data.description = line;
						}
						break;
					case POINTER_FIRST_COMMENT_BLOCK :
						if(line[0] !== '!'){
							pointer = POINTER_DESCRIPTION;
							data.description = line;
						}
						break;
					case POINTER_DESCRIPTION :
						if(line[0] !== '!'){
							data.noteCount = parseInt(line, 10);
							if(isNaN(data.noteCount) || data.noteCount < 0){
								return true;
							}else if(data.noteCount === 0){
								pointer = POINTER_END;
							}else{
								pointer = POINTER_NOTE_COUNT;
							}
						}
						break;
					case POINTER_NOTE_COUNT :
						if(line[0] !== '!'){
							var match = line.match(/^(\d+[ \t]*(?:\.[ \t]*\d*|\/[ \t]*\d+)?|-\d+\.\d*)(?:[ \t].*)?$/);
							
							if(match === null){
								return true;
							}
							
							match = match[1];
							
							var d = {};
							
							if(match.indexOf('.') !== -1){
								d.type = 'cent';
								d.multipliers = [0, parseFloat(match)];
							}else{
								d.type = 'ratio';
								d.multipliers = match.split('/');
								d.multipliers[0] = parseInt(d.multipliers[0]);
								if(d.multipliers.length === 1){
									d.multipliers.push(1);
								}else{
									d.multipliers[1] = parseInt(d.multipliers[1]);
								}
							}
							
							data.notes.push(d);
							
							if(data.notes.length === data.noteCount){
								pointer = POINTER_NOTES;
							}
						}
						break;
					case POINTER_NOTES :
						if(line === '' && lineCounter === lines.length){
							pointer = POINTER_END;
						}else if(line[0] !== '!'){
							return true;
						}
						break;
				}
			});
			
			return new Promise(function(resolve, reject){
				if(pointer !== POINTER_END){
					var lastParsedPart = {};
					lastParsedPart[POINTER_START] = 'beginning of the file',
					lastParsedPart[POINTER_FIRST_COMMENT_BLOCK] = 'first comment block',
					lastParsedPart[POINTER_DESCRIPTION] = 'description',
					lastParsedPart[POINTER_NOTE_COUNT] = 'note count',
					lastParsedPart[POINTER_NOTES] = 'notes';
					
					reject(Error('Parse error of the SCL file at line ' + lineCounter + '! Last successfully parsed element was: ' + lastParsedPart[pointer]));
				}else{
					if(!(data.notes[0].type === 'ratio' && data.notes[0].multipliers[0] === 1 && data.notes[0].multipliers[1] === 1)){
						data.noteCount++;
						data.notes.unshift({
							type : 'ratio',
							multipliers : [1, 1]
						});
					}
					resolve(data);
				}
			});
		}
		
		var types = {
			SCALA : 0x01,
			JSON : 0x02,
			HTTP : 0x04
		};
		
		var $scope;
		
		return {
			types : types,
			bindModel : function(scope){
				$scope = scope;
				return this;
			},
			load : function(url, type){
				var ret = $http.get(url, {responseType : 'text'});
				switch(type){
					case types.SCALA :
						ret = ret.then(function(response){
							return parseScalaLines(response.data);
						});
						break;
				}
				return ret;
			},
			injectIntoModel : function(data){
				// inject data into bindedModel
				/*
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
				*/
			},
			extractFromModel : function(){
				// angular.toJson(bindedModel.export)
			}
		};
	}])
;