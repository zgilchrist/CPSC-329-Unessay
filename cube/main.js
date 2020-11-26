const SEQ_LIM = 5;
const EXP_LIM = 1;
const TWIST_TIME = 100;
const WAIT_TIME = 500;

/* CUBE RUNNING SEQUENCE */

function wait(waitTime, nextFunc, arg) {
	setTimeout(() => nextFunc(arg), waitTime);
}

function waitFor(conditionFunction) {
  const poll = resolve => {
    if(conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 400);
  }

  return new Promise(poll);
}		

function cubeFadeIn(nextFunc) {
	var opac = 0;
	cube1.domElement.style.opacity = opac;
	cube2.domElement.style.opacity = opac;
	var id = setInterval(frame, 5);
	function frame() {
		if (cube1.domElement.style.opacity >= 1.0) {
			clearInterval(id);
		} else {
			opac += 0.05;
			cube1.domElement.style.opacity = opac;
			cube2.domElement.style.opacity = opac;
		}
	}
	
	waitFor(_ => cube1.domElement.style.opacity >= 1.0).then(_ => nextFunc());
}

function cubeFadeOut(nextFunc) {
	var opac = 1.0;
	cube1.domElement.style.opacity = opac;
	cube2.domElement.style.opacity = opac;
	var id = setInterval(frame, 5);
	function frame() {
		if (cube1.domElement.style.opacity <= 0.0) {
			clearInterval(id);
		} else {
			opac -= 0.05;
			cube1.domElement.style.opacity = opac;
			cube2.domElement.style.opacity = opac;
		}
	}
	
	waitFor(_ => cube1.domElement.style.opacity <= 0.0).then(_ => swapCubes(nextFunc));
}

function swapCubes(nextFunc) {
	loc1 = cube1.domElement.parentNode;
	loc2 = cube2.domElement.parentNode;
	loc1.replaceChild(cube2.domElement, cube1.domElement);
	loc2.insertBefore(cube1.domElement, loc2.firstChild);
	
	cubeFadeIn(nextFunc);
}

function cubeExp(cube, seqA, seqB, expA, expB) {
	for (var i = 0; i < expA; i++) {
		cube.twist(seqA);
	}
	for (var i = 0; i < expB; i++) {
		cube.twist(seqB);
	}
}
		
function rubieCubeIt() {
	cube2.paused = true;
	cubeExp(cube1, gComms, hComms, secrets[0], 0);

	waitFor(_ => cube1.isTweening() == 9).then(_ => 
	waitFor(_ => cube1.isTweening() == 0).then(_ => wait(WAIT_TIME, animA)));
}

function animA() {
	cube1.paused = true; 
	cube2.paused = false; 
	cubeExp(cube2, gComms, hComms, secrets[2], 0);
	
	waitFor(_ => cube2.isTweening() == 9).then(_ => 
	waitFor(_ => cube2.isTweening() == 0).then(_ => wait(WAIT_TIME, cubeFadeOut, animB)));
}


function animB() {
	cubeExp(cube2, gComms, hComms, secrets[0], secrets[1]);
	
	waitFor(_ => cube2.isTweening() == 9).then(_ => 
	waitFor(_ => cube2.isTweening() == 0).then(_ => wait(WAIT_TIME, animC)));
}

function animC() {
	cube1.paused = false;
	cube2.paused = true; 
	cubeExp(cube1, gComms, hComms, secrets[2], secrets[3]);
	
	waitFor(_ => cube1.isTweening() == 9).then(_ => 
	waitFor(_ => cube1.isTweening() == 0).then(_ => wait(WAIT_TIME, cubeFadeOut, animD)));
}

function animD() {
	cubeExp(cube1, gComms, hComms, 0, secrets[1]);
	
	waitFor(_ => cube1.isTweening() == 9).then(_ => 
	waitFor(_ => cube1.isTweening() == 0).then(_ => wait(WAIT_TIME, animE)));
}

function animE() {
	cube1.paused = true; 
	cube2.paused = false; 
	cubeExp(cube2, gComms, hComms, 0, secrets[3]);
}







/* EVENT HANDLERS */

function inputPadHandler(valueStr, label, buttons, input, limit) {
	valueStr += input;
	label.value += input;
	
	if (valueStr.length == limit) {
		for (button of buttons) {
			button.disabled = true;
		}
		rand.disabled = true;
	}
	
	if (valueStr.length != 0) {
		confirm.disabled = false;
		bksp.disabled = false;
	}
	
	return valueStr;
}

function twistRandHandler(comms, label, buttons) {
	var randTwist = commands.charAt(Math.floor(Math.random() * commands.length));
	return inputPadHandler(comms, label, buttons, randTwist, SEQ_LIM);
}

function numRandHandler(secret, label, buttons) {
	var randNum = Math.floor(Math.random() * 8) + 1;
	return inputPadHandler(secret, label, buttons, randNum, EXP_LIM);
}

function bkspHandler(comms, label, buttons, limit) {
	comms = comms.slice(0, -1);
	label.value = label.value.slice(0, -1);
	
	if (comms.length != limit) {
		for (button of buttons) {
			button.disabled = false;
		}
		rand.disabled = false;
	}
	
	if (comms.length == 0) {
		confirm.disabled = true;
		bksp.disabled = true;
	}
	
	return comms;
}






/* INPUT TRANSITIONS */

function resetInputPad(prevButtons, buttons) {
	confirm.disabled = true;
	bksp.disabled = true;
	rand.disabled = false;
	
	for (button of prevButtons) {
			button.disabled = true;
	}
	for (button of buttons) {
			button.disabled = false;
	}
}

