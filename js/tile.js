function Tile(){
	this.x = null;
	this.y = null;
	this.is_hex = false;
	this.width = 0;
	this.height = 0;
	this.has_entity = false;
	this.has_caster = false;
	this.covered = false;
	this.BASE_TILE_WIDTH = 40;
	this.BASE_TILE_HEIGHT = 40;

	this.drawTile = function(base_x, base_y, size_mul, context){
		var tile_width = this.BASE_TILE_WIDTH * size_mul;
		var tile_height = this.BASE_TILE_HEIGHT * size_mul;
		context.moveTo(0.5 + base_x, 0.5 + base_y);
		context.lineTo(0.5 + base_x + tile_width, 0.5 + base_y);
		context.lineTo(0.5 + base_x + tile_width, 0.5 + base_y + tile_height);
		context.lineTo(0.5 + base_x, 0.5 + base_y + tile_height);
		context.lineTo(0.5 + base_x, 0.5 + base_y);

		context.strokeStyle = "black";
		context.stroke();
	}

}