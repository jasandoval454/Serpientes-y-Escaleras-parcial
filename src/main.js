// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene = null,
    camera = null,
    renderer = null,
    controls = null,
    light = null;

var players = [null, null]; // Array para dos jugadores
let playerIndices = [1, 1]; // Los jugadores empiezan en la casilla 1
const gridSize = 10;
const cellSize = 1;
let isMoving = false;
let currentPlayerIndex = 0; // Índice del jugador actual (0 para jugador 1, 1 para jugador 2)

const snakesAndLadders = {
    17: 7, 62: 19, 54: 34, 87: 36,
    93: 73, 95: 75, 98: 79, 64: 60,
    4: 14, 9: 31, 21: 42, 28: 84,
    51: 67, 80: 99, 72: 91
};

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

function initScene() {
    initBasicElements();
    initSound();
    createLight();
}

function initBasicElements() {
    const colorFog = 0x071D36, nearFog = 10, farFog = 70;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(colorFog);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, -5, 10);
    camera.lookAt(5, -5, 0);

    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog(colorFog, nearFog, farFog);

    createGrid();
    loadBoardModel();

    // Jugador 1: Fantasma
    const mtlLoader1 = new THREE.MTLLoader();
    mtlLoader1.load("src/modelos/FantasmaAzul.mtl", function (materials1) {
        materials1.preload();
        const objLoader1 = new THREE.OBJLoader();
        objLoader1.setMaterials(materials1);
        objLoader1.load("src/modelos/FantasmaAzul.obj", function (object1) {
            players[0] = object1.clone();
            players[0].scale.set(0.3, 0.3, 0.3);
            updatePlayerPosition(0);
            scene.add(players[0]);
        });
    });

    // Jugador 2: PacMan
    const mtlLoader2 = new THREE.MTLLoader();
    mtlLoader2.load("src/modelos/PacMan.mtl", function (materials2) {
        materials2.preload();
        const objLoader2 = new THREE.OBJLoader();
        objLoader2.setMaterials(materials2);
        objLoader2.load("src/modelos/PacMan.obj", function (object2) {
            players[1] = object2.clone();
            players[1].scale.set(0.3, 0.3, 0.3);
            updatePlayerPosition(1);
            scene.add(players[1]);
        });
    });

    const mtlLoaderDado = new THREE.MTLLoader();
mtlLoaderDado.setPath("src/modelos/");
mtlLoaderDado.load("Dado.mtl", function (materials) {
    materials.preload();
    const objLoaderDado = new THREE.OBJLoader();
    objLoaderDado.setMaterials(materials);
    objLoaderDado.setPath("src/modelos/");
    objLoaderDado.load("Dado.obj", function (dado) {
        dado.scale.set(0.8, 0.8, 0.8); // Tamaño del dado
        dado.position.set(13, -5, 1); // Posición al lado del tablero
        scene.add(dado);
    });
});

    createDiceButton();
    createWinModal();
}

function createWinModal() {
    const modal = document.createElement("div");
    modal.id = "winModal";
    modal.style.display = "none";
    modal.style.position = "absolute";
    modal.style.zIndex = 200;
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "white";
    modal.style.padding = "20px";
    modal.style.borderRadius = "10px";
    modal.style.textAlign = "center";
    modal.innerHTML = `<h2>¡Ganaste!</h2><button onclick="restartGame()">Volver a jugar</button>`;
    document.body.appendChild(modal);
}

function loadBoardModel() {
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath("src/modelos/");
    mtlLoader.load("tablero.mtl", function (materials) {
        materials.preload();
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath("src/modelos/");
        objLoader.load("tablero.obj", function (object) {
            object.scale.set(0.39, 0.39, 0.39);
            object.position.set(4.5, -4.55, 1);
            scene.add(object);
        });
    });
}

function createGrid() {
    let index = 1;
    for (let row = gridSize - 1; row >= 0; row--) {
        const cols = (row % 2 === gridSize % 2) ? [...Array(gridSize).keys()].reverse() : [...Array(gridSize).keys()];
        for (let col of cols) {
            const x = col * cellSize;
            const y = -row * cellSize;
            createCell(x, y, index);
            index++;
        }
    }
}

