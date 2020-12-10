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
const WAIT_GOAL = 4000;		//Aim for time between the start of an animation 
							//step and the user reading the whole associated
							//tooltip
const MIN_WAIT_TIME = 500;	//Minimum time to wait for the wait function
const MIN_WAIT_WEIGHT = (WAIT_GOAL - MIN_WAIT_TIME) / TWIST_TIME; 
//Weight for a guarenteed minimum pause time

//========TIMEOUT-BASED WAIT FUNCTIONS=========================================================================================================================

/**
 * Waits for a weighted amount of time before running a function.
 *
 * This function uses setTimeout to wait for the amount of time provided by the
 * caller. After this pause it will continue to the caller defined function, 
 * passing through one additional argument to that argument if provided.
 *
 * @param 	{int}		waitTime	the time to wait in milliseconds.
 * @param 	{function}  nextFunc	the function to call after the wait.
 * @param 	{unknown}	arg			argument to provide to nextFunc.
 */
function wait(weight, nextFunc, arg) {
	waitTime = WAIT_GOAL - (weight * TWIST_TIME);
	if (waitTime < MIN_WAIT_TIME) waitTime = MIN_WAIT_TIME;
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
	
	waitFor(_ => cube1.domElement.style.opacity >= 1.0).then(_ => wait(MIN_WAIT_WEIGHT, nextFunc));
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
	cube1.paused ^= true;
	cube2.paused ^= true;
}

//========TWIST HANDLERS=======================================================================================================================================

function weighSeq(expA, expB) {
	return (expA * gComms.length) + (expB * hComms.length);
}

function twistG(cube, expA, expB, weight, nextFunc, arg) {
	if (expA == 0) twistH(cube, expB, weight, nextFunc, arg);
	else {
		cube.twist(gComms);
		waitFor(_ => cube.isTweening() == 9).then(_ => 
		waitFor(_ => cube.isTweening() == 0).then(_ => 
		{
			expA--;
			document.getElementById(cube.domElement.id + "Table").innerHTML += "G";
			twistG(cube, expA, expB, weight, nextFunc, arg);
		}));
	}
}

function twistH(cube, expB, weight, nextFunc, arg) {
	if (expB == 0) { 
		document.getElementById(cube.domElement.id + "Table").innerHTML += " ";
		wait(weight, nextFunc, arg);
	}
	else {
		cube.twist(hComms);
		waitFor(_ => cube.isTweening() == 9).then(_ => 
		waitFor(_ => cube.isTweening() == 0).then(_ => 
		{
			expB--;
			document.getElementById(cube.domElement.id + "Table").innerHTML += "H";
			twistH(cube, expB, weight, nextFunc, arg);
		}));
	}
}
	
//========ANIMATION CHAIN LINKS=================================================

$('#carouselCube').carousel({interval: false});

/**
 * The call to twist Alice's cube G^a0 times is made.
 *
 * The start of the animation chain sets the standard for these "link" 
 * functions. The call to the G and H twisting functions is made with the 
 * twist weight of the sequence (G*a0 + H*0 here) and the function
 * to run after this animation is complete (the call for Bob's cube to twist
 * G^b0, in this case). The tooltip carousel is also iterated in each of these
 * links. Since this is the first link, the sequence tables on the webpage are
 * initialized as blank.
 *
 * @param	none
 * @return	none
 */
function aliceActionLinkA() {
	//Sequence tracking tables are initialized to blank
	document.getElementById("cube1Table").innerHTML = "";
	document.getElementById("cube2Table").innerHTML = "";
	
	twistG(cube1, secrets[0], 0, weighSeq(secrets[0], 0), bobActionLinkA);	//Call to twist Alice's cube G^a0 * H^0, running into the next link afterwards
	$('#carouselCube').carousel("next");	//The tooltip carousel is iterated
}

/**
 * The call to twist Bob's cube G^b0 times.
 *
 * Starting from its solved state, Bob's cube is passed to be twisted 
 * G^b0 * H^0 times. The cubes are then swapped between holders and the link
 * is called where Alice applies some twists to Bob's cube.
 * 
 * @param	none
 * @return	none
 */
