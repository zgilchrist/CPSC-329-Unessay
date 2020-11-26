var container1 = document.querySelector('#BobCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container1.appendChild(cube1.domElement);

var container2 = document.querySelector('#AliceCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container2.appendChild(cube2.domElement);

var input1='';
document.getElementById("Button0").onclick = function (){
    input1=input1+'F';
    console.log(input1);
}
document.getElementById("submitH").onclick=function(){
    // removing the cubes
    container1.removeChild(cube1.domElement);
    container2.removeChild(cube2.domElement);
    //swaping the cubes
    container1.appendChild(cube2.domElement);
    container2.appendChild(cube1.domElement);
}