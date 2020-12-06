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
    else setTimeout(_ => poll(resolve), 50);
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

function dualAnimSwitchNaive() {
	cube1.paused = !cube1.paused;
	cube2.paused = !cube2.paused;
}

function dualAnimSwitchNodewise(first, second) {
	
}

function cubeExp(cube, seqA, seqB, expA, expB) {
	var tableRow = document.getElementById(cube.domElement.id + "Table");
	
	for (var i = 0; i < expA; i++) {
		cube.twist(seqA);
		tableRow.innerHTML += "G";
	}
	tableRow.innerHTML += " ";
	for (var i = 0; i < expB; i++) {
		cube.twist(seqB);
		tableRow.innerHTML += "H";
	}
	tableRow.innerHTML += " ";
}

function twistG(cube, expA, expB, nextFunc, arg) {
	if (expA == 0) twistH(cube, expB, nextFunc, arg);
	else {
		cube.twist(gComms);
		waitFor(_ => cube.isTweening() == 9).then(_ => 
		waitFor(_ => cube.isTweening() == 0).then(_ => 
		{
			expA--;
			document.getElementById(cube.domElement.id + "Table").innerHTML += "G";
			twistG(cube, expA, expB, nextFunc, arg);
		}));
	}
}

function twistH(cube, expB, nextFunc, arg) {
	if (expB == 0) { 
		document.getElementById(cube.domElement.id + "Table").innerHTML += " ";
		wait(WAIT_TIME, nextFunc, arg);
	}
	else {
		cube.twist(hComms);
		waitFor(_ => cube.isTweening() == 9).then(_ => 
		waitFor(_ => cube.isTweening() == 0).then(_ => 
		{
			expB--;
			document.getElementById(cube.domElement.id + "Table").innerHTML += "H";
			twistH(cube, expB, nextFunc, arg);
		}));
	}
}
		
function rubieCubeIt() {
	document.getElementById("cube1Table").innerHTML = "";
	document.getElementById("cube2Table").innerHTML = "";
	twistG(cube1, secrets[0], 0, animA);
}

function animA() {
	dualAnimSwitchNaive();
	twistG(cube2, secrets[2], 0, cubeFadeOut, animB);
}


function animB() {
	twistG(cube2, secrets[0], secrets[1], animC);
}

function animC() {
	dualAnimSwitchNaive();
	twistG(cube1, secrets[2], secrets[3], cubeFadeOut, animD);
}

function animD() {
	twistG(cube1, 0, secrets[1], animE);
}

function animE() {
	dualAnimSwitchNaive();
	twistG(cube2, 0, secrets[3]);
}

function transition() {
	secrets[2] = Math.floor(Math.random() * 8) + 1;
	secrets[3] = Math.floor(Math.random() * 8) + 1;

	document.getElementById("b0").innerHTML = secrets[2];
	document.getElementById("b1").innerHTML = secrets[3];
	console.log("b0: " + secrets[2]);
	console.log("b1: " + secrets[3]);
	
	wait(WAIT_TIME, rubieCubeIt);
}






var container1 = document.querySelector('#AliceCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container1.appendChild(cube1.domElement);
cube1.domElement.id = "cube1";

var container2 = document.querySelector('#BobCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container2.appendChild(cube2.domElement);
cube2.domElement.id = "cube2";

var hComms='',gComms='';
var confirmHHandler = true,confirmGHandler=true ;
var input1='';
var len = 0;
var a0Listen=true ,a1Listen=true;
var secrets = [];

function twistsToString(moveSet) {
	fMoveSet = "";
	for (twist of moveSet) {
		if (twist == twist.toLowerCase()) fMoveSet += twist.toUpperCase() + "i";
		else fMoveSet += twist;
		fMoveSet += " ";
	}
	
	return fMoveSet;
}

function cubeinput(c){
	if(len<SEQ_LIM){
		input1=input1+c;
		console.log(input1);
		len++;
		
		if (confirmHHandler) document.getElementById("Hvalue").innerHTML = twistsToString(input1);
		if (confirmGHandler) document.getElementById("Gvalue").innerHTML = twistsToString(input1);
	}
    
}

function cubeBksp() {
	if (len > 0) {
		input1 = input1.slice(0, -1);
		console.log(input1);
		len--
		
		if (len == 0) {
			if (confirmHHandler) document.getElementById("Hvalue").innerHTML = "Print H values";
			if (confirmGHandler) document.getElementById("Gvalue").innerHTML = "Print G values";
		}
		else {
			if (confirmHHandler) document.getElementById("Hvalue").innerHTML = twistsToString(input1);
			if (confirmGHandler) document.getElementById("Gvalue").innerHTML = twistsToString(input1);
		}
	}
}

function randMoves() {
	for (let i = len; i > 0; i--) {
		cubeBksp();
	}
	var moves = cube1.PRESERVE_LOGO.replace("Ss", "Ff");
	for (let i = 0; i < SEQ_LIM; i++) {
		cubeinput(moves.charAt(Math.floor(Math.random() * moves.length)));
	}
}

document.getElementById("submitH").onclick=function(){
    
    if(confirmHHandler==true && len != 0){
        hComms = input1;
        input1='';
        confirmHHandler=false;
        console.log("H: " + hComms);
        len=0;
		
		document.getElementById("submitH").disabled = true;
		if (confirmGHandler == false) {
			for (let i = 0; i < 12; i++) {
				document.getElementById("Button" + i).disabled = true;
				document.getElementById("Bksp").disabled = true;
			}
		} else {
			document.getElementById("Gvalue").innerHTML = "Print G values";
		}
    }
}

document.getElementById("submitG").onclick=function(){
    
    if(confirmGHandler==true && len != 0){
        gComms = input1;
        input1='';
        confirmGHandler=false;
        console.log("G: " + gComms);
        len=0;
		
		document.getElementById("submitG").disabled = true;
		if (confirmHHandler == false) {
			for (let i = 0; i < 12; i++) {
				document.getElementById("Button" + i).disabled = true;
				document.getElementById("Bksp").disabled = true;
			}
		} else {
			document.getElementById("Hvalue").innerHTML = "Print H values";
		}
    }
}

function seta0(i){
    if(a0Listen==true){
        secrets[0]=i;
        a0Listen=false;
        console.log("a0: " + secrets[0]);
		
		document.getElementById("dropdownMenuButtona0").disabled = true;
		document.getElementById("dropdownMenuButtona0").innerHTML = "a <sub>o</sub>&nbsp;=&nbsp;" + i;
    }
    
}

function randa0(){
	seta0(Math.floor(Math.random() * 8) + 1);
}

function seta1(i){
    if(a1Listen==true){
        secrets[1]=i;
        a1Listen=false;
        console.log("a1: " + secrets[1]);
		
		document.getElementById("dropdownMenuButtona1").disabled = true;
		document.getElementById("dropdownMenuButtona1").innerHTML = "a <sub>1</sub>&nbsp;=&nbsp;" + i;
    }
}

function randa1(){
	seta1(Math.floor(Math.random() * 9) + 1);
}

cube1.mouseControlsEnabled = false;
cube2.mouseControlsEnabled = false;
cube1.keyboardControlsEnabled = false;
cube2.keyboardControlsEnabled = false;
cube1.twistDuration = TWIST_TIME;
cube2.twistDuration = TWIST_TIME / 20;
cube2.paused = true;

waitFor(_ => (confirmGHandler == false && confirmHHandler == false && a1Listen == false && a0Listen == false)).then(_ => transition());