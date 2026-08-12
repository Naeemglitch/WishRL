import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 8, 12);
camera.lookAt(0, 0, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.getElementById("game").appendChild(renderer.domElement);

// LIGHT
const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.set(10, 20, 10);
scene.add(sunlight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// ARENA
const fieldGeometry = new THREE.BoxGeometry(40, 0.5, 70);
const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x159447
});

const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.position.y = -0.25;
scene.add(field);

// FIELD LINES
const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(40, 0.05, 0.3),
    lineMaterial
);

centerLine.position.y = 0.03;
scene.add(centerLine);

// BALL
const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff
});

const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 1, 0);
scene.add(ball);

// CAR
const car = new THREE.Group();

const carBodyGeometry = new THREE.BoxGeometry(2.5, 0.7, 4);
const carBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2277ff
});

const carBody = new THREE.Mesh(
    carBodyGeometry,
    carBodyMaterial
);

carBody.position.y = 0.7;
car.add(carBody);

// CAR TOP
const carTopGeometry = new THREE.BoxGeometry(1.8, 0.6, 1.8);

const carTop = new THREE.Mesh(
    carTopGeometry,
    carBodyMaterial
);

carTop.position.y = 1.25;
carTop.position.z = -0.3;

car.add(carTop);

// WHEELS
const wheelGeometry = new THREE.CylinderGeometry(
    0.45,
    0.45,
    0.35,
    20
);

const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111
});

const wheelPositions = [
    [-1.25, 0.45, 1.25],
    [1.25, 0.45, 1.25],
    [-1.25, 0.45, -1.25],
    [1.25, 0.45, -1.25]
];

for (const position of wheelPositions) {
    const wheel = new THREE.Mesh(
        wheelGeometry,
        wheelMaterial
    );

    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...position);

    car.add(wheel);
}

car.position.set(0, 0, 15);
scene.add(car);

// CONTROLS
const keys = {};

window.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
});

// GAME LOOP
function animate() {
    requestAnimationFrame(animate);

    if (keys["w"]) {
        car.position.z -= 0.15;
    }

    if (keys["s"]) {
        car.position.z += 0.15;
    }

    if (keys["a"]) {
        car.position.x -= 0.15;
    }

    if (keys["d"]) {
        car.position.x += 0.15;
    }

    // Camera follows car
    camera.position.x = car.position.x;
    camera.position.z = car.position.z + 12;

    camera.lookAt(
        car.position.x,
        0,
        car.position.z - 5
    );

    renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
