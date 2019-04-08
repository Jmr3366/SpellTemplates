function Unit(tile, shape, context){
	this.radius=12;
	this.hitColour=currentTheme.colours[9];
	this.colour=currentTheme.colours[9];
	this.shape=shape;

	this.draw = function(){
		var center = {x:((tile.tile_corners[1].x+tile.tile_corners[0].x)/2), y:((tile.tile_corners[3].y+tile.tile_corners[0].y)/2)};
		this.radius = Math.floor((tile.tile_corners[1].x-tile.tile_corners[0].x)/2)-2;
		if(this.shape > 2 && this.shape < 7){
			this.drawPoly(center, this.shape);
		} else {
			this.drawCircle(center);
		}
		if(tile.isHit){
			this.crossOut();
		}
	}

	this.drawCircle = function(center){
		context.beginPath();
		context.arc(center.x, center.y, this.radius, 0, 2*Math.PI);
		context.fillStyle = (tile.isHit)?this.hitColour:this.colour;
		context.fill();
	}

	this.drawPoly = function(center, points){
		verts = [];
		verts.push({x:center.x, y:center.y-this.radius});
		var angle_increment = 2*Math.PI/points;
		for(var i = 1; i<points; i++){
			//a point at (360/points)*i degrees from vertical up
			verts.push({
				x:center.x+(this.radius*(Math.cos(angle_increment*i+Math.PI/2))),
				y:center.y-(this.radius*(Math.sin(angle_increment*i+Math.PI/2)))
			})
		}
		context.beginPath();
		for(var i = 0; i<verts.length; i++){
			context.lineTo(verts[i].x, verts[i].y);
		}
		context.fillStyle = (tile.isHit)?this.hitColour:this.colour;
		context.fill();
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

	this.setShape = function(polyCount){
		this.shape = polyCount;
	}

	this.refreshTheme = function(){
		this.hitColour = currentTheme.colours[9];
		this.colour = currentTheme.colours[9];
		this.draw();
	}

	this.clear = function(){
		context.clearRect(tile.tile_corners[0].x, tile.tile_corners[0].y, (tile.tile_corners[1].x-tile.tile_corners[0].x), (tile.tile_corners[3].y-tile.tile_corners[0].y));
	}

}