function hInputTransition(hLabel, buttons, commands, nextTrans) {
	hLabel.value = "\tH = ";
	resetInputPad(buttons, buttons);
	
	bksp.onclick = function(){hComms = bkspHandler(hComms, hLabel, buttons, SEQ_LIM)};
	rand.onclick = function(){hComms = twistRandHandler(hComms, hLabel, buttons)};
	confirm.onclick = function(){nextTrans(a0Label, secrets, numButtons, buttons, a1InputTransition)};
	for (let i = 0; i < commands.length; i++) {
		buttons[i].onclick = function(){hComms = inputPadHandler(hComms, hLabel, buttons, commands.charAt(i), SEQ_LIM)};
	}
}

function a0InputTransition(a0Label, secrets, numButtons, twistButtons, nextTrans) {
	a0Label.value = "\ta0 = ";
	resetInputPad(twistButtons, numButtons);
	
	bksp.onclick = function(){secrets[0] = bkspHandler(secrets[0], a0Label, numButtons, EXP_LIM)};
	rand.onclick = function(){secrets[0] = numRandHandler(secrets[0], a0Label, numButtons)};
	confirm.onclick = function(){nextTrans(a1Label, secrets, numButtons, finalTransition)};
	for (let i = 0; i < numButtons.length; i++) {
		numButtons[i].onclick = function(){secrets[0] = inputPadHandler(secrets[0], a0Label, numButtons, i + 1, EXP_LIM)};
	}
	
	
}

function a1InputTransition(a1Label, secrets, buttons, nextTrans) {
	a1Label.value = "\ta1 = ";
	resetInputPad(buttons, buttons);
	
	bksp.onclick = function(){secrets[1] = bkspHandler(secrets[1], a1Label, numButtons, EXP_LIM)};
	rand.onclick = function(){secrets[1] = numRandHandler(secrets[1], a1Label, numButtons)};
	confirm.onclick = function(){nextTrans(secrets, buttons)};
	for (let i = 0; i < buttons.length; i++) {
		numButtons[i].onclick = function(){secrets[1] = inputPadHandler(secrets[1], a1Label, buttons, i + 1, EXP_LIM)};
	}
}

function finalTransition(secrets, buttons) {
	for (let i = 0; i < EXP_LIM; i++) {
		secrets[2] += Math.floor(Math.random() * 8) + 1;
		secrets[3] += Math.floor(Math.random() * 8) + 1;
	}
	
	b0Label.value = "\tb0 = " + secrets[2];
	b1Label.value = "\tb1 = " + secrets[3];
	
	bksp.disabled = true;
	confirm.disabled = true;
	rand.disabled = true;
	for (button of buttons) {
		button.disabled = true;
	}
	
	for (let i = 0; i < secrets.length; i++) {
		secrets[i] = parseInt(secrets[i]);
	}
	
	wait(WAIT_TIME, rubieCubeIt);
}






// the buttons in order are FSBLMRUED and fsblmrued
/* CREATING SOME VARIABLES */

var commands = "LRUDFBlrudfb"
var gComms = ""
var hComms = ""
var secrets = ["", "", "", ""];

var gLabel = document.createElement("OUTPUT");
gLabel.value = "G = ";
var hLabel = document.createElement("OUTPUT");
var a0Label = document.createElement("OUTPUT");
var a1Label = document.createElement("OUTPUT");
var b0Label = document.createElement("OUTPUT");
var b1Label = document.createElement("OUTPUT");

/* COLUMN 1 APPENDING */

var container = document.querySelector('#column1');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube1.domElement);

var twistButtons = [];
for (let i = 0; i < commands.length; i++) {
	twistButtons[i] = document.createElement("BUTTON");
	var temp = document.createTextNode(commands.charAt(i));
	twistButtons[i].appendChild(temp);
	container.appendChild(twistButtons[i]);
}

var numButtons = [];
for (var i = 0; i < 9; i++) {
	numButtons[i] = document.createElement("BUTTON");
	var temp = document.createTextNode("" + (i + 1));
	numButtons[i].appendChild(temp);
	container.appendChild(numButtons[i]);
	numButtons[i].disabled = true;
}

var rand = document.createElement("BUTTON");
rand.appendChild(document.createTextNode("Randomize"));
container.appendChild(rand);

var bksp = document.createElement("BUTTON");
bksp.appendChild(document.createTextNode("BKSP"));
container.appendChild(bksp);
bksp.disabled = true;

var confirm = document.createElement("BUTTON");
confirm.appendChild(document.createTextNode("Confirm"));
container.appendChild(confirm);
confirm.disabled = true;

/* COLUMN 2 APPENDING */

var container = document.querySelector('#column2');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube2.domElement);

container.appendChild(gLabel);
container.appendChild(hLabel);
container.appendChild(a0Label);
container.appendChild(a1Label);
container.appendChild(b0Label);
container.appendChild(b1Label);

/* CONFIGURING CUBES */

cube1.mouseControlsEnabled = false;
cube2.mouseControlsEnabled = false;
cube1.keyboardControlsEnabled = false;
cube2.keyboardControlsEnabled = false;
cube1.twistDuration = TWIST_TIME;
cube2.twistDuration = TWIST_TIME / 20;

/* INITIAL ONCLICK ASSIGNMENTS */

bksp.onclick = function(){gComms = bkspHandler(gComms, gLabel, twistButtons, SEQ_LIM)};
rand.onclick = function(){gComms = twistRandHandler(gComms, gLabel, twistButtons)};
confirm.onclick = function(){hInputTransition(hLabel, twistButtons, commands, a0InputTransition)};

for (let i = 0; i < commands.length; i++) {
	twistButtons[i].onclick = function(){gComms = inputPadHandler(gComms, gLabel, twistButtons, commands.charAt(i), SEQ_LIM)};
}