function createCell(x, y, index) {
    const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, opacity: 0.5, transparent: true });
    const cell = new THREE.Mesh(geometry, material);
    cell.position.set(x, y, 0);
    scene.add(cell);

    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new THREE.TextGeometry(index.toString(), {
            font: font,
            size: 0.3,
            height: 0.05,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x - 0.1, y - 0.1, 0.1);
        scene.add(textMesh);
    });
}

function updatePlayerPosition(playerIndex) {
    const position = getPositionFromIndex(playerIndices[playerIndex]);
    players[playerIndex].position.set(position.x, position.y, 1.5);
}

function getPositionFromIndex(index) {
    index--;
    const row = Math.floor(index / gridSize);
    const colInRow = index % gridSize;
    const actualRow = gridSize - 1 - row;
    const direction = actualRow % 2 === gridSize % 2 ? -1 : 1;
    const col = direction === 1 ? colInRow : gridSize - 1 - colInRow;
    return { x: col * cellSize, y: -actualRow * cellSize };
}

function createDiceButton() {
    const button = document.createElement('button');
    button.textContent = "🎲 Tirar dado";
    button.style.position = 'absolute';
    button.style.top = '20px';
    button.style.right = '20px';
    button.style.padding = '10px';
    button.style.fontSize = '18px';
    button.style.zIndex = 100;
    document.body.appendChild(button);

    const rollResult = document.createElement('div');
    rollResult.style.position = 'absolute';
    rollResult.style.top = '60px';
    rollResult.style.right = '20px';
    rollResult.style.fontSize = '20px';
    rollResult.style.color = 'white';
    rollResult.style.zIndex = 100;
    document.body.appendChild(rollResult);

    button.addEventListener('click', () => {
        if (isMoving) return;
        const roll = Math.floor(Math.random() * 6) + 1;
        rollResult.textContent = "Salió: " + roll;
        movePlayerByRoll(roll);
    });
}

function movePlayerByRoll(steps) {
    if (isMoving) return;
    isMoving = true;
    let targetIndex = playerIndices[currentPlayerIndex] + steps;
    if (targetIndex > gridSize * gridSize) targetIndex = gridSize * gridSize;

    const moveStep = () => {
        if (playerIndices[currentPlayerIndex] < targetIndex) {
            playerIndices[currentPlayerIndex]++;
            updatePlayerPosition(currentPlayerIndex);
            setTimeout(moveStep, 300);
        } else {
            if (playerIndices[currentPlayerIndex] === 100) {
                showWinModal();
                isMoving = false;
                return;
            }
            if (snakesAndLadders[playerIndices[currentPlayerIndex]]) {
                const finalIndex = snakesAndLadders[playerIndices[currentPlayerIndex]];
                setTimeout(() => {
                    const message = finalIndex > playerIndices[currentPlayerIndex]
                        ? `¡Subiste una escalera! Vas a la casilla ${finalIndex}.`
                        : `¡Oh no! Caíste en una serpiente. Vas a la casilla ${finalIndex}.`;
                    playerIndices[currentPlayerIndex] = finalIndex;
                    updatePlayerPosition(currentPlayerIndex);
                    alert(message);
                    isMoving = false;
                    currentPlayerIndex = (currentPlayerIndex + 1) % 2;
                }, 500);
            } else {
                isMoving = false;
                currentPlayerIndex = (currentPlayerIndex + 1) % 2;
            }
        }
    };

    moveStep();
}

function showWinModal() {
    document.getElementById("winModal").style.display = "block";
}

function restartGame() {
    playerIndices = [1, 1];
    updatePlayerPosition(0);
    updatePlayerPosition(1);
    currentPlayerIndex = 0;
    document.getElementById("winModal").style.display = "none";
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function createLight() {
    var ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);
}

function initSound() {}

function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio();
}

function showNameStudents() {
    alert("Los estudiantes del grupo son: Juan Sebastian Benitez y Javier Alejandro Sandoval");
}
