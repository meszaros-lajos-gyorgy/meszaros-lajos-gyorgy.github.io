define([], function(){
	'use strict';
	
	return function(){
		var
			map         = [],
			amounts     = {
				"cols" : [],
				"rows" : []
			},
			width,
			height,
			tents,
			tentMask    = [],
			treeMask    = [],
			
		// const
			CLEAR       = 0,
			TREE        = 1,
			TENT        = 2
		;
		
		function validate(params){
			if(
				typeof params.width !== "undefined"
				&& typeof params.height !== "undefined"
				&& typeof params.tents !== "undefined"
				&& !isNaN(params.width)
				&& !isNaN(params.height)
				&& !isNaN(params.tents)
				&& parseInt(params.width) > 1
				&& parseInt(params.height) > 1
				&& parseInt(params.tents) >= 1
			){
				width  = parseInt(params.width);
				tents  = parseInt(params.tents);
				height = parseInt(params.height);
				return true;
			}
			return false;
		}
		
		function createMap(){
			var i = 0;
			for(var y = 0; y < height; y++){
				var _y = [];
				for(var x = 0; x < width; x++){
					_y[x] = CLEAR;
					tentMask[i++] = width * y + x;
				}
				map[y] = _y;
			}
		}
		
		function generateTents(){
			var spot, x, y, i, j, h, w, x2, y2, tm, value;
			var k = 0;
			for(var i = 0; i < tents; i++){
				if(!tentMask.length) break;
				
				spot = tentMask[Math.floor(Math.random() * tentMask.length)];
				x = spot % width;
				y = Math.floor(spot / width);
				
				map[y][x] = TENT;
				
				tm = 0;
				treeMask[k] = [];
				for(h = -1; h <= 1; h++){
					for(w = -1; w <= 1; w++){
						x2 = w + x;
						y2 = h + y;
						if(x2 >= 0 && x2 < width && y2 >= 0 && y2 < height){
							value = width * y2 + x2;
							if(value != spot && h != w && (h == 0 || w == 0)){
								treeMask[k][tm++] = value;
							}
							
							for(j = 0; j < tentMask.length; j++){
								if(tentMask[j] == value){
									tentMask.splice(j, 1);
									break;
								}
							}
						}
					}
				}
				k++;
			}
			tents = i;
		}
		
		function generateTrees(){
			var i, j, k, x, y, spot;
			for(i = 0; i < tents; i++){
				spot = treeMask[i][Math.floor(Math.random() * treeMask[i].length)];
				x = spot % width;
				y = Math.floor(spot / width);
				
				map[y][x] = TREE;
				
				if(i < tents - 1){
					for(j = i + 1; j < tents; j++){
						for(k = 0; k < treeMask[j].length; k++){
							if(treeMask[j][k] == spot){
								treeMask[j].splice(k, 1);
								break;
							}
						}
					}
				}
			}
		}
		
		function countTents(){
			for(var i = 0; i < width; i++){
				amounts.cols[i] = 0;
			}
			for(var j = 0; j < height; j++){
				amounts.rows[j] = 0;
			}
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					if(map[j][i] == TENT){
						amounts.cols[i]++;
						amounts.rows[j]++;
					}
				}
			}
		}
		
		function removeTents(){
			// ha kell a sátoros térkép, akkor még itt kell elmenteni.
			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){
					if(map[j][i] == TENT){
						map[j][i] = CLEAR;
					}
				}
			}
		}
		
		this.getMap = function(){
			return {
				"amounts"	: amounts,
				"map"		: map
			};
		}
		
		this.createMap = function(params){
			if(validate(params)){
				createMap();
				generateTents();
				generateTrees();
				countTents();
				removeTents();
			}
		}
	}
});