function bobActionLinkA() {
	dualAnimSwitchNaive();	//Animation pausing on the cubes is toggled
	twistG(cube2, secrets[2], 0, weighSeq(secrets[2], 0), cubeFadeOut, aliceActionLinkB); //Call for a G^b0 * H^0 twist on Bob's cube, running into the cube swapping functions and then into the next link
	$('#carouselCube').carousel("next"); 	//The tooltip carousel is iterated
}

/**
 * The call for Alice to twist Bob's cube G^a0 + H^a1 times.
 *
 * On receiving Bob's cube after the first swap, it needs to be that Alice
 * twists it the complete G^a0 * H^a1 sequence. The link is then called for
 * Bob to apply their version of this sequence to Alice's cube.
 * 
 * @param	none
 * @return	none
 */
function aliceActionLinkB() {
	twistG(cube2, secrets[0], secrets[1], weighSeq(secrets[0], secrets[1]), bobActionLinkB);
	$('#carouselCube').carousel("next");	//The tooltip carousel is iterated
}

/**
 * The call for Bob to twist Alice's cube G^b0 + H^b1 times.
 *
 * Like Alice to Bob's cube, Bob needs to apply the twist sequence G^b0 * H^b1
 * to Alice's cube. The cubes are then swapped back to their original owners
 * and Alice is called to apply her final sequence.
 * 
 * @param	none
 * @return	none
 */
function bobActionLinkB() {
	dualAnimSwitchNaive();	//Animation pausing on the cubes is toggled
	twistG(cube1, secrets[2], secrets[3], weighSeq(secrets[2], secrets[3]), cubeFadeOut, aliceActionLinkC);
	$('#carouselCube').carousel("next");	//The tooltip carousel is iterated
}

/**
 * The call to twist Alice's cube H^a1 times.
 *
 * Once her original cube is returned, Alice needs to apply her final 
 * G^0 * H^a1 sequence. Bob is then called to do the same.
 * 
 * @param	none
 * @return	none
 */
function aliceActionLinkC() {
	twistG(cube1, 0, secrets[1], weighSeq(0, secrets[1]), bobActionLinkC);
	$('#carouselCube').carousel("next");	//The tooltip carousel is iterated
}

/**
 * The call to twist Bob's cube H^b1 times.
 *
 * For the final twisting sequence, Bob needs to apply G^0 * H^b1 to his 
 * original cube. Afterwards, the carousel is set to advanced to final,
 * congratulatory tooltip.
 * 
 * @param	none
 * @return	none
 */
function bobActionLinkC() {
	dualAnimSwitchNaive();	//Animation pausing on the cubes is toggled
	twistG(cube2, 0, secrets[3], weighSeq(0, secrets[3]), done);
	$('#carouselCube').carousel("next");	//The tooltip carousel is iterated
}

/**
 * Iterates the carousel to the final tooltip.
 *
 * Once all sequences have applied to achieve the shared secret, the carousel 
 * advances to the final tooltip the notify the user so.
 *
 * @param	none
 * @return	none
 */
function done() {
	$('#carouselCube').carousel("next");	//The tooltip carousel is iterated
}

//========TRANSITION FROM INPUT TO ANIMATION===================================================================================================================

/**
 * Assigns b0 and b1, bridges the input and animation sections.
 *
 * Once all user inputs have been completed a random b0 and b1 are randomly
 * selected. There is then a short wait period before the demonstration's cube
 * animations begin.
 *
 * @param	none
 * @return	none
 */
function transition() {
	//The b0 & b1 spots in the secret array are assigned a random int from 0 to 9 (inclusive)
	secrets[2] = Math.floor(Math.random() * 8) + 1;
	secrets[3] = Math.floor(Math.random() * 8) + 1;

	//These values are printed to the webpage dropdowns and the console for debugging purposes
	document.getElementById("b0").innerHTML = secrets[2];
	document.getElementById("b1").innerHTML = secrets[3];
	console.log("b0: " + secrets[2]);
	console.log("b1: " + secrets[3]);
	
	wait(MIN_WAIT_WEIGHT, aliceActionLinkA);	//A short wait separates the end of the user input section and the start of the animations
}

