angular
	.module('Importer', [])
	.factory('importer', ['$http', function($http){
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
							// The pitch values:
							//   each on a separate line, either as a ratio or as a value in cents
							//   if the value contains a period, it is a cents value, otherwise a ratio
							//   ratios are written with a slash, and only one
							//   integer values with no period or slash should be regarded as such, for example "2" should be taken as "2/1"
							//   numerators and denominators should be supported to at least 2^31-1 = 2147483647
							//   anything after a valid pitch value should be ignored
							//   space or horizontal tab characters are allowed and should be ignored
							//   negative ratios are meaningless and should give a read error
							data.notes.push(line);
							
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
					data.noteCount++;
					data.notes.unshift('1/1');
					resolve(data);
				}
			});
		}
		
		return {
			types : {
				SCALA : 'scl'
			},
			load : function(url, type){
				switch(type){
					case this.types.SCALA :
						return $http
							.get(url, {responseType : 'text'})
							.then(function(response){
								return parseScalaLines(response.data);
							})
						;
						break;
				}
			}
		};
	}])
;