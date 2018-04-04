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
				var tile = new Tile();
				tile.drawTile(curr_x, curr_y, this.tile_size_multiplier, context);
				row.push(tile);
				curr_x+=tile_width;
			}	
			remaining_width = width;
			curr_x = base_x;
			this.tile_set.push(row);
			curr_y += tile_height;
		}
	}
}