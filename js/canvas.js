// Box width
var bw = 800;
// Box height
var bh = 800;
// Padding
var p = 10;
// Mouse currently up or down
var mousedown = false;

var canvasGrid = document.getElementById("canvasGrid");
var contextGrid = canvasGrid.getContext("2d");
var canvasUnits = document.getElementById("canvasUnits");
var contextUnits = canvasUnits.getContext("2d");
var canvasTemplate = document.getElementById("canvasTemplate");
var contextTemplate = canvasTemplate.getContext("2d");
var canvasTiles = document.getElementById("canvasTiles");
var contextTiles = canvasTiles.getContext("2d");

var board = new Board(contextGrid, contextTiles);
var template = new Template(contextTemplate, canvasTemplate.width, canvasTemplate.height);

function getMousePos(canvasGrid, event) {
	var rect = canvasGrid.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function mousedown_func(evt) {
	mousedown = true;
	var mousePos = getMousePos(canvasGrid, evt);
	console.log(mousedown, mousePos); 
	template.clear();
	//template.drawBox(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	template.setOrigin(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	mousemove_func(evt);
}

function mousemove_func(evt) {
	if(mousedown){
		var mousePos = getMousePos(canvasGrid, evt);
		template.setVector(mousePos,200);
		template.clear();
		template.drawCone();
		if(template.originLocked){template.drawOrigin();}
	}
}

function mouseup_func(evt) {
	mousedown = false;
	board.showCoverageCone(template.getConeVerts());
}

function dblclick_func(evt) {
	var mousePos = getMousePos(canvasGrid, evt);
	if(template.originLocked){
		template.unlockOrigin();
		//Move origin and draw new template
		mousedown_func(evt);
		mousedown=false;
	} else {
		template.lockOrigin();
		template.drawOrigin();
	}
}

board.drawBoard(p, p, bw, bh);

canvasGrid.addEventListener('mousedown', function(evt){mousedown_func(evt)}, false);
canvasGrid.addEventListener('touchstart', function(evt){mousedown_func(evt)}, false);
canvasGrid.addEventListener('mousemove', function(evt){mousemove_func(evt)}, false);
canvasGrid.addEventListener('touchmove', function(evt){mousemove_func(evt)}, false);
canvasGrid.addEventListener('mouseup', function(evt){mouseup_func(evt)}, false);
canvasGrid.addEventListener('touchend', function(evt){mouseup_func(evt)}, false);
canvasGrid.addEventListener('dblclick', function(evt){dblclick_func(evt)}, false);
