function Template(context, canvas_width, canvas_height) {
	this.size_multiplier = 1;
	this.origin = {x:null, y:null};
	this.originTile = null;
	this.terminus = {x:null, y:null};

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

	this.setOrigin = function(position, tile){
		this.origin = {x:position.x, y:position.y};
		this.originTile = tile;
	}

	this.setTerminus = function(position){
		this.terminus = {x:position.x, y:position.y};
	}

	this.setVector = function(position, length=200){
		//set terminus based on origin, 2nd position and length
		var delta_x = (this.origin.x - position.x);
		var delta_y = (this.origin.y - position.y);
		var slope = delta_y/delta_x;
		var x_direction = (delta_x < 0) ? -1 : 1;
		var y_direction = (delta_y < 0) ? -1 : 1;
		if(delta_y == 0){slope=0;} // If straight horizontal, slope is 0
		if(delta_x == 0){this.terminus = {x:this.origin.x, y:this.origin.y-(length*y_direction)};return;} //If straight vertical, run length vertical
		var slope_length = Math.sqrt(1+(slope*slope));
		var multiplier = length / slope_length;
		this.terminus = {x:this.origin.x-(multiplier*x_direction), y:this.origin.y-(multiplier*slope*x_direction)};
	}

	this.clear = function(){
		context.clearRect(0, 0, canvas_width, canvas_height);
	}
}

