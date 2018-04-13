function Board(contextGrid, contextTiles) {
	this.hex_mode = false;
	this.tile_count = 0;
	this.tile_set = [];
	this.tile_size_multiplier = 1;
	this.origin = {x:null,y:null};
	this.tile_width;
	this.tile_height;

	this.drawBoard = function(base_x, base_y, width, height){
		var remaining_width = width;
		var remaining_height = height;
		var T = new Tile();
		this.tile_width = T.BASE_TILE_WIDTH * this.tile_size_multiplier;
		this.tile_height = T.BASE_TILE_HEIGHT * this.tile_size_multiplier;
		this.origin = {x:base_x, y:base_y};
		var curr_x = base_x;
		var curr_y = base_y;
		this.tile_count=0;
		while(((base_y+height)-curr_y) >= this.tile_height){
			var row = [];
			while((base_x+width-curr_x) >= this.tile_width) {
				var tile = new Tile(curr_x, curr_y, this.tile_size_multiplier, contextGrid, contextTiles);
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
	}

	this.getTileByCoord = function(x,y){
		x = x - this.origin.x;
		y = y - this.origin.y;
		x = (x - (x % this.tile_width))/this.tile_width;
		y = (y - (y % this.tile_height))/this.tile_height;
		if(y > this.tile_set.length){return null;}
		if(y > this.tile_set[0].length){return null;}
		return this.tile_set[y][x];
	}

	this.showCoverageCone = function(verts){
		for(i = 0; i < this.tile_set.length; i++){
			for (var j = 0; j < this.tile_set[i].length; j++) {
				this.tile_set[i][j].calculateHitCone(verts);
				if(this.tile_set[i][j].isHit){this.tile_set[i][j].fillTile("orange");}
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
var bw = document.getElementById("canvasGrid").width;
// Box height
var bh = document.getElementById("canvasGrid").height;
// Padding
var p = 10;
// Mouse currently up or down
var mousedown = false;

var canvasGrid = document.getElementById("canvasGrid");
var contextGrid = canvasGrid.getContext("2d");
var canvasUnits = document.getElementById("canvasUnits");
var contextUnits = canvasUnits.getContext("2d");
var canvasTemplate = document.getElementById("canvasTemplate");
var contextTemplate = canvasTemplate.getContext("2d");
var canvasTiles = document.getElementById("canvasTiles");
var contextTiles = canvasTiles.getContext("2d");

var board = new Board(contextGrid, contextTiles);
var template = new Template(contextTemplate, canvasTemplate.width, canvasTemplate.height);

function getMousePos(canvasGrid, event) {
	var rect = canvasGrid.getBoundingClientRect();
	if(event.touches){event = event.touches[0];}
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function mousedown_func(evt) {
	evt.preventDefault();
	mousedown = true;
	var mousePos = getMousePos(canvasGrid, evt);
	//console.log(mousedown, mousePos); 
	template.clear();
	//template.drawBox(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	template.setOrigin(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	mousemove_func(evt);
}

function mousemove_func(evt) {
	evt.preventDefault();
	if(mousedown){
		var mousePos = getMousePos(canvasGrid, evt);
		template.setVector(mousePos,200);
		template.clear();
		template.drawCone();
		if(template.originLocked){template.drawOrigin();}
	}
}

function mouseup_func(evt) {
	evt.preventDefault();
	mousedown = false;
	board.showCoverageCone(template.getConeVerts());
}

function dblclick_func(evt) {
	evt.preventDefault();
	var mousePos = getMousePos(canvasGrid, evt);
	if(template.originLocked){
		template.unlockOrigin();
		//Move origin and draw new template
		mousedown_func(evt);
		mousedown=false;
	} else {
		template.lockOrigin();
		template.drawOrigin();
	}
}

board.drawBoard(p, p, bw, bh);

canvasGrid.addEventListener('mousedown', function(evt){mousedown_func(evt)}, false);
canvasGrid.addEventListener('touchstart', function(evt){mousedown_func(evt)}, false);
canvasGrid.addEventListener('mousemove', function(evt){mousemove_func(evt)}, false);
canvasGrid.addEventListener('touchmove', function(evt){mousemove_func(evt)}, false);
canvasGrid.addEventListener('mouseup', function(evt){mouseup_func(evt)}, false);
canvasGrid.addEventListener('touchend', function(evt){mouseup_func(evt)}, false);
canvasGrid.addEventListener('dblclick', function(evt){dblclick_func(evt)}, false);
function Template(context, canvas_width, canvas_height) {
	this.size_multiplier = 1;
	this.origin = {x:null, y:null};
	this.originTile = null;
	this.terminus = {x:null, y:null};
	this.originLocked = false;

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

	this.getConeVerts = function(){
		var delta_x = (this.terminus.x - this.origin.x);
		var delta_y = (this.terminus.y - this.origin.y);

		var vert_1 = {x:(this.terminus.x - delta_y/2), y:(this.terminus.y + delta_x/2)};
		var vert_2 = {x:(this.terminus.x + delta_y/2), y:(this.terminus.y - delta_x/2)};

		return [this.origin, vert_1, vert_2, this.terminus];
	}

	this.drawCone = function(){
		//Draw line from origin to terminus
		//add cross line running at opposite slope through terminus for same length
		var verts = this.getConeVerts();
		context.beginPath();
		context.moveTo(verts[0].x, verts[0].y);
		context.lineTo(verts[1].x, verts[1].y);
		context.lineTo(verts[2].x, verts[2].y);
		context.lineTo(verts[0].x, verts[0].y);
		context.lineWidth=2;
		context.strokeStyle = "red";
		context.stroke();
	}

	this.setOrigin = function(position, tile){
		if(this.originLocked){return;}
		this.origin = {x:position.x, y:position.y};
		this.originTile = tile;
	}

	this.drawOrigin = function(){
		context.beginPath();
		context.arc(this.origin.x, this.origin.y, 10, 0, 2*Math.PI);
		context.fillStyle = "red";
		context.fill();
	}

	this.setTerminus = function(position){
		this.terminus = {x:position.x, y:position.y};
	}

	this.setVector = function(position, length=200){
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

	this.lockOrigin = function(){
		this.originLocked = true;
	}

	this.unlockOrigin = function(){
		this.originLocked = false;
	}

	this.clear = function(){
		context.clearRect(0, 0, canvas_width, canvas_height);
	}
}

function Tile(x, y, size_mul, contextGrid, contextTile){
	this.is_hex = false;
	this.width = 0;
	this.height = 0;
	this.has_entity = false;
	this.has_caster = false;
	this.isHit = false;
	this.BASE_TILE_WIDTH = 40;
	this.BASE_TILE_HEIGHT = 40;
	this.tile_width = this.BASE_TILE_WIDTH * size_mul;
	this.tile_height = this.BASE_TILE_HEIGHT * size_mul;
	this.tile_corners = [{"x":x,"y":y},{"x":x+this.tile_width,"y":y},{"x":x+this.tile_width,"y":y+this.tile_height},{"x":x,"y":y+this.tile_height}]

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
		contextTile.rect(x+1, y+1, this.tile_width-1, this.tile_height-1);
		contextTile.fillStyle= fillStyle;
		contextTile.fill();
	}

	this.clearTile = function(){
		contextTile.clearRect(x+1, y+1, this.tile_width-1, this.tile_height-1);
	}

	this.calculateHitCone = function(verts){
		//Verts are Origin, RightSide(from O), LeftSide(From O), Terminus
		var max_coord = {x:Math.max(verts[0].x, verts[1].x, verts[2].x), y:Math.max(verts[0].y, verts[1].y, verts[2].y)};
		var min_coord = {x:Math.min(verts[0].x, verts[1].x, verts[2].x), y:Math.min(verts[0].y, verts[1].y, verts[2].y)};
		if(this.tile_corners[2].x < min_coord.x || this.tile_corners[2].y < min_coord.y){
			//The highest x/y of the square is before the lowest x/y of the template, cannot be touched
			this.fillTile("green");
			this.isHit = false;
			return;
		}
		if(this.tile_corners[0].x > max_coord.x || this.tile_corners[0].y > max_coord.y){
			//The lowest x/y of the square is after the highest x/y of the template, cannot be touched
			this.fillTile("blue");
			this.isHit = false;
			return;
		}
		this.clearTile();
	}

}

