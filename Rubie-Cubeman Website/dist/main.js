/**
 * Backend functionality for the Rubie-Cubeman educational web application.
 *
 * This file contains the code responsible for handling input from and 
 * outputting to the web-based Rubie-Cubeman demonstration. The program begins
 * by defining some global variables and inserting two Cuber Rubik's cubes into
 * the HTML. Properties of these cubes are also set before the entirely event
 * driven phase is entered. On input of twists 
 * 
 * @author Adam Hiles
 * @author Delara Shamanian Esfahani
 * @since 06/12/2020
 */

const SEQ_LIM = 5;			//Limit of twists in G & H
const TWIST_TIME = 100;		//Global time for Cuber twists
const WAIT_TIME = 500;		//Global time for 

//========TIMEOUT-BASED WAIT FUNCTIONS=========================================================================================================================

/**
 * Waits for a given amount of time then runs a function.
 *
 * This function uses setTimeout to wait for the amount of time provided by the
 * caller. After this pause it will continue to the caller defined function, 
 * passing through one additional argument to that argument if provided.
 *
 * @param 	{int}		waitTime	the time to wait in milliseconds.
 * @param 	{function}  nextFunc	the function to call after the wait.
 * @param 	{unknown}	arg			argument to provide to nextFunc.
 */
function wait(waitTime, nextFunc, arg) {
	setTimeout(() => nextFunc(arg), waitTime);
}

/**
 * Continually checks for a condition to become true.
 *
 * This function returns a promise to the caller set to resolve if the provided
 * condition is true. If the condition is not true, the resolution function 
 * will wait for 50 ms before calling itself. The result is that the promise
 * continually checks for condition to be true in order to resolve itself atan
 * 50 ms intervals idefinitely.
 *
 * @param 	{function}	condition	condition by which the promise resolves.
 * @return	{Promise}	a promise that resolve on a true condition
 */
function waitFor(condition) {
  const poll = resolve => {						//Resolution function for the promise
    if (condition()) resolve();			//Will resolve if condition is met
    else setTimeout(_ => poll(resolve), 50);	//If not will check again for a resolution in 50 ms
  }

  return new Promise(poll);						//Promise is returned to caller with the defined resolution function
}		

//========CUBE SWAPPING========================================================================================================================================

/**
 * 
 *
 *
 *
 *
 *
 */
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

//========TWIST HANDLERS=======================================================================================================================================

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
	
//========MAIN ANIMATION CHAIN=================================================
	
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
	twistG(cube2, 0, secrets[3], console.log, "Ding!");
}

//========TRANSITION FROM INPUT TO ANIMATION===================================================================================================================

function transition() {
	secrets[2] = Math.floor(Math.random() * 8) + 1;
	secrets[3] = Math.floor(Math.random() * 8) + 1;

	document.getElementById("b0").innerHTML = secrets[2];
	document.getElementById("b1").innerHTML = secrets[3];
	console.log("b0: " + secrets[2]);
	console.log("b1: " + secrets[3]);
	
	wait(WAIT_TIME, rubieCubeIt);
}

function inputCheck() {
	if (confirmGHandler == false && confirmHHandler == false && a1Listen == false && a0Listen == false) transition();
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
			inputCheck();
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
			inputCheck();
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
		inputCheck();
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
		inputCheck();
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