// Box width
var bw = document.getElementById("canvasGrid").width;
// Box height
var bh = document.getElementById("canvasGrid").height;
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
	if(event.touches){event = event.touches[0];}
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function mousedown_func(evt) {
	evt.preventDefault();
	mousedown = true;
	var mousePos = getMousePos(canvasGrid, evt);
	//console.log(mousedown, mousePos); 
	template.clear();
	board.clearTiles();
	//template.drawBox(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	template.setOrigin(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	mousemove_func(evt);
}

function mousemove_func(evt) {
	evt.preventDefault();
	if(mousedown){
		var mousePos = getMousePos(canvasGrid, evt);
		template.setVector(mousePos,200);
		template.clear();
		template.drawCone();
		if(template.originLocked){template.drawOrigin();}

		board.resetHits();
		board.clearTiles();
		template.calculateHitCone(board);
		board.colourHits("orange");
	}
}

function mouseup_func(evt) {
	evt.preventDefault();
	mousedown = false;
	//board.showCoverageCone(template);
	board.resetHits();
	board.clearTiles();
	template.calculateHitCone(board);
	board.colourHits("orange");
}

function dblclick_func(evt) {
	evt.preventDefault();
	var mousePos = getMousePos(canvasGrid, evt);
	if(template.originLocked){
		template.unlockOrigin();
		//Move origin and draw new template
		mousedown_func(evt);
		board.clearTiles();
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