/**
 * Checks if input phase is completed so that the demonstration can move on.
 *
 * Checks if all input booleans are false, transitioning to the animation phase 
 * if so.
 *
 * @param	none
 * @return	none
 */
function inputCheck() {
	if (confirmGHandler == false && confirmHHandler == false && a1Listen == false && a0Listen == false) transition();
}

//========INITIALIZATION=======================================================================================================================================

//Creates and appends Alice's cube to the webpage
var container1 = document.querySelector('#AliceCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container1.appendChild(cube1.domElement);
cube1.domElement.id = "cube1";

//Creates and appends Bob's cube to the webpage
var container2 = document.querySelector('#BobCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container2.appendChild(cube2.domElement);
cube2.domElement.id = "cube2";

var hComms = '', gComms = '';							//Strings for the G and H twist sets
var confirmHHandler = true, confirmGHandler = true ;	//Booleans for if G and H still need to be set
var input1 = '';										//Holds user input for G and H until confirmed
var len = 0;											//Length of input1
var a0Listen = true, a1Listen = true;					//Booleans for if a0 and a1 still need to be set
var secrets = [];										//Array to hold a0, a1, b0, and b1

//The submit for G and H and backspace buttons are initially disabled
document.getElementById("submitH").disabled = true;
document.getElementById("submitG").disabled = true;
document.getElementById("Bksp").disabled = true;

//All user controls for the cube objects are disabled, their twist times are set, and Bob's cube's animation is paused
cube1.mouseControlsEnabled = false;
cube2.mouseControlsEnabled = false;
cube1.keyboardControlsEnabled = false;
cube2.keyboardControlsEnabled = false;
cube1.twistDuration = TWIST_TIME;
cube2.twistDuration = TWIST_TIME / 20;
cube2.paused = true;

//========UTILITIES FOR ONCLICK EVENTS=========================================================================================================================

/**
 * Formats a string of twists to a reader friendly string of standard notation.
 *
 * For passing twist sequences to cube objects they need to be unspaced, 
 * uppercase and lowercase characters in a string. For output to the user,
 * this funciton formats such a sequence by spacing the twists and listing
 * inverse moves (lowercase) as uppercase + i (e.x. "DBf" -> "D B Fi "). The
 * formatted string is returned to the caller.
 * 
 * @param	{String}	moveSet	the twist string to format
 * @return	{String}	the formatted version of moveSet
 */
function twistsToString(moveSet) {
	fMoveSet = "";																	//String for the formatted moveset is initialized
	for (twist of moveSet) {														//For each twist
		if (twist == twist.toLowerCase()) fMoveSet += twist.toUpperCase() + "i";	//Lowercase twists are formatted as uppercase + i
		else fMoveSet += twist;														//Uppercase twists are copied unformatted												
		fMoveSet += " ";															//A space is added after each twist
	}
	
	return fMoveSet;																//The formatted sequence is returned to the caller
}

/**
 * Toggles buttons disabled at the lower limit of input len.
 *
 * The backspace and submit buttons for the twist inputs are disabled at 
 * len = 0 and enabled otherwise. When len would change from or to zero this 
 * function is called to toggle the DOM buttons being disabled.
 *
 * @param 	none
 * @return	none
 */
function toggleLowerLimitKeys() {
	document.getElementById("Bksp").disabled ^= true;							//Backspace's disabled is xor'd with true, toggling it
	if (confirmHHandler) document.getElementById("submitH").disabled ^= true;	//The submit button for H is toggled only if it has not been submitted yet
	if (confirmGHandler) document.getElementById("submitG").disabled ^= true;	//^ but for G
}

/**
 * Toggles buttons disabled at the upper limit of input len
 *
 * Each button to input a twist should be disabled at len = SEQ_LIM and enabled
 * otherwise. When len would change from or to SEQ_LIM this function is called
 * to toggle the DOM twist buttons' disabled states
 *
 * @param 	none
 * @return	none
 */
function toggleUpperLimitKeys() {
	for (let i = 0; i < 12; i++) {
		document.getElementById("Button" + i).disabled ^= true;	//Each twist button's disabled is xor'd with true, toggling it
	}
}

/**
 * Removes all twists from current input sequence with backspaces.
 *
 * This will loop through the current length of the input sequence and remove
 * the last character each time by the backspace function, in order to clear 
 * this sequence.
 *
 * @param 	none
 * @return	none
 */
function clearInputSeq() {
	for (let i = len; i > 0; i--) {	
		cubeBksp();	//Each twist in the current input sequence is cleared with the backspace function
	}
}

//========ONCLICK HANDLERS=====================================================================================================================================

/**
 * Handler for twist button onclick events.
 *
 * The onclick for the twist buttons is set to this funciton in the html with
 * their corresponding twists (in Cuber notation) as the argument. When one of 
 * these buttons is pressed its twist is appended to the current input sequence
 * and the tracked length increases. The two preview fields are updated with 
 * this new sequence formatted, as long as they have not been submitted. If 
 * the length of the input will increase from zero the lower limit keys are
 * toggled and the upper limit ones are if the length will increase to the 
 * SEQ_LIM.
 *
 * @param	{String}	c	a Cuber twist
 * @return	none
 */
function cubeinput(c) {
	input1 = input1 + c;	//Input sequence is appended with the selected twist
	console.log(input1);	//New sequence is printed to the console for debug
	
	if(len == 0) toggleLowerLimitKeys();					//If the length of input is being increased from zero the backspace and submit keys are toggled
	else if (len == SEQ_LIM - 1) toggleUpperLimitKeys();	//If the length of the input is being increased to the upper limit the twist keys are toggled
	len++;													//The length tracker increments
	
	if (confirmHHandler) document.getElementById("Hvalue").innerHTML = twistsToString(input1);	//If H has not been submitted the new input is formatted and set to its sequence box for preview
	if (confirmGHandler) document.getElementById("Gvalue").innerHTML = twistsToString(input1);	//^ but for G
}

/**
 * Handler for backspace on the twist input.
 *
 * When the backspace for the twist input is pressed, it will slice off the 
 * last character in the input twist sequence. The preview fields are updated
 * accordingly and buttons are toggled depending if the length of the input 
 * is decrease from the maximum or to zero.
 *
 * @param	none
 * @return	none
 */
function cubeBksp() {
	input1 = input1.slice(0, -1);	//Last twist of the input sequence is sliced off
	console.log(input1);			//New sequence is printed to the console for debug
	
	if (len == 1) toggleLowerLimitKeys();				//Lower limit keys are toggled if the length is decreasing to zero
	else if (len == SEQ_LIM) toggleUpperLimitKeys();	//Upper limit keys are toggled if the length is decreasing from SEQ_LIM
	len--												//The length tracker decrements
	
	if (len == 0) {	//If the length decreases to zero the H and G preview fields change to an input print
		if (confirmHHandler) document.getElementById("Hvalue").innerHTML = "Print H values";	//H field is updated only if it has not been submitted
		if (confirmGHandler) document.getElementById("Gvalue").innerHTML = "Print G values";	//^ for G
	}
	else {	//Otherwise the fields are updated with the new input sequence formatted
		if (confirmHHandler) document.getElementById("Hvalue").innerHTML = twistsToString(input1);	//H field only updates if it has not been submitted
		if (confirmGHandler) document.getElementById("Gvalue").innerHTML = twistsToString(input1);	//^ for G
	}
	
}

/**
 * Handler for the twist input randomizer.
 * 
 * When the randomize button is pressed on the twist input keyboard it will
 * change the input sequence to a random sequence of length SEQ_LIM. This is
 * done using the twist input and backspace handlers so disabling and preview
 * update functionality does not need to be repeated.
 *
 * @param	none
 * @param	none
 */
function randMoves() {
	clearInputSeq(); //The current input sequence is cleared
	
	var moves = cube1.PRESERVE_LOGO.replace("Ss", "Ff");	//The set of valid moves can be retreive from Cuber's PRESERVE_LOGO set, except with the slice twists replaced with the front face
	for (let i = 0; i < SEQ_LIM; i++) {
		cubeinput(moves.charAt(Math.floor(Math.random() * moves.length)));	//A random character from this set is added to the input sequence with the twist input function up to the sequence limit 
	}
}

//Onclick handler for submitting the H sequence
//@TODO combine submit H and submit G onclicks
document.getElementById("submitH").onclick=function(){
 
	hComms = input1;									//The input sequence becomes the H sequence
	confirmHHandler = false;							//The H input boolean is set to false
	document.getElementById("submitH").disabled = true; //The submit H button is disabled
	clearInputSeq(); 									//The current input sequence is cleared
	console.log("H: " + hComms);						//The final H sequence is printed to the console for debug
	
	if (confirmGHandler == false) {	//If the G boolean is false then twist input is complete
		for (let i = 0; i < 12; i++) {
			document.getElementById("Button" + i).disabled = true;	//Every twist input button is disabled
		}
		
		document.getElementById("rand").disabled = true;	//The randomization button is disabled
		inputCheck();										//Checks if all input is completed
	} 
}

//Onclick handler for submitting the G sequence
//@TODO combine submit H and submit G onclicks
document.getElementById("submitG").onclick=function(){
	
	gComms = input1;									//The input sequence becomes the G sequence
	confirmGHandler = false;							//The G input boolean is set to false
	document.getElementById("submitG").disabled = true; //The submit G button is disabled
	clearInputSeq();									//The current input sequence is cleared	
	console.log("G: " + gComms);						//The final G sequence is printed to the console for debug
	
	if (confirmHHandler == false) {	//If the H boolean is false then twist input is complete
		for (let i = 0; i < 12; i++) {
			document.getElementById("Button" + i).disabled = true;	//Every twist input button is disabled
		}
		
		document.getElementById("rand").disabled = true;	//The randomization button is disabled
		inputCheck();										//Checks if all input is completed
	} 
}

/**
 * Handler for a0 dropdown onclicks.
 *
 * When a definite a0 value is selected from the dropdown menu a0 is set as
 * that value. The menu is disabled and the a0 field is updated to reflect the
 * change to the user.
 *
 * @param 	{int}	i	number to set a0 as
 * @return	none
 * @TODO	combine seta0 and seta1
 */
function seta0(i){
	secrets[0] = i;						//The integer is set to the a0 place in the secrets array
	a0Listen = false;					//The a0 input boolean is set to false
	console.log("a0: " + secrets[0]);	//a0 is printed to the console for debug
	
	document.getElementById("dropdownMenuButtona0").disabled = true;	//The a0 dropdown menu is disabled
	document.getElementById("dropdownMenuButtona0").innerHTML = "a <sub>o</sub>&nbsp;=&nbsp;" + i;	//The field of menu is updated with a0
	inputCheck();	//Checks if all input is completed
}

/**
 * Handler for a0 randomization.
 *
 * If randomization is selected from the a0 dropdown a random integer from 
 * 0-9 (inclusive) is passed to seta0.
 *
 * @param	none
 * @return	none
 * @TODO	combine randa0 and randa1
 */
function randa0(){
	seta0(Math.floor(Math.random() * 8) + 1);
}

/**
 * Handler for a1 dropdown onclicks.
 *
 * When a definite a1 value is selected from the dropdown menu a1 is set as
 * that value. The menu is disabled and the a1 field is updated to reflect the
 * change to the user.
 *
 * @param 	{int}	i	number to set a1 as
 * @return	none
 * @TODO	combine seta0 and seta1
 */
function seta1(i){
	secrets[1]=i;						//The integer is set to the a1 place in the secrets array
	a1Listen=false;						//The a1 input boolean is set to false
	console.log("a1: " + secrets[1]);	//a1 is printed to the console for debug
	
	document.getElementById("dropdownMenuButtona1").disabled = true;	//The a1 dropdown menu is disabled
	document.getElementById("dropdownMenuButtona1").innerHTML = "a <sub>1</sub>&nbsp;=&nbsp;" + i;	//The field of menu is updated with a1
	inputCheck();	//Checks if all input is completed
}

/**
 * Handler for a1 randomization.
 *
 * If randomization is selected from the a1 dropdown a random integer from 
 * 0-9 (inclusive) is passed to seta1.
 *
 * @param	none
 * @return	none
 * @TODO	combine randa0 and randa1
 */
function randa1(){
	seta1(Math.floor(Math.random() * 9) + 1);
}