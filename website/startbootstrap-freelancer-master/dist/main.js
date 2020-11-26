var container = document.querySelector('#BobCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube1.domElement);

var container = document.querySelector('#AliceCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube2.domElement);

var input1='';
document.getElementById("Button0").onclick = function (){
    input1=input1+'F';
    console.log(input1);
}
document.getElementById("submitH").onclick=function(){
    cube1.twist(input1);

}
