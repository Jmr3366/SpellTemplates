// Box width
var bw;
// Box height
var bh;
// Mouse currently up or down
var mousedown = false;
//Current active touches
var ongoingTouches = 0;
//Long Press settings
var longPressTimer;
var longPressOrigin;
var LONG_PRESS_FORGIVENESS = 5;
var LONG_PRESS_VIBRATION = [75];
//Unit Placement Settings
var unitPlacementMode=false;
var unitStyle=0;
var unitSvgDelay=500;
//Custom settings
var settings = {};

var canvasDiv = document.getElementById("canvasDiv");
var canvasGrid = document.getElementById("canvasGrid");
var contextGrid = canvasGrid.getContext("2d");
var canvasUnits = document.getElementById("canvasUnits");
var contextUnits = canvasUnits.getContext("2d");
var canvasTemplate = document.getElementById("canvasTemplate");
var contextTemplate = canvasTemplate.getContext("2d");
var canvasTiles = document.getElementById("canvasTiles");
var contextTiles = canvasTiles.getContext("2d");

var board;
var template;
var templateSize = parseInt(getParameterByName("size")) || 3;

function getMousePos(canvasGrid, event) {
	var rect = canvasGrid.getBoundingClientRect();
	if(event.touches){event = event.touches[0];}
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function resizeCanvas(canvas, width, height) {
	canvas.width = width;
	canvas.height = height;
}

function vibrate(events){
	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
	//console.log(navigator.vibrate);
	if (navigator.vibrate) {
		navigator.vibrate(...events);
	}
}

function clearAll(){
	template.clear();
	board.clearTiles();
	board.resetHits();
}

function paintTemplate(){
	clearAll();
	if(template.originLocked){template.drawOrigin();}
	template.draw();
	template.calculateHit(board);
	board.colourHits("#E55934");
}

function placeUnit(pos){
	var tile = board.getTileByCoord(pos.x, pos.y);
	if(!tile){return;}
	if(tile.entity){tile.entity.clear();tile.entity=null;}
	else{
		tile.entity = new Unit(tile, unitStyle, contextUnits);
		tile.entity.draw();
	}
}

function mousedown_func(evt) {
	evt.preventDefault();
	mousedown = true;
	var mousePos = getMousePos(canvasGrid, evt);
	if(unitPlacementMode){
		placeUnit(mousePos);
		return;
	}
	//console.log(mousedown, mousePos); 
	template.snapping = settings.template_snapping;
	template.setOrigin(mousePos, board.getTileByCoord(mousePos.x, mousePos.y));
	if(template.originLocked || !template.terminusRequired){
		mousemove_func(evt);
	} else {
		clearAll();
	}
}

function mousemove_func(evt) {
	evt.preventDefault();
	if(mousedown){
		if(unitPlacementMode){
			return;
		}
		var mousePos = getMousePos(canvasGrid, evt);
		template.setVector(mousePos,board.tile_width*templateSize);
		paintTemplate();
	}
}

function mouseup_func(evt) {
	evt.preventDefault();
	mousedown = false;
}

function dblclick_func(evt) {
	evt.preventDefault();
	if(unitPlacementMode){return;}
	var mousePos = getMousePos(canvasGrid, evt);
	if(template.originLocked){
		template.unlockOrigin();
		//Move origin and draw new template
		board.clearTiles();
		mousedown_func(evt);
		mousedown=false;
	} else {
		template.lockOrigin();
		template.drawOrigin();
		if(!template.terminusRequired){
			mousemove_func(evt);
		}
	}
}

function touchstart_func(evt) {
	ongoingTouches += evt.changedTouches.length;
	if(ongoingTouches == 1){
		//Start longpress
		longPressOrigin = {x:evt.touches[0].clientX, y:evt.touches[0].clientY};
		longPressTimer = setTimeout(function() {
			vibrate(LONG_PRESS_VIBRATION);
			dblclick_func(evt);
		}, 500);

		mousedown_func(evt);
	} else {
		clearTimeout(longPressTimer);
	}
}

function touchmove_func(evt) {
	if(ongoingTouches == 1){
		//Cancel longpress if in progress & have moved enough away
		if(longPressOrigin){
			var dx = evt.touches[0].clientX - longPressOrigin.x
			var dy = evt.touches[0].clientY - longPressOrigin.y
			if(Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_FORGIVENESS){
				clearTimeout(longPressTimer);
				longPressOrigin = null;
			}
		}

		mousemove_func(evt);
	}
}

function touchend_func(evt) {
	ongoingTouches -= evt.changedTouches.length;
	if(ongoingTouches <= 1){
		//Cancel longpress happening
		clearTimeout(longPressTimer);
		longPressOrigin = null;

		mouseup_func(evt);
	}
}

function resize_func(evt) {
	clearTimeout(resizeTimer);
	//console.log("resize event fired");
	var resizeTimer = setTimeout(function() {
		//console.log("resize event processed");
		init_canvases();
	}, 200);
}

function keydown_func(evt){
	var codeComplete = secretCode(evt.keyCode)
	if (codeComplete){
		console.log("Sequence Complete!");
		midi = new Audio("secret.mp3");
		midi.volume = 0.3;
		midi.loop = true;
		midi.play();
	}
}

function init_canvases() {
	bw = parseInt(getComputedStyle(canvasDiv, null).getPropertyValue("width").replace("px", ""));
	bh = parseInt(getComputedStyle(canvasDiv, null).getPropertyValue("height").replace("px", ""));

	resizeCanvas(canvasGrid, bw, bh);
	resizeCanvas(canvasUnits, bw, bh);
	resizeCanvas(canvasTemplate, bw, bh);
	resizeCanvas(canvasTiles, bw, bh);

	var unitList = [];
	if(board){unitList = board.unitList();}

	board = new Board(contextGrid, contextTiles);
	board.drawBoard(Math.floor(((bw-1)%board.tile_width)/2), 0, bw, bh);
	init_units(unitList);
	switch((template)?(template.constructor.name):"") {
		case "LineTemplate":
			set_template_line();
			break;
		case "ConeTemplate":
			set_template_cone();
			break;
		case "CircleTemplate":
			set_template_circle();
			break;
		default:
			set_template_circle();
	}

}

function init_units(unitList){
	for (var i = 0; i<unitList.length; i++){
		var col = board.tile_set[unitList[i].y]
		if(!col){continue;}
		var tile = col[unitList[i].x];
		if(!tile){continue;}
		tile.entity = unitList[i].unit;
		tile.entity.setTile(tile)
		tile.entity.draw();
	}
}

function first_load() {
	//Handle url params mostly
	if(document.cookie.includes("settings")) {
		read_settings_cookie();
		write_settings_cookie();
	}

	init_canvases();

	var shape = getParameterByName("shape");
	switch(shape) {
		case "line":
			set_template_line();
			break;
		case "cone":
			set_template_cone();
			break;
		case "circle":
			set_template_circle();
			break;
		default:
			set_template_circle();
	}
	templateSize--;
	increment_template_size();

	//Add units from url param in format X1xY1xShape1,...,XnxYnxShapen
	var units = getParameterByName("units");
	if(units && units.split("x").length>=2){
		unitListString = units.split(",");
		unitList = [];
		for(var i=0; i<unitListString.length;i++){
			var shape = unitListString[i].split("x")[2] || 0;
			unitList.push({unit: new Unit(null, shape, contextUnits),x:unitListString[i].split("x")[0], y:unitListString[i].split("x")[1]});
		}
		console.log("Units from param: ", JSON.stringify(units.split(",")));
		init_units(unitList);
	}

	//Set template magnitude from param
	var templateParam = getParameterByName("templateSize");
	if(templateParam % 5 == 0 && templateParam/5 >= 1 &&  templateParam/5 <= 25){set_template_size(templateParam/5);}

	//Add template from url param
	var origin = getParameterByName("origin"); // in format XxY
	var terminus = getParameterByName("terminus"); // in format XxY
	if(origin && origin.split("x").length==2){
		origin = {x:parseFloat(origin.split("x")[0])+board.origin.x,y:parseFloat(origin.split("x")[1])+board.origin.y};
		console.log("Origin from param: ", origin);
		template.setOrigin(origin);
		template.originLocked = true;
		if(terminus && terminus.split("x").length==2){
			terminus = {x:parseFloat(terminus.split("x")[0])+board.origin.x,y:parseFloat(terminus.split("x")[1])+board.origin.y};
			console.log("Terminus from param: ", terminus);
			template.setTerminus(terminus);
			template.setVector(template.terminus, board.tile_width*templateSize);
			paintTemplate();
		}
	}
}


function set_template_size(size){
	templateSize=size
	document.getElementById("templateSizeLabel").innerHTML = ""+templateSize*5+"ft";
	template.changeMagnitude(board.tile_width*templateSize);
	if(template.isDrawn){paintTemplate();}
}

function increment_template_size(){
	if(templateSize<25){set_template_size(templateSize+1);}
}

function decrement_template_size(){
	if(templateSize>1){set_template_size(templateSize-1);}
}

function set_template_cone(){
	unitPlacementMode = false;
	set_menu_highlight("coneTemplateButton");

	if(template == undefined){
		template = new ConeTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
		return;
	}
	var origin = template.origin;
	var originLock = template.originLocked;
	var terminus = template.terminus;
	var isDrawn = template.isDrawn;
	template = new ConeTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
	template.setOrigin(origin);
	template.setVector(terminus, board.tile_width*templateSize);
	template.originLocked = originLock;
	template.isDrawn = isDrawn;
	if(settings.hit_threshold){template.minHitFactor = settings.hit_threshold/100;}
	if(template.isDrawn){paintTemplate();}
}

function set_template_line(){
	unitPlacementMode = false;
	set_menu_highlight("lineTemplateButton");

	if(template == undefined){
		template = new LineTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
		return;
	}
	var origin = template.origin;
	var originLock = template.originLocked;
	var terminus = template.terminus;
	var isDrawn = template.isDrawn;
	template = new LineTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
	template.setOrigin(origin);
	template.setVector(terminus, board.tile_width*templateSize);
	template.originLocked = originLock;
	template.isDrawn = isDrawn;
	if(settings.hit_threshold){template.minHitFactor = settings.hit_threshold/100;}
	if(template.isDrawn){paintTemplate();}
}

function set_template_circle(){
	unitPlacementMode = false;
	set_menu_highlight("circleTemplateButton");

	if(template == undefined){
		template = new CircleTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
		return;
	}
	var origin = template.origin;
	var originLock = template.originLocked;
	var terminus = template.terminus;
	var isDrawn = template.isDrawn;
	template = new CircleTemplate(contextTemplate, canvasTemplate.width, canvasTemplate.height, board);
	template.setOrigin(origin);
	template.setTerminus(terminus);
	template.setVector(terminus, board.tile_width*templateSize);
	template.setOrigin(origin);
	template.originLocked = originLock;
	template.isDrawn = isDrawn;
	if(settings.hit_threshold){template.minHitFactor = settings.hit_threshold/100;}
	if(template.isDrawn){paintTemplate();}
}

function toggle_place_units(){
	if(unitPlacementMode){
		if(unitStyle==0){unitStyle=4;}
		else if(unitStyle==4){unitStyle=6;}
		else{unitStyle=0;}
	} else {
		unitPlacementMode = true;
		unitStyle=0;
	}
	set_menu_highlight("placeUnitsButton");
	flash_unit_shape();
}

function flash_unit_shape(){
	var shape;
	switch(unitStyle){
		case 4:
			shape = document.querySelector("#unitsShape4");
			break;
		case 6:
			shape = document.querySelector("#unitsShape6");
			break;
		default:
			shape = document.querySelector("#unitsShape0");
	}
	shape.style = "opacity:0.25;"
	shapeDisplayTimeout = setTimeout(function(shape) {
			shape.style = "opacity:0;"
		}, unitSvgDelay, shape);
}

function set_menu_highlight(btnId){
	var peers = document.querySelectorAll("#toolbarBtnDiv .highlight");
	for (var i = peers.length - 1; i >= 0; i--) {
	 	peers[i].classList.remove("highlight");
	 }
	document.getElementById(btnId).classList.add("highlight");
}

function open_settings_menu(){
	document.getElementById("settingsDiv").classList.add("active");
}

function close_settings_menu(){
	write_settings_cookie();
	document.getElementById("settingsDiv").classList.remove("active");
}

function update_settings(){
	var settings_obj = {};
	settings_obj.tile_size = document.querySelector(".tile-size.slider").value;
	settings_obj.hit_threshold = document.querySelector(".hit-threshold.slider").value;
	settings_obj.template_snapping = document.querySelector(".template-snapping.input").checked;
	// console.log("UPDATE",settings_obj);
	settings = settings_obj;
	init_canvases();
}

function update_settings_menu() {
	document.querySelector(".tile-size.slider").value = settings.tile_size;
	document.querySelector(".hit-threshold.slider").value = settings.hit_threshold;
	document.querySelector(".template-snapping.input").checked = settings.template_snapping;
	slider_update({target:document.querySelector(".tile-size.slider")});
	slider_update({target:document.querySelector(".hit-threshold.slider")});
}

function reset_settings(){
	settings = {
		tile_size: "30",
		hit_threshold: "50",
		template_snapping: false
	};
	update_settings_menu();
	init_canvases();
}

function write_settings_cookie() {
	var expiry = new Date(Date.now() + 60*(24*60*60*1000));
	var cookie = ["settings=", JSON.stringify(settings), ';', "expires=", expiry.toUTCString(), ';'].join('');
	document.cookie = cookie;
}

function read_settings_cookie() {
	var result = document.cookie.match(new RegExp('settings=([^;]+)'));
	result && (result = JSON.parse(result[1]));
	settings = result;
	update_settings_menu()
}

function slider_update(evt){
	var outputClass = evt.target.classList.value.replace("slider","").replace("input","").replace("setting","").trim();
	var output = document.querySelector(".output."+outputClass);
	output.innerHTML = evt.target.value;
}

function export_state(){
	var url = (""+window.location).split("?")[0];
	var params = [];
	if(template.isDrawn){
		//collect template size
		params.push("templateSize="+templateSize*5);
		//collect template shape
		params.push("shape="+template.shape);
		//collect template pos
		params.push("origin="+(template.origin.x-board.origin.x)+"x"+(template.origin.y-board.origin.y));
		params.push("terminus="+(template.terminus.x-board.origin.x)+"x"+(template.terminus.y-board.origin.y));
	}
	//collect unit pos
	var unitList = board.unitList();
	var unitListString = "";
	for(var i =0; i < unitList.length; i++){
		if(i!=0){unitListString+=",";}
		unitListString+=unitList[i].x+"x"+unitList[i].y+"x"+unitList[i].unit.shape;
	}
	if(unitListString!=""){params.push("units="+unitListString);}
	if(params.length > 0){
		url = url + "?" + params.join("&")
	}
	document.querySelector("#export_tb").disabled=false;
	document.querySelector("#export_tb").value=url
}

function clear_state(){
	board.clearUnits();
	template.clear()
	init_canvases();
}

function copy_value(target){
	target.select();
	target.disabled=true;
	var value = target.value;
	document.execCommand("copy");
	target.value = "Copied to clipboard!"
	setTimeout(function(target, value){target.value = value; target.disabled=false;},850, target, value)
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var currentLoc = 0;
function secretCode(keycode){
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		65: 'a',
		66: 'b'
	};
	var sequence = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
	if (sequence[currentLoc] == allowedKeys[keycode]) {
		currentLoc++;
	} else if(sequence[0] == allowedKeys[keycode]) {
		//restart sequence
		currentLoc = 1;
	} else {
		currentLoc = 0;
	}
	if (currentLoc == sequence.length){
		currentLoc = 0;
		return true;
	} else {
		return false;
	}
}


first_load();

canvasTemplate.addEventListener('mousedown', mousedown_func, {passive:false});
canvasTemplate.addEventListener('touchstart', touchstart_func, {passive:false});
canvasTemplate.addEventListener('mousemove', mousemove_func, {passive:false});
canvasTemplate.addEventListener('touchmove', touchmove_func, {passive:false});
canvasTemplate.addEventListener('mouseup', mouseup_func, {passive:false});
canvasTemplate.addEventListener('touchend', touchend_func, {passive:false});
canvasTemplate.addEventListener('touchcancel', touchend_func, {passive:false});
canvasTemplate.addEventListener('dblclick', dblclick_func, {passive:false});
window.addEventListener('keydown', keydown_func, {passive:false});
document.defaultView.addEventListener('resize', resize_func, {passive:true});
document.getElementById("incrementTemplateSize").addEventListener('click', increment_template_size, {passive:true});
document.getElementById("decrementTemplateSize").addEventListener('click', decrement_template_size, {passive:true});
document.getElementById("coneTemplateButton").addEventListener('click', set_template_cone, {passive:true});
document.getElementById("lineTemplateButton").addEventListener('click', set_template_line, {passive:true});
document.getElementById("circleTemplateButton").addEventListener('click', set_template_circle, {passive:true});
document.getElementById("placeUnitsButton").addEventListener('click', toggle_place_units, {passive:true});
document.getElementById("settingsButton").addEventListener('click', open_settings_menu, {passive:true});
document.getElementById("settingsCloseButton").addEventListener('click', close_settings_menu, {passive:true});
var sliders = document.getElementsByClassName("slider");
for(var i = 0; i<sliders.length;i++){
	sliders[i].addEventListener('input', slider_update, {passive:true});
}
var settings_inputs = document.getElementsByClassName("setting");
for(var i = 0; i<settings_inputs.length;i++){
	settings_inputs[i].addEventListener('input', update_settings, {passive:true});
}

