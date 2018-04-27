function Board(contextGrid, contextTiles) {
	this.hex_mode = false;
	this.tile_count = 0;
	this.tile_set = [];
	this.tile_size_multiplier = 1;
	this.origin = {x:null,y:null};
	this.tile_width = 30;
	this.tile_height = 30;
	this.height;
	this.width;

	this.drawBoard = function(base_x, base_y, width, height){
		var remaining_width = width;
		var remaining_height = height;
		this.origin = {x:base_x, y:base_y};
		var curr_x = base_x;
		var curr_y = base_y;
		this.tile_count=0;
		while(((base_y+height)-curr_y) >= this.tile_height+1){
			//console.log("REMAINING_Y vs CURR_Y: ",(base_y+height)-curr_y, "vs", curr_y);
			var row = [];
			while((base_x+width-curr_x) >= this.tile_width+1) {
				//console.log("REMAINING_X vs CURR_X: ",(base_x+width-curr_x), "vs", curr_x);
				var tile = new Tile(curr_x, curr_y, this.tile_height, this.tile_width, contextGrid, contextTiles);
				tile.drawTile();
				row.push(tile);
				curr_x+=this.tile_width;
				this.tile_count++;
			}	
			remaining_width = width;
			curr_x = base_x;
			this.tile_set.push(row);
			curr_y += this.tile_height;
		}
		this.width = this.tile_set[0].length * this.tile_width;
		this.height = this.tile_set.length * this.tile_height;
	}

	this.getTileByCoord = function(x,y){
		x = x - this.origin.x;
		y = y - this.origin.y;
		if(y < 0){return null;}
		if(x < 0){return null;}
		x = (x - (x % this.tile_width))/this.tile_width;
		y = (y - (y % this.tile_height))/this.tile_height;
		if(y >= this.tile_set.length){return null;}
		if(x >= this.tile_set[0].length){return null;}
		return this.tile_set[y][x];
	}

	this.getRowByCoord = function(y){
		y = y - this.origin.y;
		if(y < 0){return null;}
		y = (y - (y % this.tile_height))/this.tile_height;
		if(y >= this.tile_set.length){return null;}
		return y;
	}

	this.getColByCoord = function(x){
		x = x - this.origin.x;
		if(x < 0){return null;}
		x = (x - (x % this.tile_width))/this.tile_width;
		if(x >= this.tile_set[0].length){return null;}
		return x;
	}

	this.showCoverageCone = function(verts){
		for(i = 0; i < this.tile_set.length; i++){
			for (var j = 0; j < this.tile_set[i].length; j++) {
				this.tile_set[i][j].calculateHitCone(verts);
			}
		}
	}

	this.clearTiles = function(){
		for(i = 0; i < this.tile_set.length; i++){
			for (var j = 0; j < this.tile_set[i].length; j++) {
				this.tile_set[i][j].clearTile();
			}
		}
	}

	this.resetHits = function(){
		for(i = 0; i < this.tile_set.length; i++){
			for (var j = 0; j < this.tile_set[i].length; j++) {
				this.tile_set[i][j].isHit = false;
				if(this.tile_set[i][j].entity){
					this.tile_set[i][j].entity.clear()
					this.tile_set[i][j].entity.draw()
				}
			}
		}
	}

	this.colourHits = function(fillstyle){
		for(i = 0; i < this.tile_set.length; i++){
			for (var j = 0; j < this.tile_set[i].length; j++) {
				if(this.tile_set[i][j].isHit){
					this.tile_set[i][j].fillTile(fillstyle);
					if(this.tile_set[i][j].entity){
						this.tile_set[i][j].entity.clear()
						this.tile_set[i][j].entity.draw()
					}
				}
			}
		}
	}

	this.refresh = function(position){
		for(i = 0; i < this.tile_set.length; i++){
			for (var j = 0; j < this.tile_set[i].length; j++) {
				this.tile_set[i][j].drawTile();
			}
		}
	}
}

// Box width
var bw;
// Box height
var bh;
// Mouse currently up or down
var mousedown = false;
//Long Press settings
var longPressTimer;
var longPressOrigin;
var LONG_PRESS_FORGIVENESS = 5;
var LONG_PRESS_VIBRATION = [75];
//Unit Placement Settings
var unitPlacementMode=false;
//Custom settings
var settings = {};

var canvasDiv = document.getElementById("canvasDiv");
var canvasGrid = document.getElementById("canvasGrid");
var contextGrid = canvasGrid.getContext("2d");
var canvasUnits = document.getElementById("canvasUnits");
var contextUnits = canvasUnits.getContext("2d");
var canvasTemplate = document.getElementById("canvasTemplate");
var contextTemplate = canvasTemplate.getContext("2d");
var canvasTiles = document.getElementById("canvasTiles");
var contextTiles = canvasTiles.getContext("2d");

var board;
var template;
var templateSize = parseInt(getParameterByName("size")) || 3;

