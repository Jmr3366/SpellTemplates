function Template(context, canvas_width, canvas_height) {
	this.size_multiplier = 1;

	this.drawBox = function(position){
		context.beginPath();
		context.rect(position.x, position.y, 150, 200);
		context.fillStyle= "red";
		context.fill();
	}

	this.clear = function(){
		context.clearRect(0, 0, canvas_width, canvas_height);
	}
}

