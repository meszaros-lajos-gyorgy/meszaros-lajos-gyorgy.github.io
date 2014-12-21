Raphael.fn.group = function(){
	var
		r		= this,
		cfg		= (arguments[0] instanceof Array) ? {} : arguments[0],
		items	= arguments[(arguments[0] instanceof Array) ? 0 : 1]
	;
	
	function Group(cfg, items){
		var
			inst,
			d			= document,
			set			= r.set(items),
			group		= r.raphael.vml ? d.createElement("group") : d.createElementNS("http://www.w3.org/2000/svg", "g"),
			dragSpeed	= 1,
			dragConstrain
		;
		
		r.canvas.appendChild(group);
		
		function updateScale(transform, scaleX, scaleY) {
			var scaleString = 'scale(' + scaleX + ' ' + scaleY + ')';
			if (!transform) {
				return scaleString;
			}
			if (transform.indexOf('scale(') < 0) {
				return transform + ' ' + scaleString;
			}
			return transform.replace(/scale\(-?[0-9]*?\.?[0-9]*?\ -?[0-9]*?\.?[0-9]*?\)/, scaleString);
		}
		
		function updateRotation(transform, rotation) {
			var rotateString = 'rotate(' + rotation + ')';
			if (!transform) {
				return rotateString;
			}
			if (transform.indexOf('rotate(') < 0) {
				return transform + ' ' + rotateString;
			}
			return transform.replace(/rotate\(-?[0-9]+(\.[0-9][0-9]*)?\)/, rotateString);
		}

		function updateTranslation(transform, x, y) {
			var translateString = 'translate(' + x + ' ' + y + ')';
			if (!transform) {
				return translateString;
			}
			return transform.replace(/translate\(-?[0-9]*?\.?[0-9]*?\ -?[0-9]*?\.?[0-9]*?\)/, translateString);
		}
		
		function getTranslate(){
			var
				transform	= group.getAttribute('transform').match(/translate\(([^)]*)\)/),
				t			= {}
			;
			if(transform[1] !== undefined){
				t = transform[1].split(" ");
				t = {
					"x"	: parseInt(t[0]),
					"y"	: parseInt(t[1])
				};
			}
			return t;
		}
		
		inst = {
			scale: function (newScaleX, newScaleY) {
				if(newScaleY == undefined){
					newScaleY = newScaleX;
				}
				var transform = group.getAttribute('transform');
				group.setAttribute('transform', updateScale(transform, newScaleX, newScaleY));
				return this;
			},
			rotate: function(deg) {
				var transform = group.getAttribute('transform');
				group.setAttribute('transform', updateRotation(transform, deg));
			},
			push: function(item) {
				function pushOneRaphaelVector(it){
					var i;
					if (it.type === 'set') {
						for (i=0; i< it.length; i++) {
							pushOneRaphaelVector(it[i]);
						}
					} else {
						group.appendChild(it.node);
						set.push(it);
					}
				}
				pushOneRaphaelVector(item)
				return this;
			},
			translate: function(newTranslateX, newTranslateY) {
				var transform = group.getAttribute('transform');
				group.setAttribute('transform', updateTranslation(transform, newTranslateX, newTranslateY));
				return this;
			},
			getBBox: function() {
				return set.getBBox();
			},
			type: 'group',
			node: group,
			draggable: function(){
				var
					lx	= 0,
					ly	= 0,
					ox	= 0,
					oy	= 0,
					moveFnc = function(dx, dy){
						lx = (dx * dragSpeed) + ox;
						ly = (dy * dragSpeed) + oy;
						
						if(dragConstrain){
							if(dragConstrain.inside){
								var
									A = dragConstrain,
									B = inst.getCoords()
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
						
						inst.translate(lx, ly);
					},
					startFnc = function(){
						var t = getTranslate();
						if(t.x != undefined){
							ox = t.x;
							oy = t.y;
						}
					},
					endFnc = function(){
						ox = lx;
						oy = ly;
					}
				;
				set.drag(moveFnc, startFnc, endFnc);
				return this;
			},
			setDragSpeed: function(s){
				dragSpeed = s;
				return this;
			},
			getDragSpeed: function(){
				return dragSpeed;
			},
			setDragConstrain: function(x, y, w, h, snap, inside){
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
			},
			getCoords: function(){
				var
					b	= inst.getBBox(),
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
			}
		};
		
		return inst;
	}
	
	return Group(cfg, items);
};