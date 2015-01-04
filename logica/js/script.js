"use strict";

function Demo(draw){
	this.drawGrid = function(width, height, cellSize){
		var paper = draw.getPaper();
		
		var attr = {
			"stroke" : "rgba(0, 0, 0, .2)"
		};
		
		for(var x = cellSize; x < width; x += cellSize){
			var vpath = "m" + x + ",0l0," + height + "z";
			var vline = paper.path(vpath);
			vline.attr(attr);
		}
		
		for(var y = cellSize; y < height; y += cellSize){
			var hpath = "m0," + y + "l" + width + ",0z";
			var hline = paper.path(hpath);
			hline.attr(attr);
		}
		return this;
	};
	this.drawGates = function(){
		var gates = ["BUFFER", "NOT", "OR", "NOR", "AND", "NAND", "XOR", "XNOR"];
		for(var i = 0; i < gates.length; i++){
			for(var j = 2; j <= 5; j++){
				draw[gates[i]](100 * (i + 1), 100 * (j - 1), {
					"inputs" : j
				});
			}
		}
		return this;
	};
}


$(function(){
	var
		width	= 500,
		height	= 300
	;
	
	var draw	= new Draw("#screen>svg", width, height);
	$(draw).on("load", function(){
		var demo = new Demo(draw);
		demo
			// .drawGrid(width, height, 10)
			.drawGates()
		;
	});
});