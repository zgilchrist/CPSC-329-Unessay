var container = document.querySelector('#BobCube');
cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube1.domElement);

var container = document.querySelector('#AliceCube');
cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube2.domElement);