/*
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
			lx = dx * (1 / _scale) + ox;
			ly = dy * (1 / _scale) + oy;
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
			canvas.transform("s" + _scale + "t" + _translateX + "," + _translateY);
			canvasBg.transform("s" + _scale + "t" + _translateX + "," + _translateY);
		}
	;
	
	this.add = function(el){
		canvas.add(el.getObj());
		elements.push(el);
		return this;
	};
	this.setTranslate = function(x, y){
		_translateX = x;
		_translateY = y;
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
	this.getProps = function(){
		return props;
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
*/