//Render robot

//mqtt server connection

const client = mqtt.connect("wss://e4f0d50b37b04ea79745872566f605ff.s1.eu.hivemq.cloud:8884/mqtt",{
    clientId: "web_" + Math.random().toString(16).slice(2, 10),
    username: "MarcoA",
    password: "HATeR3__",
    clean: true
});

console.log("Connecting to HiveMQ Claud...");

client.on("connect", () => {
  console.log("Connecting with Outh");

  client.subscribe(["q1","q2","q3"], (err)=>{
    if(!err){
        console.log("Subscripcion en q1, q2 y q3 exitosa");
    }else{
        console.error("Error en subscripcion q1, q2 y q3:", err);
    }
    });
});

client.on("error", (err) => {
  console.error("Error:", err);
});

//scene, camera, renderer
document.addEventListener("DOMContentLoaded", function(){

    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth*0.75,window.innerHeight*0.75);

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

    const grid = new THREE.GridHelper(30,20);
    scene.add(grid);

    //box geometry, material, mesh, add to scene, position

    const geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00,wireframe:true } );
    const cube = new THREE.Mesh( geometry, material );

    scene.add( cube );

    //constants for kinematics

    const b1 = 3.8;
    const b2 = 2.3;
    const l1 = 4.5;
    const l2 = 8.8;

    //retrieving values from sliders and publishing to mqtt topics

    const g1 = document.getElementById("q1");
    const g2 = document.getElementById("q2");
    const g3 = document.getElementById("q3");

    let lastSend = 0;
    let lastSend2 = 0;
    let lastSend3 = 0;

    g1.addEventListener("input", function(){
        const now = Date.now();

        if(now - lastSend > 50 && client.connected){
            client.publish("q1",g1.value,{retain:true});
            lastSend = now;
        }
    });

    g2.addEventListener("input", function(){
        const now2 = Date.now();

        if(now2 - lastSend2 > 50 && client.connected){
            client.publish("q2",g2.value,{retain:true});
            lastSend2 = now2;
        }
    });

    g3.addEventListener("input", function(){
        const now3 = Date.now();

        if(now3 - lastSend3 > 50 && client.connected){
            client.publish("q3",g3.value,{retain:true});
            lastSend3 = now3;
        }
    });


    let q1 = g1.value * Math.PI/180;
    let q2 = g2.value * Math.PI/180;
    let q3 = g3.value * Math.PI/180;

    //forward kinematics

    let x1 = l1 * Math.cos(q1) * Math.cos(q2);
    let y1 = b1+b2+l1*Math.sin(q2);
    let z1 = -l1*Math.sin(q1)*Math.cos(q2);

    let x2 = Math.cos(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));
    let y2 = b1+b2+l1*Math.sin(q2)+l2*Math.sin(q2+q3);
    let z2 = -Math.sin(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));


    //creating vectores for points and lines

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

        x1 = l1 * Math.cos(q1) * Math.cos(q2);
        y1 = b1+b2+l1*Math.sin(q2);
        z1 = -l1*Math.sin(q1)*Math.cos(q2);

        x2 = Math.cos(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));
        y2 = b1+b2+l1*Math.sin(q2)+l2*Math.sin(q2+q3);
        z2 = -Math.sin(q1)*(l2*Math.cos(q2+q3)+l1*Math.cos(q2));

        p2.set(x1,y1,z1);
        ef.set(x2,y2,z2);

        line.geometry.setFromPoints([base,ef]);
        line2.geometry.setFromPoints([p1,p2]);
        line3.geometry.setFromPoints([p2,ef]);

        renderer.render(scene,camera);
    }


    client.on("message",(topic,message)=>{
        const value = Number(message.toString());
        console.log("Topic: ",topic,"Value: ",value);

        if(topic === "q1"){
            g1.value = value;
            q1 = g1.value * Math.PI/180;
        }

        if(topic === "q2"){
            g2.value = value;
            q2 = g2.value * Math.PI/180;
        }

        if(topic === "q3"){
            g3.value = value;
            q3 = g3.value * Math.PI/180;
        }

    });

    renderer.setAnimationLoop(animate);

});