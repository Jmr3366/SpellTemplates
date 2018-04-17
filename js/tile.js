function Tile(x, y, height, width, contextGrid, contextTile){
	this.is_hex = false;
	this.has_entity = false;
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

