function Unit(tile, context){
	this.radius=12;
	this.hitColour="#3B6182";
	this.regColour="#3B6182";

	this.draw = function(){
		var center = {x:((tile.tile_corners[1].x+tile.tile_corners[0].x)/2), y:((tile.tile_corners[3].y+tile.tile_corners[0].y)/2)};
		context.beginPath();
		context.arc(center.x, center.y, this.radius, 0, 2*Math.PI);
		context.fillStyle = (tile.isHit)?this.hitColour:this.regColour;
		context.fill();
		if(tile.isHit){
			this.crossOut();
		}
	}

	this.crossOut = function(){
		context.beginPath();
		context.moveTo(tile.tile_corners[0].x+1,tile.tile_corners[0].y+1);
		context.lineTo(tile.tile_corners[2].x-1,tile.tile_corners[2].y-1);
		context.moveTo(tile.tile_corners[1].x-1,tile.tile_corners[1].y+1);
		context.lineTo(tile.tile_corners[3].x+1,tile.tile_corners[3].y-1);
		context.strokeStyle = tile.currentFill
		context.lineWidth = 2;
		context.stroke();
	}

	this.setTile = function(newTile){
		tile = newTile;
	}

	this.clear = function(){
		context.clearRect(tile.tile_corners[0].x, tile.tile_corners[0].y, (tile.tile_corners[1].x-tile.tile_corners[0].x), (tile.tile_corners[3].y-tile.tile_corners[0].y));
	}

}

