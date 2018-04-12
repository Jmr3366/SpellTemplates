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

