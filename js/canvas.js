// Box width
var bw = 800;
// Box height
var bh = 800;
// Padding
var p = 10;

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

board.drawBoard(p, p, bw, bh);

canvasGrid.addEventListener('click', function(evt) {
	var mousePos = getMousePos(canvasGrid, evt);
	console.log(mousePos); 
	template.clear(mousePos);
	template.drawBox(mousePos);
}, false);

