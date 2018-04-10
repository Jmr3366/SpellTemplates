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

function mousedown(evt) {
	mousedown = true;
	var mousePos = getMousePos(canvasGrid, evt);
	console.log(mousedown, mousePos); 
	template.clear(mousePos);
	//template.drawBox(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	template.setOrigin(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
}

function mousemove(evt) {
	console.log(mousedown);
	if(mousedown){
		var mousePos = getMousePos(canvasGrid, evt);
		template.setTerminus(mousePos);
		template.clear();
		template.drawLine();
	}
}

function mouseup(evt) {
	mousedown = false;
}

board.drawBoard(p, p, bw, bh);

canvasGrid.addEventListener('mousedown', function(evt){firstClick(evt)}, false);
canvasGrid.addEventListener('mousemove', function(evt){drag(evt)}, false);
canvasGrid.addEventListener('mouseup', function(evt){endClick(evt)}, false);
