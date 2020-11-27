var container1 = document.querySelector('#BobCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container1.appendChild(cube1.domElement);

var container2 = document.querySelector('#AliceCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container2.appendChild(cube2.domElement);

var H='',G='';
var confirmHHandler = true,confirmGHandler=true ;
var input1='';
var len = 0;
var a0Listen=true ,a1Listen=true;
var a0,a1;
 function cubeinpute(c){
     if(len<6){
        input1=input1+c;
        console.log(input1);
        len++;
     }
    
}
document.getElementById("submitH").onclick=function(){
    
    if(confirmHHandler==true && len==6){
        H = input1;
        input1='';
        confirmHHandler=false;
        cube1.twist(H);
        len=0;
    }
}

document.getElementById("submitG").onclick=function(){
    
    if(confirmGHandler==true &&len==6){
        G = input1;
        input1='';
        confirmGHandler=false;
        cube2.twist(G);
        len=0;
    }
}

function seta0(i){
    if(a0Listen==true){
        a0=i;
        a0Listen=false;
        console.log(a0);
    }
    
}
function seta1(i){
    if(a1Listen==true){
        a1=i;
        a1Listen=false;
        console.log(a1);
    }
}