
// СОЗДАНИЕ 3D-СЦЕНЫ

const container = document.getElementById("space");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 8);

// РЕНДЕРЕР

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);

// ОСВЕЩЕНИЕ

const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(0xffffff, 3);
sunlight.position.set(-5, 5, 6);
scene.add(sunlight);

// ТЕКСТУРА САТУРНА БЕЗ ВНЕШНИХ ФАЙЛОВ

const canvas = document.createElement("canvas");
canvas.width = 1024;
canvas.height = 512;

const ctx = canvas.getContext("2d");

const gradient = ctx.createLinearGradient(0, 0, 0, 512);

gradient.addColorStop(0, "#98734e");
gradient.addColorStop(0.15, "#d9b98a");
gradient.addColorStop(0.25, "#b18a5f");
gradient.addColorStop(0.4, "#ead3aa");
gradient.addColorStop(0.52, "#aa8057");
gradient.addColorStop(0.65, "#e2c294");
gradient.addColorStop(0.78, "#b48a60");
gradient.addColorStop(1, "#94704e");

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1024, 512);

// Полосы атмосферы

for (let i = 0; i < 100; i++) {
    const y = Math.random() * 512;

    ctx.fillStyle = i % 2 === 0
        ? "rgba(255,255,255,0.07)"
        : "rgba(70,40,20,0.08)";

    ctx.fillRect(0, y, 1024, Math.random() * 5 + 1);
}

const planetTexture = new THREE.CanvasTexture(canvas);

// МОДЕЛЬ ПЛАНЕТЫ

const planetGeometry = new THREE.SphereGeometry(
    1.3,
    100,
    100
);

const planetMaterial = new THREE.MeshStandardMaterial({
    map: planetTexture,
    roughness: 0.9
});

const saturn = new THREE.Mesh(
    planetGeometry,
    planetMaterial
);

scene.add(saturn);

// КОЛЬЦА САТУРНА

const ringGeometry = new THREE.RingGeometry(
    1.65,
    2.65,
    180
);

// Создаём текстуру колец

const ringCanvas = document.createElement("canvas");
ringCanvas.width = 512;
ringCanvas.height = 32;

const ringCtx = ringCanvas.getContext("2d");

const ringGradient = ringCtx.createLinearGradient(0, 0, 0, 32);

ringGradient.addColorStop(0, "#8a6744");
ringGradient.addColorStop(0.25, "#e1c69c");
ringGradient.addColorStop(0.5, "#a9845a");
ringGradient.addColorStop(0.75, "#e5d1ad");
ringGradient.addColorStop(1, "#826044");

ringCtx.fillStyle = ringGradient;
ringCtx.fillRect(0, 0, 512, 32);

// Разрывы и полосы колец

for (let i = 0; i < 90; i++) {
    ringCtx.fillStyle = `rgba(30,20,10,${Math.random() * 0.25})`;
    ringCtx.fillRect(0, Math.random() * 32, 512, 1);
}

const ringTexture = new THREE.CanvasTexture(ringCanvas);

const ringMaterial = new THREE.MeshStandardMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
});

const rings = new THREE.Mesh(
    ringGeometry,
    ringMaterial
);

rings.rotation.x = Math.PI * 0.43;
rings.rotation.y = 0.15;

saturn.add(rings);

// ЗВЁЗДЫ

const starsGeometry = new THREE.BufferGeometry();

const starPositions = [];

for (let i = 0; i < 1500; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 80
    );
}

starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08
});

const stars = new THREE.Points(
    starsGeometry,
    starsMaterial
);

scene.add(stars);

// УПРАВЛЕНИЕ МЫШЬЮ

let dragging = false;
let previousX = 0;
let previousY = 0;

renderer.domElement.addEventListener("pointerdown", (event) => {
    dragging = true;
    previousX = event.clientX;
    previousY = event.clientY;

    renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - previousX;
    const dy = event.clientY - previousY;

    saturn.rotation.y += dx * 0.008;
    saturn.rotation.x += dy * 0.008;

    previousX = event.clientX;
    previousY = event.clientY;
});

renderer.domElement.addEventListener("pointerup", () => {
    dragging = false;
});

renderer.domElement.addEventListener("pointercancel", () => {
    dragging = false;
});

// ПРИБЛИЖЕНИЕ

let zoom = 8;

function changeZoom(direction) {
    zoom += direction;

    zoom = Math.max(4, Math.min(12, zoom));

    camera.position.z = zoom;
}

function resetPlanet() {
    saturn.rotation.set(0, 0, 0);
    camera.position.z = 8;
    zoom = 8;
}

// ВИКТОРИНА

function checkAnswer(correct) {
    const result = document.getElementById("result");

    if (correct) {
        result.textContent = "🎉 Правильно! Сатурн — шестая планета от Солнца!";
    } else {
        result.textContent = "❌ Неверно. Попробуй ещё раз!";
    }
}

// АНИМАЦИЯ

function animate() {
    requestAnimationFrame(animate);

    if (!dragging) {
        saturn.rotation.y += 0.002;
    }

    stars.rotation.y += 0.0001;

    renderer.render(scene, camera);
}

animate();

// АДАПТАЦИЯ ПОД РАЗМЕР ОКНА

window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});
