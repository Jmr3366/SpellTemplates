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

