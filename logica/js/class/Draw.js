/*
function Draw(screen, canvasWidth, canvasHeight){
	var
		canvas	= new Canvas(paper, {
			"width" 	: canvasWidth,
			"height"	: canvasHeight
		})
	;
	
	this.zoom = function(times){
		canvas.setScale(canvas.getScale() * times, function(obj, s){
			obj
				.setDragSpeed(1 / s)
				.setDragConstrain(0, 0, canvasWidth * s, canvasHeight * s)
			;
		});
	};
	
	this.NOR = function(x, y, props){
		
		
		
		// -------------
		
		var
			lx	= 0,
			ly	= 0,
			ox	= 0,
			oy	= 0,
			self = this,
			dragSpeed		= 1,
			dragConstrain,
			getTranslate = function(){
				var t = nor.transform().toString().match(/t(\d+),(\d+)/);
				return (
					t
					? {
						"x"	: parseInt(t[1]),
						"y"	: parseInt(t[2])
					}
					: {}
				);
			},
			moveFnc = function(dx, dy){
				lx = (dx * dragSpeed) + ox;
				ly = (dy * dragSpeed) + oy;
				
				if(dragConstrain){
					if(dragConstrain.inside){
						var
							A = dragConstrain,
							B = self.getCoords()
						;
						if(lx < A.x - B.offsetX + A.snap){
							lx = A.x - B.offsetX;
						}
						if(ly < A.y - B.offsetY + A.snap){
							ly = A.y - B.offsetY;
						}
						if(lx > A.x - B.offsetX - B.w + A.w - A.snap){
							lx = A.x - B.offsetX - B.w + A.w;
						}
						if(ly > A.y - B.offsetY - B.h + A.h - A.snap){
							ly = A.y - B.offsetY - B.h + A.h;
						}
					}else{
						
					}
				}
				
				nor.transform("t" + lx + "," + ly);
			},
			startFnc = function(){
				var t = getTranslate();
				if(t.x){
					ox = t.x;
					oy = t.y;
				}
			},
			endFnc = function(){
				ox = lx;
				oy = ly;
			}
		;
		this.setDragSpeed = function(s){
			dragSpeed = s;
			return this;
		};
		this.getDragSpeed = function(){
			return dragSpeed;
		};
		this.setDragConstrain = function(x, y, w, h, snap, inside){
			if(snap === undefined){
				snap = 0;
			}
			if(inside === undefined){
				inside = true;
			}
			dragConstrain = {
				"x"			: x,
				"y"			: y,
				"w"			: w,
				"h"			: h,
				"snap"		: snap,
				"inside"	: inside
			};
			return this;
		};
		this.getCoords = function(){
			var
				b	= nor.getBBox(),
				t	= getTranslate()
			;
			return {
				"x"			: t.x + b.x,
				"y"			: t.y + b.y,
				"w"			: b.width,
				"h"			: b.height,
				"offsetX"	: b.x,
				"offsetY"	: b.y
			};
		};
		
		// -------------
		
		nor
			.drag(moveFnc, startFnc, endFnc)
		;
		
		this
			.setDragSpeed(1 / canvas.getScale())
			.setDragConstrain(0, 0, canvasWidth * canvas.getScale(), canvasHeight * canvas.getScale())
			.getObj = function(){
				return nor;
			}
		;
		
		canvas.add(this);
		
		return this;
	};
}
*/