function getMousePos(canvasGrid, event) {
	var rect = canvasGrid.getBoundingClientRect();
	if(event.touches){event = event.touches[0];}
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function resizeCanvas(canvas, width, height) {
	canvas.width = width;
	canvas.height = height;
}

function vibrate(events){
	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
	//console.log(navigator.vibrate);
	if (navigator.vibrate) {
		navigator.vibrate(...events);
	}
}

function clearAll(){
	template.clear();
	board.clearTiles();
	board.resetHits();
}

function paintTemplate(){
	clearAll();
	if(template.originLocked){template.drawOrigin();}
	template.draw();
	template.calculateHit(board);
	board.colourHits("orange");
}

function placeUnit(pos){
	var tile = board.getTileByCoord(pos.x, pos.y);
	if(tile.entity){tile.entity.clear();tile.entity=null;}
	else{
		tile.entity = new Unit(tile, contextUnits);
		tile.entity.draw();
	}
}

function mousedown_func(evt) {
	evt.preventDefault();
	mousedown = true;
	var mousePos = getMousePos(canvasGrid, evt);
	if(unitPlacementMode){
		placeUnit(mousePos);
		return;
	}
	//console.log(mousedown, mousePos); 
	template.setOrigin(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	if(template.originLocked){
		mousemove_func(evt);
	} else {
		clearAll();
	}
}

function mousemove_func(evt) {
	evt.preventDefault();
	if(mousedown){
		if(unitPlacementMode){
			return;
		}
		var mousePos = getMousePos(canvasGrid, evt);
		template.setVector(mousePos,board.tile_width*templateSize);
		paintTemplate();
	}
}

function mouseup_func(evt) {
	evt.preventDefault();
	mousedown = false;
}

function dblclick_func(evt) {
	evt.preventDefault();
	var mousePos = getMousePos(canvasGrid, evt);
	if(template.originLocked){
		template.unlockOrigin();
		//Move origin and draw new template
		mousedown_func(evt);
		board.clearTiles();
		mousedown=false;
	} else {
		template.lockOrigin();
		template.drawOrigin();
	}
}

function touchstart_func(evt) {
	if(evt.touches.length == 1){
		//Start longpress
		longPressOrigin = {x:evt.touches[0].clientX, y:evt.touches[0].clientY};
		longPressTimer = setTimeout(function() {
			vibrate(LONG_PRESS_VIBRATION);
			dblclick_func(evt);
		}, 500);

		mousedown_func(evt);
	}
}

function touchmove_func(evt) {
	if(evt.touches.length == 1){
		//Cancel longpress if in progress & have moved enough away
		if(longPressOrigin){
			var dx = evt.touches[0].clientX - longPressOrigin.x
			var dy = evt.touches[0].clientY - longPressOrigin.y
			if(Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_FORGIVENESS){
				clearTimeout(longPressTimer);
				longPressOrigin = null;
			}
		}

		mousemove_func(evt);
	}
}

function touchend_func(evt) {
	if(evt.touches.length <= 1){
		//Cancel longpress happening
		clearTimeout(longPressTimer);
		longPressOrigin = null;

		mouseup_func(evt);
	}
}

function resize_func(evt) {
	clearTimeout(resizeTimer);
	//console.log("resize event fired");
	var resizeTimer = setTimeout(function() {
		//console.log("resize event processed");
		init_canvases();
	}, 200);
}

function init_canvases() {
	bw = parseInt(getComputedStyle(canvasDiv, null).getPropertyValue("width").replace("px", ""));
	bh = parseInt(getComputedStyle(canvasDiv, null).getPropertyValue("height").replace("px", ""));

	resizeCanvas(canvasGrid, bw, bh);
	resizeCanvas(canvasUnits, bw, bh);
	resizeCanvas(canvasTemplate, bw, bh);
	resizeCanvas(canvasTiles, bw, bh);

	board = new Board(contextGrid, contextTiles);
	board.drawBoard(Math.floor(((bw-1)%board.tile_width)/2), 0, bw, bh);
	switch((template)?(template.constructor.name):"") {
		case "LineTemplate":
			set_template_line();
			break;
		case "ConeTemplate":
			set_template_cone();
			break;
		case "CircleTemplate":
			set_template_circle();
			break;
		default:
			set_template_circle();
	}

}

function first_load() {
	//Handle url params mostly
	init_canvases();

	var shape = getParameterByName("shape");
	switch(shape) {
		case "line":
			set_template_line();
			break;
		case "cone":
			set_template_cone();
			break;
		case "circle":
			set_template_circle();
			break;
		default:
			set_template_circle();
	}
	templateSize--;
	increment_template_size();

	var origin = getParameterByName("origin"); // in format XxY
	var terminus = getParameterByName("terminus"); // in format XxY
	if(origin && origin.split("x").length==2){
		origin = {x:parseFloat(origin.split("x")[0])+board.origin.x,y:parseFloat(origin.split("x")[1])+board.origin.y};
		console.log("Origin from param: ", origin);
		template.setOrigin(origin);
		template.originLocked = true;
		if(terminus && terminus.split("x").length==2){
			terminus = {x:parseFloat(terminus.split("x")[0])+board.origin.x,y:parseFloat(terminus.split("x")[1])+board.origin.y};
			console.log("Terminus from param: ", terminus);
			template.setTerminus(terminus);
			template.setVector(template.terminus, board.tile_width*templateSize);
			paintTemplate();
		}
	}
}

function increment_template_size(){
	if(templateSize<25){templateSize++;}
	document.getElementById("templateSizeLabel").innerHTML = ""+templateSize*5+"ft";
	template.changeMagnitude(board.tile_width*templateSize);
	if(template.isDrawn){paintTemplate();}

}

function decrement_template_size(){
	if(templateSize>1){templateSize--;}
	document.getElementById("templateSizeLabel").innerHTML = ""+templateSize*5+"ft";
	template.changeMagnitude(board.tile_width*templateSize);
	if(template.isDrawn){paintTemplate();}
}

function set_template_cone(){
	unitPlacementMode = false;
	set_menu_highlight("coneTemplateButton");

	if(template == undefined){
		template = new ConeTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
		return;
	}
	var origin = template.origin;
	var originLock = template.originLocked;
	var terminus = template.terminus;
	var isDrawn = template.isDrawn;
	template = new ConeTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
	template.setOrigin(origin);
	template.setVector(terminus, board.tile_width*templateSize);
	template.originLocked = originLock;
	template.isDrawn = isDrawn;
	//if(settings.hit_threshold){template.minHitFactor = settings.hit_threshold/100;}
	if(template.isDrawn){paintTemplate();}
}

function set_template_line(){
	unitPlacementMode = false;
	set_menu_highlight("lineTemplateButton");

	if(template == undefined){
		template = new LineTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
		return;
	}
	var origin = template.origin;
	var originLock = template.originLocked;
	var terminus = template.terminus;
	var isDrawn = template.isDrawn;
	template = new LineTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
	template.setOrigin(origin);
	template.setVector(terminus, board.tile_width*templateSize);
	template.originLocked = originLock;
	template.isDrawn = isDrawn;
	//if(settings.hit_threshold){template.minHitFactor = settings.hit_threshold/100;}
	if(template.isDrawn){paintTemplate();}
}

function set_template_circle(){
	unitPlacementMode = false;
	set_menu_highlight("circleTemplateButton");

	if(template == undefined){
		template = new CircleTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
		return;
	}
	var origin = template.origin;
	var originLock = template.originLocked;
	var terminus = template.terminus;
	var isDrawn = template.isDrawn;
	template = new CircleTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
	template.setOrigin(origin);
	template.setTerminus(terminus);
	template.setVector(terminus, board.tile_width*templateSize);
	template.setOrigin(origin);
	template.originLocked = originLock;
	template.isDrawn = isDrawn;
	//if(settings.hit_threshold){template.minHitFactor = settings.hit_threshold/100;}
	if(template.isDrawn){paintTemplate();}
}

function toggle_place_units(){
	unitPlacementMode = true;
	set_menu_highlight("placeUnitsButton");
}

function set_menu_highlight(btnId){
	var peers = document.querySelectorAll("#toolbarBtnDiv .highlight");
	for (var i = peers.length - 1; i >= 0; i--) {
	 	peers[i].classList.remove("highlight");
	 }
	document.getElementById(btnId).classList.add("highlight");
}

function open_settings_menu(){
	document.getElementById("settingsDiv").classList.add("active");
}

function close_settings_menu(){
	document.getElementById("settingsDiv").classList.remove("active");
}

function update_settings(){
	var settings_obj = {};
	settings_obj.tile_size = document.querySelector(".tile-size.slider").value;
	settings_obj.hit_threshold = document.querySelector(".hit-threshold.slider").value;
	console.log("UPDATE",settings_obj);
	settings = settings_obj;
}

function slider_update(evt){
	var outputClass = evt.target.classList.value.replace("slider","").replace("input","").trim();
	var output = document.querySelector(".output."+outputClass);
	output.innerHTML = evt.target.value;
	update_settings();
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

first_load();

canvasGrid.addEventListener('mousedown', mousedown_func, {passive:false});
canvasGrid.addEventListener('touchstart', touchstart_func, {passive:false});
canvasGrid.addEventListener('mousemove', mousemove_func, {passive:false});
canvasGrid.addEventListener('touchmove', touchmove_func, {passive:false});
canvasGrid.addEventListener('mouseup', mouseup_func, {passive:false});
canvasGrid.addEventListener('touchend', touchend_func, {passive:false});
canvasGrid.addEventListener('touchcancel', touchend_func, {passive:false});
canvasGrid.addEventListener('dblclick', dblclick_func, {passive:false});
document.defaultView.addEventListener('resize', resize_func, {passive:true});
document.getElementById("incrementTemplateSize").addEventListener('click', increment_template_size, {passive:true});
document.getElementById("decrementTemplateSize").addEventListener('click', decrement_template_size, {passive:true});
document.getElementById("coneTemplateButton").addEventListener('click', set_template_cone, {passive:true});
document.getElementById("lineTemplateButton").addEventListener('click', set_template_line, {passive:true});
document.getElementById("circleTemplateButton").addEventListener('click', set_template_circle, {passive:true});
document.getElementById("placeUnitsButton").addEventListener('click', toggle_place_units, {passive:true});
document.getElementById("settingsButton").addEventListener('click', open_settings_menu, {passive:true});
document.getElementById("settingsCloseButton").addEventListener('click', close_settings_menu, {passive:true});
var sliders = document.getElementsByClassName("slider");
for(var i = 0; i<sliders.length;i++){
	sliders[i].addEventListener('input', slider_update, {passive:true});
}

function Template(context, canvas_width, canvas_height, board) {
	this.size_multiplier = 1;
	this.origin = {x:null, y:null};
	this.originTile = null;
	this.terminus = {x:null, y:null};
	this.originLocked = false;
	this.minHitFactor = 0.5;
	this.isDrawn = false;

	this.drawBox = function(position, tile){
		context.beginPath();
		context.rect(position.x, position.y, 150, 200);
		this.origin = {x:position.x, y:position.y};
		this.originTile = tile;
		context.fillStyle= "red";
		context.fill();
	}

	this.drawLine = function(){
		//Draw line from origin to terminus
		context.beginPath();
		context.moveTo(this.origin.x, this.origin.y);
		context.lineTo(this.terminus.x, this.terminus.y);
		context.lineWidth=2;
		context.strokeStyle = "red";
		context.stroke();
	}

	this.drawPoint = function(point, color="red", radius=5){
		context.beginPath();
		context.arc(point.x, point.y, radius, 0, 2*Math.PI);
		context.lineWidth=2;
		context.strokeStyle = color;
		context.stroke();
		// context.fillStyle = color;
		// context.fill();
	}

	this.fillPoly = function(poly, color){
		//Fill an arbitrary polygon with a color
		context.beginPath();
		context.moveTo(poly[0].x, poly[0].y);
		for (var i = 0; i < poly.length-1; i++) {
			context.lineTo(poly[i+1].x, poly[i+1].y);
		}
		context.lineTo(poly[0].x, poly[0].y);
		context.fillStyle = color;
		context.fill();
	}

	this.calculateHitPoly = function(polyVerts){
		var scan_x = Math.ceil((this.farthestBound(polyVerts, "min", "x") - board.origin.x)/board.tile_width)*board.tile_width+board.origin.x;
		scan_x = Math.max(scan_x, board.origin.x);
		var max_tile_edge_x = Math.ceil((this.farthestBound(polyVerts, "max", "x")-board.origin.x)/board.tile_width)*board.tile_width+board.origin.x;
		max_tile_edge_x = Math.min(max_tile_edge_x, board.origin.x+board.width);

		while(scan_x <= max_tile_edge_x){
			if(scan_x==max_tile_edge_x){this.calculateHitColumn(polyVerts, scan_x);break;}
			var vertical_segments = this.slicePoly(polyVerts, scan_x, true);
			polyVerts = vertical_segments[1];
			var curr_vertical_segment = vertical_segments[0];
			if(!polyVerts){
				//No cut happened
				scan_x += board.tile_width;
				polyVerts = vertical_segments[0];
				continue;
			}
			
			this.calculateHitColumn(curr_vertical_segment, scan_x);
			scan_x += board.tile_width;
			if(vertical_segments.length == 1){break;}
		}
	}

	this.calculateHitColumn = function(polyVerts, curr_x){
		var scan_y = Math.ceil((this.farthestBound(polyVerts, "min", "y")+1-board.origin.y)/board.tile_height)*board.tile_height+board.origin.y;
		scan_y = Math.max(scan_y, board.origin.y);
		var max_tile_edge_y = Math.ceil((this.farthestBound(polyVerts, "max", "y")-board.origin.y)/board.tile_height)*board.tile_height+board.origin.y;
		max_tile_edge_y = Math.min(max_tile_edge_y, board.origin.y+board.height);
		
		while(scan_y <= max_tile_edge_y){
			if(scan_y==max_tile_edge_y){this.calculateHitTile(polyVerts, curr_x, scan_y);break;}
			var horizontal_segments = this.slicePoly(polyVerts, scan_y, false);
			polyVerts = horizontal_segments[1];
			var curr_horizontal_segment = horizontal_segments[0];
			if(!polyVerts){
				//No cut happened
				scan_y += board.tile_height;
				polyVerts = horizontal_segments[0];
				continue;
			}
			this.calculateHitTile(curr_horizontal_segment, curr_x, scan_y);
			scan_y += board.tile_height;
			if(horizontal_segments.length == 1){break;}
		}
	}

	this.calculateHitTile = function(polyVerts, curr_x, curr_y){
		if(!polyVerts){return;}
		if(this.polyArea(polyVerts) > (board.tile_width*board.tile_height*this.minHitFactor)){
			board.getTileByCoord(curr_x-board.tile_width/2, curr_y-board.tile_height/2).isHit = true;
		}
	}

	this.setOrigin = function(position, tile){
		if(this.originLocked){return;}
		this.origin = {x:position.x, y:position.y};
		this.originTile = tile;
	}

	this.drawOrigin = function(){
		this.drawPoint(this.origin, "red", 10);
	}

	this.setTerminus = function(position){
		this.terminus = {x:position.x, y:position.y};
	}

	this.drawTerminus = function(){
		this.drawPoint(this.terminus, "red", 10);
	}

	this.setVector = function(position, length){
		//set terminus based on origin, 2nd position and length
		var delta_x = (position.x - this.origin.x);
		var delta_y = (position.y - this.origin.y);
		var slope = delta_y/delta_x;
		if(delta_y == 0){slope=0;} // If straight horizontal, slope is 0
		if(delta_x == 0){this.terminus = {x:this.origin.x, y:this.origin.y+(length*Math.sign(delta_y))};return;} //If straight vertical, run length vertical
		var slope_length = Math.sqrt(1+(slope*slope));
		var multiplier = length / slope_length;
		this.terminus = {x:this.origin.x+(multiplier*Math.sign(delta_x)), y:this.origin.y+(multiplier*slope*Math.sign(delta_x))};
	}

	this.changeMagnitude = function(length){
		this.setVector(this.terminus, length);
	}

	this.lockOrigin = function(){
		this.originLocked = true;
	}

	this.unlockOrigin = function(){
		this.originLocked = false;
	}

	this.cropPoly = function(polyVerts, topleft, bottomright){
		//Move inward 1 pixel for rounding errors
		if(this.farthestBound(polyVerts, "min", "x") < topleft.x){
			polyVerts = this.slicePoly(polyVerts, topleft.x+1, true)[1];
		}
		if(this.farthestBound(polyVerts, "max", "x") > bottomright.x){
			polyVerts = this.slicePoly(polyVerts, bottomright.x-1, true)[0];
		}
		if(this.farthestBound(polyVerts, "min", "y") < topleft.y){
			polyVerts = this.slicePoly(polyVerts, topleft.y+1, false)[1];
		}
		if(this.farthestBound(polyVerts, "max", "y") > bottomright.y){
			polyVerts = this.slicePoly(polyVerts, bottomright.y-1, false)[0];
		}
		return polyVerts;
	}

	this.slicePoly = function(polyVerts, line, vertical){
		//Adapted from https://github.com/MartyWallace/PolyK
		var that = this;
		var p = polyVerts;
		var a, b;
		var sort;
		var that=this;
		//console.log("Slicing p="+JSON.stringify(p)+" at line "+line+" "+vertical);
		//console.log("Slicing at line "+line+" "+((vertical)?"vertically":"horizontally"));
		if(vertical){
			a = {x:line, y:this.farthestBound(p, "min", "y")-10};
			b = {x:line, y:this.farthestBound(p, "max", "y")+10};
			sort = function (u, v){return that.farthestBound(u, "min", "x") - that.farthestBound(v, "min", "x");}
		} else {
			a = {x:this.farthestBound(p, "min", "x")-10, y:line};
			b = {x:this.farthestBound(p, "max", "x")+10, y:line};
			sort = function (u, v){return that.farthestBound(u, "min", "y") - that.farthestBound(v, "min", "y");}
		}

		var iscs = [];	// intersections
		var ps = p;	// points

		for (var i = 0; i < ps.length; i++) {
			var isc = {x:0, y:0};
			// check if line AB intersects line P[i]P[i+1] (wraps to P[0] at end)
			isc = this.GetLineIntersection(a, b, ps[i], ps[(i + 1) % ps.length], isc);
			var fisc = iscs[0]; // first intersection
			var lisc = iscs[iscs.length - 1]; // last intersection
			// && (isc.x!=ps[i].x || isc.y!=ps[i].y) )
			//If an intersection is found and it is not a dupe of first or last count it
			if (isc && (fisc == null || this.distance(isc, fisc) > 1e-10) && (lisc == null || this.distance(isc, lisc) > 1e-10)) {
				isc.flag = true;
				iscs.push(isc);
				ps.splice(i + 1, 0, isc);
				i++;
			}
		}

		if (iscs.length < 2){return [p.slice(0)]};
		var comp = function (u, v){return that.distance(a, u) - that.distance(a, v);}
		iscs.sort(comp);

		//iscs now contains a sorted array of intersections with edges and line AB

		var pgs = [];
		var dir = 0;
		while (iscs.length > 0) {
			var i0 = iscs[0];
			var i1 = iscs[1];
			// if(i0.x==i1.x && i0.y==i1.y) { iscs.splice(0,2); continue;}
			var index0 = ps.indexOf(i0);
			var index1 = ps.indexOf(i1);
			var solved = false;

			if (this.firstWithFlag(ps, index0) === index1) {
				solved = true;
			} else {
				i0 = iscs[1];
				i1 = iscs[0];
				index0 = ps.indexOf(i0);
				index1 = ps.indexOf(i1);
				if (this.firstWithFlag(ps, index0) === index1) solved = true;
			}
			if (solved) {
				dir--;
				var pgn = this.getPoints(ps, index0, index1);
				pgs.push(pgn);
				ps = this.getPoints(ps, index1, index0);
				i0.flag = i1.flag = false;
				iscs.splice(0, 2);
				if (iscs.length === 0) pgs.push(ps);
			} else {
				dir++;
				iscs.reverse();
			}
			if (dir > 1){break;}
		}
		pgs.sort(sort);
		return pgs;
	}

	this.polyArea = function(polyVerts){
		//Adapted from https://github.com/MartyWallace/PolyK
		var p = polyVerts
		if (p.length < 3) return 0
		var l = p.length-1
		var sum = 0
		for (var i = 0; i < l; i++) {
			sum += (p[i+1].x - p[i].x) * (p[i].y + p[i+1].y)
		}
		sum += (p[0].x - p[l].x) * (p[l].y + p[0].y)
		return Math.abs(-sum * 0.5)
	}

	this.farthestBound = function(polyVerts, minmax, xy){
		//Given either "min" or "max" and "x" or "y", find the bound that fits that description
		if(minmax == "min"){
			return Math.min(...(polyVerts.map(vert => vert[xy])))
		} else if (minmax == "max"){
			return Math.max(...(polyVerts.map(vert => vert[xy])))
		}
		return null;
	}

	this.distance = function(a, b){
		var dx = b.x - a.x
		var dy = b.y - a.y
		return Math.sqrt(dx * dx + dy * dy)
	}

	this.GetLineIntersection = function(a1, a2, b1, b2, c) {
		var dax = (a1.x - a2.x)
		var dbx = (b1.x - b2.x)
		var day = (a1.y - a2.y)
		var dby = (b1.y - b2.y)

		var Den = dax * dby - day * dbx

		if (Den === 0) { return null } // parallel

		var A = (a1.x * a2.y - a1.y * a2.x)
		var B = (b1.x * b2.y - b1.y * b2.x)

		var I = c
		I.x = (A * dbx - dax * B) / Den
		I.y = (A * dby - day * B) / Den

		if (this.InRectangle(I, a1, a2) && this.InRectangle(I, b1, b2)) {
			return I
		}
		return null
	}

	this.firstWithFlag = function(points, index){
		var n = points.length
		while (true) {
			index = (index + 1) % n
			if (points[index].flag) {
				return index
			}
		}
	}

	this.getPoints = function(points, index0, index1) {
		//Return points from index0 to index1, cycled
		var n = points.length
		var result = []
		if (index1 < index0) index1 += n
		for (var i = index0; i <= index1; i++) { result.push(points[i % n]) }
		return result
	}

	this.InRectangle = function(a, b, c) {
		var minx = Math.min(b.x, c.x)
		var maxx = Math.max(b.x, c.x)
		var miny = Math.min(b.y, c.y)
		var maxy = Math.max(b.y, c.y)

		if (minx === maxx) { return (miny <= a.y && a.y <= maxy) }
		if (miny === maxy) { return (minx <= a.x && a.x <= maxx) }

		// return (minx <= a.x && a.x <= maxx && miny <= a.y && a.y <= maxy)
		return (minx <= a.x + 1e-10 && a.x - 1e-10 <= maxx && miny <= a.y + 1e-10 && a.y - 1e-10 <= maxy)
	}

	this.clear = function(){
		this.isDrawn = false;
		context.clearRect(0, 0, canvas_width, canvas_height);
	}
}

function ConeTemplate(context, canvas_width, canvas_height, board) {
	Template.call(this, context, canvas_width, canvas_height, board);

	this.getVerts = function(){
		var delta_x = (this.terminus.x - this.origin.x);
		var delta_y = (this.terminus.y - this.origin.y);

		var vert_1 = {x:(this.terminus.x - delta_y/2), y:(this.terminus.y + delta_x/2)};
		var vert_2 = {x:(this.terminus.x + delta_y/2), y:(this.terminus.y - delta_x/2)};

		return [this.origin, vert_1, vert_2, this.terminus];
	}

	this.draw = function(){
		//Draw line from origin to terminus
		//add cross line running at opposite slope through terminus for same length
		this.isDrawn = true;
		var verts = this.getVerts();
		context.beginPath();
		context.moveTo(verts[0].x, verts[0].y);
		context.lineTo(verts[1].x, verts[1].y);
		context.lineTo(verts[2].x, verts[2].y);
		context.lineTo(verts[0].x, verts[0].y);
		context.lineWidth=2;
		context.strokeStyle = "red";
		context.stroke();
	}

	this.calculateHit = function(){
		var verts = this.getVerts();
		//Get leftmost tile edge and start scan from there
		var poly = [verts[0],verts[1],verts[2]];
		poly = this.cropPoly(poly, board.origin, {x:board.origin.x+board.width, y:board.origin.y+board.height});
		this.calculateHitPoly(poly);
	}
}

function LineTemplate(context, canvas_width, canvas_height, board) {
	Template.call(this, context, canvas_width, canvas_height, board);

	this.getVerts = function(){
		var delta_x = (this.terminus.x - this.origin.x);
		var delta_y = (this.terminus.y - this.origin.y);
		var slope = delta_x/delta_y;
		var lineWidth = board.tile_width;

		var x_change = (lineWidth/2)/Math.sqrt(1+(slope*slope));
		var y_change = (x_change*slope);

		if(delta_x == 0){x_change = lineWidth/2;y_change=0;}
		if(delta_y == 0){y_change = lineWidth/2;x_change=0;}

		var vert_1 = {x:(this.origin.x + x_change), y:(this.origin.y - y_change)};
		var vert_2 = {x:(this.origin.x - x_change), y:(this.origin.y + y_change)};
		var vert_3 = {x:(this.terminus.x - x_change), y:(this.terminus.y + y_change)};
		var vert_4 = {x:(this.terminus.x + x_change), y:(this.terminus.y - y_change)};

		return [this.origin, vert_1, vert_2, vert_3, vert_4, this.terminus];
	}

	this.draw = function(){
		this.isDrawn = true;
		var verts = this.getVerts();
		context.beginPath();
		context.moveTo(verts[1].x, verts[1].y);
		context.lineTo(verts[2].x, verts[2].y);
		context.lineTo(verts[3].x, verts[3].y);
		context.lineTo(verts[4].x, verts[4].y);
		context.lineTo(verts[1].x, verts[1].y);
		context.lineWidth=2;
		context.strokeStyle = "red";
		context.stroke();
	}

	this.calculateHit = function(){
		var verts = this.getVerts();
		//Get leftmost tile edge and start scan from there
		var poly = [verts[1],verts[2],verts[3],verts[4]];
		poly = this.cropPoly(poly, board.origin, {x:board.origin.x+board.width, y:board.origin.y+board.height});
		this.calculateHitPoly(poly);
	}
}

function CircleTemplate(context, canvas_width, canvas_height, board) {
	Template.call(this, context, canvas_width, canvas_height, board);
	var radius;
	var terminus_delta;
	//Terminus will be used to hold the radius of the circle

	this.getVerts = function(){
		return [this.origin, {x:this.origin.x+this.radius, y:this.origin.y}];
	}

	this.draw = function(){
		this.isDrawn = true;
		var verts = this.getVerts();
		context.beginPath();
		context.arc(verts[0].x, verts[0].y, Math.abs(verts[0].x-verts[1].x),0,2*Math.PI);
		context.lineWidth=2;
		context.strokeStyle = "red";
		context.stroke();
	}

	this.calculateHit = function(){
		var verts = this.getVerts();
		var start_row = board.getRowByCoord(verts[0].y-this.radius) || 0;
		var start_col = board.getColByCoord(verts[0].x-this.radius) || 0;
		var end_row =   board.getRowByCoord(verts[0].y+this.radius) || board.tile_set.length;
		var end_col =   board.getColByCoord(verts[0].x+this.radius) || board.tile_set[0].length;
		// console.log("GET HIT -----");
		// console.log("ENDCOL = ",end_col);

		var x_intersects = [];
		for (var x = start_col; x <= end_col; x++) {
			// console.log("CURRENT COL ", x);
			var x_line = board.origin.x+x*board.tile_width;
			var delta_x = verts[0].x - x_line;
			if(Math.abs(delta_x)>this.radius){continue;}
			var delta_y = this.radius;
			if(delta_x!=0){delta_y=Math.sqrt((this.radius*this.radius)-(delta_x*delta_x));}
			x_intersects.push({x:x_line, y:verts[0].y+delta_y});
			x_intersects.push({x:x_line, y:verts[0].y-delta_y});
		}

		var y_intersects = [];
		for (var y = start_row; y <= end_row; y++) {
			// console.log("CURRENT ROW ", y);
			var y_line = board.origin.y+y*board.tile_height;
			var delta_y = verts[0].y - y_line;
			if(Math.abs(delta_y)>this.radius){continue;}
			var delta_x = this.radius;
			if(delta_y!=0){delta_x=Math.sqrt((this.radius*this.radius)-(delta_y*delta_y));}
			y_intersects.push({x:verts[0].x+delta_x, y:y_line});
			y_intersects.push({x:verts[0].x-delta_x, y:y_line});
		}
		sort = function (u, v){return u.x - v.x;}
		y_intersects.sort(sort);
		// for (var i = x_intersects.length - 1; i >= 0; i--) {
		// 	this.drawPoint(x_intersects[i], "green", 2); 
		// }
		// for (var i = y_intersects.length - 1; i >= 0; i--) {
		// 	this.drawPoint(y_intersects[i], "blue", 2); 
		// }

		var y_ints_in_col = [];
		if(x_intersects[0] && x_intersects[0].x != board.origin.x){
			while(y_intersects.length > 0 && y_intersects[0].x >= x_intersects[0].x-board.tile_width && y_intersects[0].x <= x_intersects[0].x){
				y_ints_in_col.push(y_intersects.shift());
			}
			this.calculateHitColumnSlice([], x_intersects.slice(0,2), y_ints_in_col);
		}
		while(x_intersects.length >=2 && x_intersects[0].x < (board.origin.x + board.width)){
			y_ints_in_col = [];
			while(y_intersects.length > 0 && y_intersects[0].x < x_intersects[0].x){
				y_intersects.shift();
			}
			while(y_intersects.length > 0 && y_intersects[0].x >= x_intersects[0].x && y_intersects[0].x <= (x_intersects[0].x+board.tile_width)){
				y_ints_in_col.push(y_intersects.shift());
			}
			this.calculateHitColumnSlice(x_intersects.slice(0,2), x_intersects.slice(2,4), y_ints_in_col);
			x_intersects = x_intersects.slice(2);
		}
	}

	this.calculateHitColumnSlice = function(leftwall_ints, rightwall_ints, y_ints){
		//Split into single tiles, each should have 2 intersections
		// console.log("COLUMN SET -----");
		// console.log(leftwall_ints);
		// console.log(rightwall_ints);
		// console.log(y_ints);

		var col = (leftwall_ints.length>0)? leftwall_ints[0].x : rightwall_ints[0].x-board.tile_width;
		col = board.getColByCoord(col);
		//console.log("COL ",col," = ", (col*board.tile_width)+board.origin.x, " to ", ((col*board.tile_height)+board.tile_height+board.origin.x));
		var start_coord, end_coord;
		if((leftwall_ints.length > 0) && (rightwall_ints.length > 0)){
			start_coord = Math.min(leftwall_ints[1].y,rightwall_ints[1].y);
			end_coord = Math.max(leftwall_ints[0].y,rightwall_ints[0].y);
		}
		else if(leftwall_ints.length>0){
			start_coord = leftwall_ints[1].y;
			end_coord = leftwall_ints[0].y;
		} else {
			start_coord = rightwall_ints[1].y;
			end_coord = rightwall_ints[0].y;
		}
		var start_row = Math.max(board.getRowByCoord(start_coord), 0);
		var end_row =   Math.min(((board.getRowByCoord(end_coord)===null)?board.tile_set.length:board.getRowByCoord(end_coord)), board.tile_set.length-1);
		if(start_coord>=(board.origin.y+(board.tile_set.length*board.tile_height))){start_row=(end_row+1);}
		if(end_coord<=board.origin.y){end_row=-1;}
		// console.log("COL ",col," = ", start_coord, " to ", end_coord);
		// console.log("COL ",col," = ", start_row, " to ", end_row);
		var tile_int_set = [];
		for (var y = start_row; y <= end_row; y++) {
			// console.log("ROW ",y," = ", (y*board.tile_height)+board.origin.y, " to ", ((y*board.tile_height)+board.tile_height)+board.origin.y);

			tile_int_set = [];
			for (var i = rightwall_ints.length - 1; i >= 0; i--) {
				if(board.getRowByCoord(rightwall_ints[i].y)==y || rightwall_ints[i].y == ((y*board.tile_height)+board.tile_height)+board.origin.y){
					tile_int_set.push(rightwall_ints[i]);
				}
			}
			for (var i = leftwall_ints.length - 1; i >= 0; i--) {
				if(board.getRowByCoord(leftwall_ints[i].y)==y || leftwall_ints[i].y == ((y*board.tile_height)+board.tile_height)+board.origin.y){
					tile_int_set.push(leftwall_ints[i]);
				}
			}
			for (var i = y_ints.length - 1; i >= 0; i--) {
				if(y_ints[i].y == (y*board.tile_height)+board.origin.y || y_ints[i].y == ((y*board.tile_height)+board.tile_height)+board.origin.y){
					tile_int_set.push(y_ints[i]);
				}
			}
			this.calculateHitTile(col, y, tile_int_set);
		}

	}

	this.calculateHitTile = function(col, row, ints){
		//Split into single tiles, each should have 4 intersections or 2 or 0, if 0 skip
		// console.log("TILE -----");
		// console.log(col,"x",row);
		// console.log(JSON.stringify(ints));

		for (var i = 0; i < ints.length; i++) {
			for (var j = i+1; j < ints.length; j++) {
				if(JSON.stringify(ints[j]) === JSON.stringify(ints[i])){
					ints.splice(j, 1);
				}
			}
		}

		if(ints.length==0){board.tile_set[row][col].isHit=true;return;} // If there are no intersections it is covered fully.
		if(ints.length==1){
			//If there is one intersection it is a corner, check corner coverage
			var tile = board.tile_set[row][col]
			if(!this.isPointInCircle(tile.tile_corners[0])){return;}
			if(!this.isPointInCircle(tile.tile_corners[1])){return;}
			if(!this.isPointInCircle(tile.tile_corners[2])){return;}
			if(!this.isPointInCircle(tile.tile_corners[3])){return;}
			tile.isHit = true;
			return;
		}
		//if(ints.length%2 != 0){console.log("ERROR AT TILE ",row,"x",col);console.log(ints);console.log(this.origin);board.tile_set[row][col].fillTile("purple");}
			
		// context.beginPath();
		// context.moveTo(ints[0].x, ints[0].y);
		// for(var i = 1; i<ints.length;i++){
		// 	context.lineTo(ints[i].x, ints[i].y);
		// }
		// context.lineTo(ints[0].x, ints[0].y);
		// context.lineWidth=1;
		// context.strokeStyle = "blue";
		// context.stroke();

		var poly = ints.slice();
		for(var i = 0; i < 4; i++){
			if(this.isPointInCircle(board.tile_set[row][col].tile_corners[i])){
				poly.push(board.tile_set[row][col].tile_corners[i]);
			}
		}

		var avgPoint = this.getAveragePoint(poly);
		var that=this;
		sort = function (u, v){return that.angleBetweenPoints(avgPoint, u) - that.angleBetweenPoints(avgPoint, v);}
		poly.sort(sort);
		// this.fillPoly(ints, "#"+((1<<24)*Math.random()|0).toString(16));
		// this.fillPoly(ints, "red");
		var polyArea = this.polyArea(poly);
		var curvedArea = 0;
		if(polyArea > this.minHitFactor*(board.tile_width*board.tile_height)){board.tile_set[row][col].isHit=true;return;}
		else if (ints.length==2){
			var origin = this.getVerts()[0];
			var angle = Math.abs(this.angleBetweenPoints(origin, ints[1])-this.angleBetweenPoints(origin, ints[0]));
			angle = Math.PI*angle/180;
			if(angle > Math.PI){angle = (2*Math.PI)-angle;}
			curvedArea += (this.radius * this.radius * 0.5)*(angle-Math.sin(angle));
		}
		if(polyArea+curvedArea > this.minHitFactor*(board.tile_width*board.tile_height)){board.tile_set[row][col].isHit=true;}
	}

	this.isPointInCircle = function(point){
		//Round distance to nearest pixel
		return (Math.floor(this.distance(point, this.origin)) <= this.radius);
	}

	this.angleBetweenPoints = function(a, b){
		return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
	}

	this.getAveragePoint = function(pointArr){
		var total_x = 0;
		var total_y = 0;
		for(var i=0; i<pointArr.length; i++){
			total_x += pointArr[i].x;
			total_y += pointArr[i].y;
		}
		return {x:(total_x/pointArr.length), y:(total_y/pointArr.length)};
	}

	this.setOrigin = function(position, tile){
		if(this.originLocked){return;}
		this.origin = {x:position.x, y:position.y};
		this.originTile = tile;
		if(this.terminus_delta != null){
			this.terminus = {x:this.origin.x - this.terminus_delta.x, y:this.origin.y - this.terminus_delta.y};
		}
	}

	this.setTerminus = function(position){
		//Overload this to disallow moving terminus
		//Store terminus as offset from origin
		if(this.terminus_delta == null || (this.terminus_delta.x==0&&this.terminus_delta.y==0)){
			this.terminus_delta = {x:this.origin.x - position.x, y:this.origin.y - position.y};
			this.terminus=position;
		}
		this.setOrigin(position);
	}

	this.setVector = function(position, length){
		//Move origin to position and set radius to length
		this.radius = length;
		this.setOrigin(position);
	}

	this.changeMagnitude = function(length){
		//Dont move center on magnitude change
		this.radius = length;
	}
}

function Tile(x, y, height, width, contextGrid, contextTile){
	this.is_hex = false;
	this.entity;
	this.has_caster = false;
	this.isHit = false;
	this.tile_corners = [{"x":x,"y":y},{"x":x+width,"y":y},{"x":x+width,"y":y+height},{"x":x,"y":y+height}]

	this.drawTile = function(){
		contextGrid.beginPath();
		//0.5 because it marks the center of the 1px wide line
		contextGrid.moveTo(0.5 + this.tile_corners[0].x, 0.5 + this.tile_corners[0].y);
		contextGrid.lineTo(0.5 + this.tile_corners[1].x, 0.5 + this.tile_corners[1].y);
		contextGrid.lineTo(0.5 + this.tile_corners[2].x, 0.5 + this.tile_corners[2].y);
		contextGrid.lineTo(0.5 + this.tile_corners[3].x, 0.5 + this.tile_corners[3].y);
		contextGrid.lineTo(0.5 + this.tile_corners[0].x, 0.5 + this.tile_corners[0].y);

		contextGrid.strokeStyle = "black";
		contextGrid.stroke();
	}

	this.fillTile = function(fillStyle="red"){
		contextTile.beginPath();
		contextTile.rect(x+1, y+1, width-1, height-1);
		contextTile.fillStyle= fillStyle;
		contextTile.fill();
	}

	this.clearTile = function(){
		contextTile.clearRect(x+1, y+1, width-1, height-1);
	}

	this.calculateHitCone = function(template){
		//Verts are Origin, RightSide(from O), LeftSide(From O), Terminus
		var verts = template.getConeVerts();
		var max_coord = {x:Math.max(verts[0].x, verts[1].x, verts[2].x), y:Math.max(verts[0].y, verts[1].y, verts[2].y)};
		var min_coord = {x:Math.min(verts[0].x, verts[1].x, verts[2].x), y:Math.min(verts[0].y, verts[1].y, verts[2].y)};
		if(this.tile_corners[2].x < min_coord.x || this.tile_corners[2].y < min_coord.y){
			//The highest x/y of the square is before the lowest x/y of the template, cannot be touched
			this.isHit = false;
			this.clearTile();
			return;
		}
		if(this.tile_corners[0].x > max_coord.x || this.tile_corners[0].y > max_coord.y){
			//The lowest x/y of the square is after the highest x/y of the template, cannot be touched
			this.isHit = false;
			this.clearTile();
			return;
		}
		cornersHit =(1*this.isPointInTriangle(this.tile_corners[0],verts))+
					(1*this.isPointInTriangle(this.tile_corners[1],verts))+
					(1*this.isPointInTriangle(this.tile_corners[2],verts))+
					(1*this.isPointInTriangle(this.tile_corners[3],verts));
		if(cornersHit >= 3){
			//If the corners are covered by a non-concave shape, square is hit
			this.fillTile("#FF3300");
			this.isHit = true;
			return;
		} else if(cornersHit == 2){
			//2 corners is maybe
			this.fillTile("#FF7700");
			this.isHit = false;
			return;
		}  else if(cornersHit == 1){
			//1 corner is maybe. 0 corners is definitely no (I think)
			this.fillTile("#FFCC00");
			this.isHit = false;
			return;
		}
		this.isHit = false;
		this.clearTile();
	}

	this.isPointInTriangle = function(p, tri){
		var A = 0.5*(-tri[1].y * tri[2].x + tri[0].y * (-tri[1].x + tri[2].x) + tri[0].x * (tri[1].y - tri[2].y) + tri[1].x * tri[2].y);
		var sign = Math.sign(A);
		var s = (tri[0].y * tri[2].x - tri[0].x * tri[2].y + (tri[2].y - tri[0].y) * p.x + (tri[0].x - tri[2].x) * p.y) * sign;
		var t = (tri[0].x * tri[1].y - tri[0].y * tri[1].x + (tri[0].y - tri[1].y) * p.x + (tri[1].x - tri[0].x) * p.y) * sign;
		return s > 0 && t > 0 && (s + t) < 2 * A * sign;
	}

}

function Unit(tile, context){
	this.radius=12;
	this.hitColor="red";
	this.regColor="green";

	this.draw = function(){
		var center = {x:((tile.tile_corners[1].x+tile.tile_corners[0].x)/2), y:((tile.tile_corners[3].y+tile.tile_corners[0].y)/2)};
		context.beginPath();
		context.arc(center.x, center.y, this.radius, 0, 2*Math.PI);
		context.fillStyle = (tile.isHit)?this.hitColor:this.regColor;
		context.fill();
	}

	this.clear = function(){
		context.clearRect(tile.tile_corners[0].x, tile.tile_corners[0].y, (tile.tile_corners[1].x-tile.tile_corners[0].x), (tile.tile_corners[3].y-tile.tile_corners[0].y));
	}

}

