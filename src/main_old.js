// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene    = null,
    camera   = null,
    renderer = null,
    controls = null,
    clock = null;

var sound1      = null,
    countPoints = null,
    modelLoad   = null,
    light       = null,
    figuresGeo  = [];

var MovingCube         = null,
    collidableMeshList = [],
    points             = 0,
    numberToCreate     = 5;

var color = new THREE.Color();

// ----------------------------
// Funciones de creación init:
// ----------------------------
function start() {
    window.onresize = onWindowResize;
    initScene();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene(){
    initBasicElements(); // Scene, Camera and Render
    initSound();         // To generate 3D Audio
    createLight();       // Create light
    initWorld();
    particulas();
}

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

function particulas() {
    // create the particle variables
var particleCount = 1800,
particles = new THREE.Geometry(),
pMaterial = new THREE.ParticleBasicMaterial({
  color: 0xFFFFFF,
  size: 20
});

// now create the individual particles
for (var p = 0; p < particleCount; p++) {

// create a particle with random
// position values, -250 -> 250
var pX = Math.random() * 500 - 250,
  pY = Math.random() * 500 - 250,
  pZ = Math.random() * 500 - 250,
  particle = new THREE.Vertex(
    new THREE.Vector3(pX, pY, pZ)
  );

// add it to the geometry
particles.vertices.push(particle);
}

// create the particle system
var particleSystem = new THREE.ParticleSystem(
particles,
pMaterial);

// add it to the scene
scene.add(particleSystem);
}

function initBasicElements() {
    const colorFog = 0x071D36,
          nearFog = 10,
          far = 70;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(colorFog);

    camera = new THREE.PerspectiveCamera(
        75,                                     // Ángulo "grabación" - De abaja -> Arriba 
        window.innerWidth / window.innerHeight, // Relación de aspecto 16:9
        0.1,                                    // Mas cerca (no renderiza) 
        1000                                    // Mas lejos (no renderiza)
    );

    // renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 15, 20);
    controls.update();

    var axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);
    
    var geometry = new THREE.PlaneGeometry( 1000, 1000, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x797878} ); //2C2C2C
    var floor = new THREE.Mesh( geometry, material );
    floor.material.side = THREE.DoubleSide;
    floor.rotation.x = Math.PI/2;
    floor.position.y=-1;
    scene.add( floor );

    scene.fog = new THREE.Fog(colorFog, nearFog, far);
}

function initSound() {
    // 3d Sound
}

function createLight() {
    var light2 = new THREE.AmbientLight(0xffffff);
    light2.position.set(10, 10, 10);
    scene.add(light2);
    light = new THREE.DirectionalLight(0xffffff, 0, 1000);
    scene.add(light);
}

function initWorld() {
    //In this code call the models
}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio();
    initialiseTimer();
}

function initialiseTimer() {
    var sec = 0;
    function pad ( val ) { return val > 9 ? val : "0" + val; }

    setInterval( function(){
        document.getElementById("seconds").innerHTML = String(pad(++sec%60));
        document.getElementById("minutes").innerHTML = String(pad(parseInt(sec/60,10)));
    }, 1000);
}

function showNameStudents() {
    alert("Los estudiantes del grupo son: Johan David Medina Valderrama");
}