function Draw(targetSelector, canvasWidth, canvasHeight){
	var paper = Snap(targetSelector);
	paper.attr({
		"width"		: "100%",
		"height"	: "100%"
	});
	
	// ------------
	
	var self	= this;
	var paths	= new Paths();
	
	$(paths).on("load", function(){
		$(self).trigger("load");
	});
	
	// ------------
	
	function create(data){
		var obj;
		switch(data.schema.type){
			case "path" : {
				obj = paper.path(data.schema.d);
			}
			break;
			case "circle" : {
				obj = paper.circle(data.schema.x, data.schema.y, data.schema.r);
			}
		}
		if(obj){
			obj.attr(data.attr);
			if(data.event){
				for(event in data.event){
					switch(event){
						case "hover" : {
							(function(attrs){
								obj.hover(function(){
									this.attr(attrs);
								});
							})(data.event[event]);
						}
						break;
						case "blur" : {
							(function(attrs){
								obj.hover(null, function(){
									this.attr(attrs);
								});
							})(data.event[event]);
						}
						break;
					}
				}
			}
		}
		return obj;
	}
	
	function getProps(method, user){
		return $.extend(true, {
			"minInputs"		: 2,
			"maxInputs"		: 5,
			"inputs"		: 2,
			"signalLength"	: 20
		}, method || {}, user || {});
	}
	
	function createGate(x, y, props, components){
		var
			joint	= paths.get("joint"),
			signal	= paths.get("signal"),
			main	= paths.get(components.main),
			negate	= paths.get(components.negate ? "not" : "empty"),
			xorArc	= paths.get(components.xor ? "xor" : "empty")
		;
		
		var
			base	= create(main),
			xor		= create(xorArc),
			not		= create(negate),
			output	= create($.extend(true, {}, signal, {"schema" : {
				"d" : "m0,0.5l" + props.signalLength + ",0"
			}})),
			jointQ	= create(joint)
		;
		
		var
			baseX	= -main.width / 2,
			baseY	= -main.height / 2,
			notX	= -baseX - (negate.width / 5),
			notY	= -(negate.height / 2),
			xorX	= baseX - (xorArc.width / 2),
			xorY	= baseY,
			outputX	= notX + negate.width,
			outputY	= -(signal.height / 2),
			jointQX	= outputX + props.signalLength,
			jointQY	= -(joint.height / 2)
		;
		
		base.transform("t" + baseX + "," + baseY);
		if(not){
			not.transform("t" + notX + "," + notY);
		}
		if(xor){
			xor.transform("t" + xorX + "," + xorY);
		}
		output.transform("t" + outputX + "," + outputY);
		jointQ.transform("t" + jointQX + "," + jointQY);
		
		var group	= paper.group(output, jointQ);
		if(not){
			group.add(not);
		}
		
		var
			inputsNum	= props[(
				props.inputs > props.maxInputs
				? "maxI"
				: (
					props.inputs < props.minInputs
					? "minI"
					: "i"
				)
			) + "nputs"],
			inputs		= [],
			_i, _j, _iX, _iY, _jX, _jY, _offset
		;
		for(var i = 0; i < inputsNum; i++){
			_offset = Math.abs(-((inputsNum - 1) / 2) + i);
			
			_i	= create($.extend(true, {}, signal, {"schema" : {
				"d" : "m0,0.5l" + (props.signalLength - _offset) + ",0"
			}}));
			_j	= create(joint);
			
			_iX	= xorX - props.signalLength + 4;
			_iY	= xorY + (main.height / (inputsNum + 1)) * (i + 1) - (signal.height / 2);
			_jX	= _iX - joint.width;
			_jY	= _iY - (joint.height / 2) + (signal.height / 2);
			
			_i.transform("t" + _iX + "," + _iY);
			_j.transform("t" + _jX + "," + _jY);
			
			inputs.push({
				"input" : _i,
				"joint"	: _j
			});
			
			group
				.add(_i)
				.add(_j)
			;
		}
		
		if(xor){
			group.add(xor);
		}
		
		group
			.add(base)
			.transform("t" + x + "," + y)
		;
		
		var ret = {
			"getObj"	: function(){
				return group;
			}
		};
		
		return ret;
	}
	
	// ------------
	
	this.getPaper = function(){
		return paper;
	}
	
	this.BUFFER = function(x, y, props){
		return createGate(x, y, getProps({
			"minInputs"	: 1,
			"maxInputs" : 1,
			"inputs"	: 1
		}, (props || {})), {
			"main"		: "buffer"
		});
	};
	
	this.NOT = function(x, y, props){
		return createGate(x, y, getProps({
			"minInputs"	: 1,
			"maxInputs" : 1,
			"inputs"	: 1
		}, (props || {})), {
			"main"		: "buffer",
			"negate"	: true
		});
	};
	
	this.OR = function(x, y, props){
		return createGate(x, y, getProps({}, (props || {})), {
			"main"		: "or"
		});
	};
	
	this.NOR = function(x, y, props){
		return createGate(x, y, getProps({}, (props || {})), {
			"main"		: "or",
			"negate"	: true
		});
	};
	
	this.AND = function(x, y, props){
		return createGate(x, y, getProps({}, (props || {})), {
			"main"		: "and"
		});
	};
	
	this.NAND = function(x, y, props){
		return createGate(x, y, getProps({}, (props || {})), {
			"main"		: "and",
			"negate"	: true
		});
	};
	
	this.XOR = function(x, y, props){
		return createGate(x, y, getProps({}, (props || {})), {
			"main"		: "or",
			"xor"		: true
		});
	};
	
	this.XNOR = function(x, y, props){
		return createGate(x, y, getProps({}, (props || {})), {
			"main"		: "or",
			"xor"		: true
		});
	};
}