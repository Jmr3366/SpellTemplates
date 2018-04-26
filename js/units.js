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

