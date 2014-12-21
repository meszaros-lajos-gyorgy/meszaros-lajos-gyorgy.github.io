function Paths(){
	var
		self	= this,
		defs
	;
	
	$.get("js/definitions.json", function(reply){
		defs = reply;
		$(self).trigger("load");
	});
	
	this.get = function(what){
		var data = {
			"attr" : {
				"stroke"			: "#000000",
				"stroke-linecap"	: "square",
				"stroke-width"		: 1/*,
				"opacity"			: 0.7
				*/
			}
		};
		
		what = what.toLowerCase();
		
		if(defs[what] !== undefined){
			$.extend(true, data, defs[what]);
		}
		
		return data;
	};
}

function Canvas(paper, props){
	var
		props		= $.extend(true, {
			"x"			: 0,
			"y"			: 0,
			"width"		: "100%",
			"height"	: "100%"
		}, (props || {})),
		_scale		= 1,
		_translateX	= 0,
		_translateY	= 0,
		self		= this,
		lx			= 0,
		ly			= 0,
		ox			= 0,
		oy			= 0,
		canvasBg	= paper.rect(props.x, props.y, props.width, props.height),
		canvas		= paper.group(),
		elements	= []
	;
	
	var
		moveFnc = function(dx, dy){
			lx = dx + ox;
			ly = dy + oy;
			self.setTranslate(lx, ly);
		},
		startFnc = function(){
			var transform = canvasBg.transform();
			for(var i = 0; i < transform.length; i++){
				if(transform[i][0].toLowerCase() === "t"){
					ox = parseInt(transform[i][1]) * _scale;
					oy = parseInt(transform[i][2]) * _scale;
				}
			}
		},
		endFnc = function(){
			ox = lx;
			oy = ly;
		},
		applyTransform = function(){
			/*
			if(_scale !== 1){
				var b = canvasBg.getBBox();
				var x = ((b.width / 2) * (_scale - 1));
				var y = ((b.height / 2) * (_scale - 1));
				
				canvasBg.transform("s" + _scale + "t" + (_translateX + x) + "," + (_translateY + y));
			}else{
				canvasBg.transform("t" + _translateX + "," + _translateY);
			}
			*/
			canvasBg.transform("s" + _scale + "t" + _translateX + "," + _translateY);
		}
	;
	
	this.add = function(el){
		canvas.push(el);
		elements.push(el);
		return this;
	};
	this.setTranslate = function(x, y){
		_translateX = x;
		_translateY = y;
		canvas.translate(_translateX, _translateY);
		applyTransform();
		return this;
	};
	this.getTranslate = function(){
		return {
			"x" : _translateX,
			"y" : _translateY
		};
	};
	this.setScale = function(s, onEachElement){
		_scale = s;
		canvas.scale(_scale);
		applyTransform();
		if(onEachElement){
			for(var i = 0; i < elements.length; i++){
				onEachElement(elements[i], s);
			}
		}
		return this;
	};
	this.getScale = function(){
		return _scale;
	};
	
	canvasBg.attr({
		"fill"			: "rgba(255, 255, 0, .5)",
		"stroke"		: "#000000",
		"stroke-width"	: 1
	});
	
	this
		.setTranslate(0, 0)
		.setScale(1)
	;
	canvasBg.drag(moveFnc, startFnc, endFnc);
}

function Draw(screen, canvasWidth, canvasHeight){
	var
		paper	= new Raphael(screen),
		canvas	= new Canvas(paper, {
			"width" 	: canvasWidth,
			"height"	: canvasHeight
		})
	;
	
	paper.setSize("100%", "100%");
	
	var
		create = function(data){
			var obj;
			switch(data.schema.type){
				case "path" : {
					obj = paper.path(data.schema.d);
				}
				break;
			}
			if(obj !== undefined){
				obj.attr(data.attr);
			}
			return obj;
		},
		getProps = function(method, user){
			method = method || {};
			user = user || {};
			
			return $.extend(true, {
				"maxInputs"	: 5,
				"inputs"	: 2
			}, method, user);
		}
	;
	
	this.zoom = function(times){
		canvas.setScale(canvas.getScale() * times, function(e, s){
			e
				.setDragSpeed(1 / s)
				.setDragConstrain(0, 0, canvasWidth * s, canvasHeight * s)
			;
		});
	};
	
	this.NOR = function(x, y, props){
		var
			props	= getProps({}, (props || {}))
		;
		
		var
			joint	= paths.get("joint"),
			signal	= paths.get("signal"),
			main	= paths.get("or"),
			negate	= paths.get("not")
		;
		
		var
			base	= create(main),
			not		= create(negate),
			output	= create(signal),
			jointQ	= create(joint)
		;
		
		var
			baseX	= -main.width / 2,
			baseY	= -main.height / 2,
			notX	= -baseX - (negate.width / 5),
			notY	= -(negate.height / 2),
			outputX	= notX + negate.width,
			outputY	= -(signal.height / 2),
			jointQX	= outputX + signal.width,
			jointQY	= -(joint.height / 2)
		;
		
		base.transform("t" + baseX + "," + baseY);
		not.transform("t" + notX + "," + notY);
		output.transform("t" + outputX + "," + outputY);
		jointQ.transform("t" + jointQX + "," + jointQY);
		
		var nor = paper.group();
		nor
			.push(not)
			.push(output)
			.push(jointQ)
		;
		
		var
			inputsNum	= props[(props.inputs > props.maxInputs ? "maxI" : "i") + "nputs"],
			inputs		= [],
			_i, _j, _iX, _iY, _jX, _jY
		;
		for(var i = 0; i < inputsNum; i++){
			_i	= create(signal);
			_j	= create(joint);
			
			_iX	= baseX - (signal.width / 2);
			_iY	= baseY + (main.height / (inputsNum + 1)) * (i + 1) - (signal.height / 2);
			_jX	= _iX - joint.width;
			_jY	= _iY - (joint.height / 2) + (signal.height / 2);
			
			_i.transform("t" + _iX + "," + _iY);
			_j.transform("t" + _jX + "," + _jY);
			
			inputs.push({
				"input" : _i,
				"joint"	: _j
			});
			
			nor
				.push(_i)
				.push(_j)
			;
		}
		
		nor
			.push(base)
			.translate(x, y)
			.draggable()
			.setDragSpeed(1 / canvas.getScale())
			.setDragConstrain(0, 0, canvasWidth * canvas.getScale(), canvasHeight * canvas.getScale())
		;
		
		canvas.add(nor);
		
		return this;
	};
}

var
	paths	= new Paths(),
	d
;

$(function(){
	$(paths).on("load", function(){
		d = new Draw($("#screen")[0], 500, 300);
		d
			.NOR(100, 100)
			/*
			.NOR(200, 100, {
				"inputs" : 3
			})
			.NOR(300, 100, {
				"inputs" : 4
			})
			.NOR(400, 100, {
				"inputs" : 5
			})
			*/
		;
		// d.zoom(2);
	});
});