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
				"opacity"			: 0.7*/
			}
		};
		
		what = what.toLowerCase();
		
		if(defs[what] !== undefined){
			$.extend(true, data, defs[what]);
		}
		
		return data;
	};
}