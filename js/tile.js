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

