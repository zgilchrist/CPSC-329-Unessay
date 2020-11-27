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

function dualAnimSwitchNaive() {
	cube1.paused = !cube1.paused;
	cube2.paused = !cube2.paused;
}

function dualAnimSwitchNodewise(first, second) {
	
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
	cubeExp(cube1, gComms, hComms, secrets[0], 0);

	waitFor(_ => cube1.isTweening() == 9).then(_ => 
	waitFor(_ => cube1.isTweening() == 0).then(_ => wait(WAIT_TIME, animA)));
}

function animA() {
	dualAnimSwitchNaive();
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
	dualAnimSwitchNaive();
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
	dualAnimSwitchNaive();
	cubeExp(cube2, gComms, hComms, 0, secrets[3]);
}

function transition() {
	secrets[2] = Math.floor(Math.random() * 8) + 1;
	secrets[3] = Math.floor(Math.random() * 8) + 1;

	console.log("b0: " + secrets[2]);
	console.log("b1: " + secrets[3]);
	
	wait(WAIT_TIME, rubieCubeIt);
}






var container1 = document.querySelector('#AliceCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container1.appendChild(cube1.domElement);

var container2 = document.querySelector('#BobCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container2.appendChild(cube2.domElement);

var hComms='',gComms='';
var confirmHHandler = true,confirmGHandler=true ;
var input1='';
var len = 0;
var a0Listen=true ,a1Listen=true;
var secrets = [];
 function cubeinpute(c){
     if(len<SEQ_LIM){
        input1=input1+c;
        console.log(input1);
        len++;
     }
    
}
document.getElementById("submitH").onclick=function(){
    
    if(confirmHHandler==true && len==SEQ_LIM){
        hComms = input1;
        input1='';
        confirmHHandler=false;
        console.log("H: " + hComms);
        len=0;
		
		document.getElementById("submitH").disabled = true;
		if (confirmGHandler == false) {
			for (let i = 0; i < 12; i++) {
				document.getElementById("Button" + i).disabled = true;
			}
		}
    }
}

document.getElementById("submitG").onclick=function(){
    
    if(confirmGHandler==true &&len==SEQ_LIM){
        gComms = input1;
        input1='';
        confirmGHandler=false;
        console.log("G: " + gComms);
        len=0;
		
		document.getElementById("submitG").disabled = true;
		if (confirmHHandler == false) {
			for (let i = 0; i < 12; i++) {
				document.getElementById("Button" + i).disabled = true;
			}
		}
    }
}

function seta0(i){
    if(a0Listen==true){
        secrets[0]=i;
        a0Listen=false;
        console.log("a0: " + secrets[0]);
		
		for (let i = 1; i < 10; i++) {
			document.getElementById("num" + i + "a0").disabled = true;
		}
    }
    
}
function seta1(i){
    if(a1Listen==true){
        secrets[1]=i;
        a1Listen=false;
        console.log("a1: " + secrets[1]);
		
		for (let i = 1; i < 10; i++) {
			document.getElementById("num" + i + "a1").disabled = true;
		}
    }
}

cube1.mouseControlsEnabled = false;
cube2.mouseControlsEnabled = false;
cube1.keyboardControlsEnabled = false;
cube2.keyboardControlsEnabled = false;
cube1.twistDuration = TWIST_TIME;
cube2.twistDuration = TWIST_TIME / 20;
cube2.paused = true;

waitFor(_ => (confirmGHandler == false && confirmHHandler == false && a1Listen == false && a0Listen == false)).then(_ => transition());