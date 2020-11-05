// var container 	= document.querySelector( '#container' ),
// 				cube 		= new ERNO.Cube();
// 				light 		= new Photon.Light( 10, 0, 100 );

//             container.appendChild( cube.domElement );
//             cube2 = new ERNO.Cube();
//             container.appendChild(cube2.domElement);
            
            //cube.shuffle();
var container = document.querySelector('#column1');

cube1 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube1.domElement);
//container.pop();
//cube3 = new ERNO.Cube(cube1);
//container.appendChild(cube3.domElement);
var container = document.querySelector('#column2');

cube2 = new ERNO.Cube();
light = new Photon.Light(10,0,100);
container.appendChild(cube2.domElement);
cube1.shuffle(10)
//cube1.twist('string');
cube1.mouseControlsEnabled=false;