function Board(context) {
	this.hex_mode = false;
	this.tile_count = 0;
	this.tile_set = [];
	this.tile_size_multiplier = 1;

	this.drawBoard = function(base_x, base_y, width, height){
		var remaining_width = width;
		var remaining_height = height;
		var T = new Tile();
		var tile_width = T.BASE_TILE_WIDTH * this.tile_size_multiplier;
		var tile_height = T.BASE_TILE_HEIGHT * this.tile_size_multiplier;
		var curr_x = base_x;
		var curr_y = base_y;
		while(((base_y+height)-curr_y) >= tile_height){
			var row = [];
			while((base_x+width-curr_x) >= tile_width) {
				var tile = new Tile(curr_x, curr_y, this.tile_size_multiplier, context);
				tile.drawTile();
				row.push(tile);
				curr_x+=tile_width;
			}	
			remaining_width = width;
			curr_x = base_x;
			this.tile_set.push(row);
			curr_y += tile_height;
		}
	}

	this.drawBox = function(position){
		context.beginPath();
		context.rect(position.x, position.y, 150, 200);
		context.fillStyle= "red";
		context.fill();
		this.refresh();
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
var bw = 800;
// Box height
var bh = 800;
// Padding
var p = 10;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var board = new Board(context);

function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

board.drawBoard(p, p, bw, bh);

canvas.addEventListener('click', function(evt) {
	var mousePos = getMousePos(canvas, evt);
	console.log(mousePos); 
	board.drawBox(mousePos);
}, false);

function Tile(x, y, size_mul, context){
	this.is_hex = false;
	this.width = 0;
	this.height = 0;
	this.has_entity = false;
	this.has_caster = false;
	this.covered = false;
	this.BASE_TILE_WIDTH = 40;
	this.BASE_TILE_HEIGHT = 40;

	this.drawTile = function(){
		var tile_width = this.BASE_TILE_WIDTH * size_mul;
		var tile_height = this.BASE_TILE_HEIGHT * size_mul;
		context.beginPath();
		context.moveTo(0.5 + x, 0.5 + y);
		context.lineTo(0.5 + x + tile_width, 0.5 + y);
		context.lineTo(0.5 + x + tile_width, 0.5 + y + tile_height);
		context.lineTo(0.5 + x, 0.5 + y + tile_height);
		context.lineTo(0.5 + x, 0.5 + y);

		context.strokeStyle = "black";
		context.stroke();
	}

}

