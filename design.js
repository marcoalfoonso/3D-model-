//Render robot

//scene, camera, renderer

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);


//axis helper, comera position, grid helper

const axesHelper = new THREE.AxesHelper(14);
scene.add(axesHelper);
camera.position.set(5,3,12.5);

const grid = new THREE.GridHelper(size=30, divisions=20);
scene.add(grid);

//box geometry, material, mesh, add to scene, position

const geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00,wireframe:true } );
const cube = new THREE.Mesh( geometry, material );

scene.add( cube );


//adding a line1

//assessing zyz from joint 2

const b1 = 3.8;
const b2 = 2.3;
const l1 = 4.5;
const l2 = 8.8;

let q1 = -Math.PI/4;
let q2 = Math.PI/4;
let q3 = -Math.PI/2;

let x1 = l1 * Math.cos(q1) * Math.cos(q2);
let y1 = b1+b2+l1*Math.sin(q2);
let z1 = -l1*Math.sin(q1)*Math.cos(q2);

let x2 = Math.cos(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));
let y2 = b1+b2+l1*Math.sin(q2)+l2*Math.sin(q2+q3);
let z2 = -Math.sin(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));

const base = new THREE.Vector3(0,0,0);
const p1 = new THREE.Vector3(0,b1+b2,0);
let p2 = new THREE.Vector3(x1,y1,z1);
let ef = new THREE.Vector3(x2,y2,z2);

let zeroF = new THREE.BufferGeometry().setFromPoints([
    base,
    ef 
]);

const T01 = new THREE.BufferGeometry().setFromPoints([
    base,
    p1 
]);

let T12 = new THREE.BufferGeometry().setFromPoints([
    p1,
    p2 
]);

let T23 = new THREE.BufferGeometry().setFromPoints([
    p2,
    ef 
]);

const material2 = new THREE.LineBasicMaterial({ color: 0x0000ff });
const material3 = new THREE.LineBasicMaterial({ color: 0xff0000 });
const material4 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const material5 = new THREE.LineBasicMaterial({ color: 0xffff00 });

let line = new THREE.Line(zeroF, material2);

const line1 = new THREE.Line(T01, material3);
let line2 = new THREE.Line(T12, material4);
let line3 = new THREE.Line(T23, material5);

scene.add(line1);
scene.add(line);
scene.add(line2);
scene.add(line3);

function animate(){
    q1 += 0.01;
    q2 += 0.01;
    q3 += 0.01;

    x1 = l1 * Math.cos(q1) * Math.cos(q2);
    y1 = b1+b2+l1*Math.sin(q2);
    z1 = -l1*Math.sin(q1)*Math.cos(q2);

    x2 = Math.cos(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));
    y2 = b1+b2+l1*Math.sin(q2)+l2*Math.sin(q2+q3);
    z2 = -Math.sin(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));

    p2 = new THREE.Vector3(x1,y1,z1);
    ef = new THREE.Vector3(x2,y2,z2);

    T12 = new THREE.BufferGeometry().setFromPoints([
        p1,
        p2 
    ]);

    T23 = new THREE.BufferGeometry().setFromPoints([
        p2,
        ef 
    ]);

    line = new THREE.Line(zeroF, material2);
    line2 = new THREE.Line(T12, material4);
    line3 = new THREE.Line(T23, material5);
    
    renderer.render(scene,camera);
}
 

renderer.setAnimationLoop(animate);