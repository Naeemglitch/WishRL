import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";

// =========================
// SCENE
// =========================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// =========================
// CAMERA
// =========================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// =========================
// RENDERER
// =========================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.getElementById("game").appendChild(renderer.domElement);

// =========================
// LIGHT
// =========================

const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.set(10, 20, 10);
scene.add(sunlight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// =========================
// ARENA
// =========================

const fieldGeometry = new THREE.BoxGeometry(40, 0.5, 70);

const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x159447
});

const field = new THREE.Mesh(
    fieldGeometry,
    fieldMaterial
);

field.position.y = -0.25;

scene.add(field);

// =========================
// CENTER LINE
// =========================

const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(40, 0.05, 0.3),
    lineMaterial
);

centerLine.position.y = 0.03;

scene.add(centerLine);

// =========================
// BALL
// =========================

const ballGeometry = new THREE.SphereGeometry(1, 32, 32);

const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff
});

const ball = new THREE.Mesh(
    ballGeometry,
    ballMaterial
);

ball.position.set(0, 1, 0);

scene.add(ball);

// =========================
// CAR
// =========================

const car = new THREE.Group();

// CAR BODY

const carBodyGeometry = new THREE.BoxGeometry(
    2.5,
    0.7,
    4
);

const carMaterial = new THREE.MeshStandardMaterial({
    color: 0x2277ff
});

const carBody = new THREE.Mesh(
    carBodyGeometry,
    carMaterial
);

carBody.position.y = 0.7;

car.add(carBody);

// CAR TOP

const carTopGeometry = new THREE.BoxGeometry(
    1.8,
    0.6,
    1.8
);

const carTop = new THREE.Mesh(
    carTopGeometry,
    carMaterial
);

carTop.position.y = 1.25;
carTop.position.z = -0.3;

car.add(carTop);

// =========================
// WHEELS
// =========================

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

    wheel.position.set(
        position[0],
        position[1],
        position[2]
    );

    car.add(wheel);
}

car.position.set(0, 0, 15);

scene.add(car);

// =========================
// CAR PHYSICS
// =========================

let speed = 0;

let verticalVelocity = 0;

let isGrounded = true;

const acceleration = 0.012;
const maxSpeed = 0.45;
const reverseSpeed = 0.2;

const friction = 0.94;

const turnSpeed = 0.045;

const gravity = 0.018;

const jumpPower = 0.38;

const boostPower = 0.025;

// =========================
// CONTROLS
// =========================

const keys = {};

window.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

    // JUMP

    if (
        event.code === "Space" &&
        isGrounded
    ) {

        verticalVelocity = jumpPower;

        isGrounded = false;
    }
});

window.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;
});

// =========================
// GAME LOOP
// =========================

function animate() {

    requestAnimationFrame(animate);

    // =====================
    // ACCELERATION
    // =====================

    if (keys["w"]) {

        speed += acceleration;

        if (speed > maxSpeed) {
            speed = maxSpeed;
        }
    }

    else if (keys["s"]) {

        speed -= acceleration;

        if (speed < -reverseSpeed) {
            speed = -reverseSpeed;
        }
    }

    else {

        speed *= friction;
    }

    // =====================
    // BOOST
    // =====================

    if (
        keys["shift"] &&
        keys["w"]
    ) {

        speed += boostPower;

        if (speed > 0.8) {
            speed = 0.8;
        }
    }

    // =====================
    // TURNING
    // =====================

    if (keys["a"]) {

        car.rotation.y += turnSpeed * (speed / maxSpeed);
    }

    if (keys["d"]) {

        car.rotation.y -= turnSpeed * (speed / maxSpeed);
    }

    // =====================
    // MOVE CAR
    // =====================

    const direction = new THREE.Vector3(0, 0, -1);

    direction.applyQuaternion(car.quaternion);

    car.position.x += direction.x * speed;

    car.position.z += direction.z * speed;

    // =====================
    // JUMP / GRAVITY
    // =====================

    verticalVelocity -= gravity;

    car.position.y += verticalVelocity;

    if (car.position.y <= 0) {

        car.position.y = 0;

        verticalVelocity = 0;

        isGrounded = true;
    }

    // =====================
    // ARENA LIMITS
    // =====================

    car.position.x = THREE.MathUtils.clamp(
        car.position.x,
        -18,
        18
    );

    car.position.z = THREE.MathUtils.clamp(
        car.position.z,
        -33,
        33
    );

    // =====================
    // CAMERA
    // =====================

    const cameraOffset = new THREE.Vector3(
        0,
        6,
        10
    );

    cameraOffset.applyQuaternion(car.quaternion);

    camera.position.copy(
        car.position
    ).add(cameraOffset);

    const cameraTarget = new THREE.Vector3(
        0,
        1,
        -6
    );

    cameraTarget.applyQuaternion(car.quaternion);

    camera.lookAt(
        car.position.x + cameraTarget.x,
        car.position.y + cameraTarget.y,
        car.position.z + cameraTarget.z
    );

    // =====================
    // RENDER
    // =====================

    renderer.render(scene, camera);
}

animate();

// =========================
// WINDOW RESIZE
// =========================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
