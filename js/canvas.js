// Box width
var bw = 800;
// Box height
var bh = 800;
// Padding
var p = 10;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var board = new Board(context);

function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

board.drawBoard(p, p, bw, bh);

canvas.addEventListener('click', function(evt) {
	var mousePos = getMousePos(canvas, evt);
	console.log(mousePos); 
}, false);