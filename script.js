
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// ========================================
// المشهد والكاميرا
// ========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color('#080609');
scene.fog = new THREE.FogExp2('#080609', 0.004);

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 8, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const container = document.getElementById('scene');
if (container) {
    container.appendChild(renderer.domElement);
} else {
    document.body.appendChild(renderer.domElement);
}

renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.display = 'block';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 3, 0);
controls.minDistance = 5;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI * 0.48;

// ========================================
// الإضاءة
// ========================================
scene.add(new THREE.HemisphereLight('#e3e5ff', '#241113', 2.1));

const sun = new THREE.DirectionalLight('#fff0e4', 3.5);
sun.position.set(8, 14, 9);
sun.castShadow = true;
scene.add(sun);

const redLight = new THREE.PointLight('#c52d45', 35, 20);
redLight.position.set(-4, 5, -3);
scene.add(redLight);

const engineLight = new THREE.PointLight('#ff6b25', 0, 16);
scene.add(engineLight);

// ========================================
// المواد
// ========================================
const white = new THREE.MeshStandardMaterial({
    color: '#f4f0eb',
    roughness: 0.32,
    metalness: 0.12
});

const red = new THREE.MeshStandardMaterial({
    color: '#b51f35',
    roughness: 0.3,
    metalness: 0.2
});

const metal = new THREE.MeshStandardMaterial({
    color: '#9fa8b5',
    metalness: 0.85,
    roughness: 0.25
});

const dark = new THREE.MeshStandardMaterial({
    color: '#21191c',
    roughness: 0.65,
    metalness: 0.4
});

// ========================================
// الأرض ومنصة الإطلاق
// ========================================
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
        color: '#171014',
        roughness: 0.95
    })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

function cylinder(parent, top, bottom, height, material, y) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(top, bottom, height, 48),
        material
    );
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}

const platform = new THREE.Group();
scene.add(platform);

cylinder(platform, 3.4, 3.8, 0.35, dark, 0.05);
cylinder(platform, 2.8, 3.2, 0.12, metal, 0.285);
cylinder(platform, 2.5, 2.7, 0.1, dark, 0.39);

for (let i = 0; i < 32; i++) {
    const angle = i / 32 * Math.PI * 2;
    const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.04, 0.1),
        new THREE.MeshBasicMaterial({ color: '#e13b52' })
    );
    lamp.position.set(
        Math.cos(angle) * 3.15,
        0.27,
        Math.sin(angle) * 3.15
    );
    lamp.rotation.y = -angle;
    platform.add(lamp);
}

// ========================================
// الصاروخ
// ========================================
const rocket = new THREE.Group();
scene.add(rocket);
rocket.position.y = 0.45;

function rocketMesh(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rocket.add(mesh);
    return mesh;
}

// الجسم الرئيسي
rocketMesh(
    new THREE.CylinderGeometry(0.68, 0.73, 4.8, 48),
    white, 0, 3.1, 0
);

// رأس الصاروخ
rocketMesh(
    new THREE.ConeGeometry(0.68, 1.55, 48),
    red, 0, 6.275, 0
);

// الجزء السفلي
rocketMesh(
    new THREE.CylinderGeometry(0.73, 0.8, 0.42, 48),
    red, 0, 0.69, 0
);

// الحلقات المعدنية
for (const y of [1.0, 1.25, 4.75, 5.15]) {
    rocketMesh(
        new THREE.CylinderGeometry(0.705, 0.705, 0.075, 48),
        metal, 0, y, 0
    );
}

// النافذة
const frame = rocketMesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.13, 40),
    metal, 0, 3.65, 0.62
);
frame.rotation.x = Math.PI / 2;

const glass = rocketMesh(
    new THREE.SphereGeometry(0.255, 32, 24),
    new THREE.MeshPhysicalMaterial({
        color: '#68bde9',
        metalness: 0.3,
        roughness: 0.12,
        clearcoat: 1
    }),
    0, 3.65, 0.7
);
glass.scale.z = 0.35;

// الزعانف الأربع
for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.35, 0.95),
        red
    );
    fin.position.set(
        Math.sin(angle) * 0.72,
        1.05,
        Math.cos(angle) * 0.72
    );
    fin.rotation.y = angle;
    fin.castShadow = true;
    rocket.add(fin);
}

// ========================================
// لهب المحرك
// ========================================
const flameGroup = new THREE.Group();
flameGroup.position.y = 0.37;
rocket.add(flameGroup);

const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.48, 2.0, 32),
    new THREE.MeshBasicMaterial({
        color: '#ff5718',
        transparent: true,
        opacity: 0.95
    })
);
outerFlame.rotation.x = Math.PI;
outerFlame.position.y = -0.95;
flameGroup.add(outerFlame);

const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.26, 1.35, 32),
    new THREE.MeshBasicMaterial({
        color: '#fff0a6',
        transparent: true,
        opacity: 0.95
    })
);
innerFlame.rotation.x = Math.PI;
innerFlame.position.y = -0.7;
flameGroup.add(innerFlame);

const engine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.5, 0.45, 32),
    dark
);
engine.position.y = 0.45;
rocket.add(engine);

// ========================================
// نجوم السماء
// ========================================
const starPositions = [];
for (let i = 0; i < 800; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 150,
        Math.random() * 70 + 5,
        (Math.random() - 0.5) * 150
    );
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
        color: '#fff0e8',
        size: 0.15
    })
);
scene.add(stars);

// ========================================
// خامة دخان ناعم وكثيف
// ========================================
function createSmokeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);

    // قاعدة دخان ناعمة بتدرج شفاف
    const gradient = ctx.createRadialGradient(
        128, 128, 5,
        128, 128, 128
    );
    gradient.addColorStop(0, 'rgba(255,255,255,0.82)');
    gradient.addColorStop(0.22, 'rgba(248,246,247,0.65)');
    gradient.addColorStop(0.5, 'rgba(220,216,220,0.28)');
    gradient.addColorStop(0.78, 'rgba(200,194,202,0.08)');
    gradient.addColorStop(1, 'rgba(180,170,185,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // تباين عضوي يعطي السحابة ملمسًا غير منتظم
    for (let i = 0; i < 55; i++) {
        const x = 25 + Math.random() * 206;
        const y = 25 + Math.random() * 206;
        const radius = 10 + Math.random() * 38;

        const puff = ctx.createRadialGradient(
            x, y, 0, x, y, radius
        );
        puff.addColorStop(0, 'rgba(255,255,255,0.12)');
        puff.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = puff;
        ctx.fillRect(
            x - radius, y - radius,
            radius * 2, radius * 2
        );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const smokeTexture = createSmokeTexture();

// ========================================
// نظام دخان منصة الإطلاق
// ========================================
const groundSmoke = [];

for (let i = 0; i < 200; i++) {
    const material = new THREE.SpriteMaterial({
        map: smokeTexture,
        color: i % 4 === 0 ? '#ffffff' : '#e1dcdf',
        transparent: true,
        opacity: 0,
        depthWrite: false
    });

    const sprite = new THREE.Sprite(material);

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 2.8;
    const size = 1.8 + Math.random() * 2.5;

    sprite.position.set(
        Math.cos(angle) * radius,
        0.25 + Math.random() * 0.65,
        Math.sin(angle) * radius
    );
    sprite.scale.set(size, size * 0.8, 1);

    sprite.userData = {
        angle,
        radius,
        size,
        phase: Math.random() * 6,
        speed: 0.2 + Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 0.5
    };

    scene.add(sprite);
    groundSmoke.push(sprite);
}

// ========================================
// دخان خلف الصاروخ أثناء الصعود
// ========================================
const trailSmoke = [];

function emitSmoke() {
    for (let i = 0; i < 10; i++) {
        const material = new THREE.SpriteMaterial({
            map: smokeTexture,
            color: Math.random() > 0.35 ? '#f5f2f3' : '#cfc8ce',
            transparent: true,
            opacity: 0.65,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);

        sprite.position.set(
            rocket.position.x + (Math.random() - 0.5) * 0.9,
            rocket.position.y - 1.2,
            rocket.position.z + (Math.random() - 0.5) * 0.9
        );

        const size = 0.9 + Math.random() * 1.0;
        sprite.scale.set(size, size, 1);

        sprite.userData = {
            vx: (Math.random() - 0.5) * 1.1,
            vy: -0.6 - Math.random() * 1.5,
            vz: (Math.random() - 0.5) * 1.1,
            age: 0,
            lifetime: 2.5 + Math.random() * 2.5,
            growth: 0.65 + Math.random() * 0.65
        };

        scene.add(sprite);
        trailSmoke.push(sprite);
    }
}

// ========================================
// الأزرار والتحكم بالإطلاق
// ========================================
let launching = false;
let launchProgress = 0;
let smokeTimer = 0;
let lastTime = 0;

const launchButton = document.getElementById('launchBtn');
const resetButton = document.getElementById('resetBtn');
const statusElement = document.getElementById('status');
const loadingElement = document.getElementById('loading');

function setStatus(message) {
    if (statusElement) statusElement.textContent = message;
}

function startLaunch() {
    if (launching) return;

    launching = true;
    launchProgress = 0;
    smokeTimer = 0;

    flameGroup.visible = true;

    if (launchButton) {
        launchButton.disabled = true;
        launchButton.textContent = 'جاري الإطلاق...';
    }

    setStatus('تشغيل المحركات... الاستعداد للإقلاع!');
}

function resetRocket() {
    launching = false;
    launchProgress = 0;
    smokeTimer = 0;

    rocket.position.set(0, 0.45, 0);
    rocket.rotation.set(0, 0, 0);
    flameGroup.visible = true;

    for (const puff of trailSmoke) {
        scene.remove(puff);
        puff.material.dispose();
    }
    trailSmoke.length = 0;

    for (const puff of groundSmoke) {
        puff.material.opacity = 0;
    }

    camera.position.set(10, 8, 16);
    controls.target.set(0, 3, 0);
    controls.update();

    engineLight.intensity = 0;

    if (launchButton) {
        launchButton.disabled = false;
        launchButton.textContent = '🚀 إطلاق الصاروخ';
    }

    setStatus('الصاروخ جاهز للإطلاق');
}

if (launchButton) launchButton.addEventListener('click', startLaunch);
if (resetButton) resetButton.addEventListener('click', resetRocket);

// ========================================
// تحديث حجم العرض
// ========================================
function resizeScene() {
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;

    if (width <= 0 || height <= 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

window.addEventListener('resize', resizeScene);

// ========================================
// الحركة الرئيسية
// ========================================
function animate(time = 0) {
    requestAnimationFrame(animate);

    const delta = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;

    const elapsed = time / 1000;

    // حركة المحرك أثناء الانتظار
    if (!launching) {
        rocket.position.y = 0.45 + Math.sin(elapsed * 1.5) * 0.025;
        flameGroup.scale.setScalar(0.95 + Math.sin(elapsed * 12) * 0.06);
    }

    // مرحلة الإطلاق
    let smokePower = 0;

    if (launching) {
        launchProgress = Math.min(launchProgress + delta * 0.18, 1);

        const smooth = launchProgress * launchProgress *
            (3 - 2 * launchProgress);

        rocket.position.y = 0.45 + smooth * 22;

        const shake = (1 - launchProgress) * 0.025;
        rocket.position.x = (Math.random() - 0.5) * shake;
        rocket.rotation.z = Math.sin(elapsed * 22) * shake;

        flameGroup.scale.set(
            0.9 + Math.random() * 0.2,
            0.9 + Math.random() * 0.3,
            0.9 + Math.random() * 0.2
        );

        engineLight.position.set(
            rocket.position.x,
            rocket.position.y - 1.2,
            rocket.position.z
        );
        engineLight.intensity = 30 + Math.random() * 25;

        smokeTimer += delta;
        if (smokeTimer >= 0.025 && launchProgress < 0.97) {
            smokeTimer = 0;
            emitSmoke();
        }

        // الكاميرا تتابع الصاروخ
        if (launchProgress > 0.12) {
            controls.target.y +=
                (rocket.position.y * 0.7 - controls.target.y) * delta * 1.5;
        }

        smokePower = Math.min(launchProgress * 7, 1) *
            Math.max(0, 1 - Math.max(0, launchProgress - 0.55) * 2);

        if (launchProgress >= 1) {
            launching = false;
            flameGroup.visible = false;
            engineLight.intensity = 0;

            if (launchButton) {
                launchButton.disabled = false;
                launchButton.textContent = '🚀 إطلاق الصاروخ';
            }

            setStatus('وصل الصاروخ إلى الفضاء بنجاح!');
        } else if (launchProgress > 0.45) {
            setStatus('الصاروخ يرتفع نحو الفضاء...');
        } else {
            setStatus('انطلاق الصاروخ!');
        }
    }

    // دخان كثيف ينتشر على الأرض
    for (const puff of groundSmoke) {
        const data = puff.userData;

        data.phase += delta * data.speed;

        const spread = data.radius + smokePower * 4.2;

        puff.position.x = Math.cos(data.angle) * spread +
            Math.sin(data.phase) * data.drift;
        puff.position.z = Math.sin(data.angle) * spread;
        puff.position.y = 0.3 +
            Math.sin(data.phase) * 0.18 +
            smokePower * 0.6;

        const size = data.size * (1 + smokePower * 0.9);
        puff.scale.set(size, size * 0.82, 1);

        puff.material.opacity = smokePower *
            (0.3 + Math.sin(data.phase) * 0.04);
    }

    // تحريك سحابة الدخان خلف الصاروخ
    for (let i = trailSmoke.length - 1; i >= 0; i--) {
        const puff = trailSmoke[i];
        const data = puff.userData;

        data.age += delta;

        puff.position.x += data.vx * delta;
        puff.position.y += data.vy * delta;
        puff.position.z += data.vz * delta;

        const scale = 1 + data.age * data.growth;
        puff.scale.set(scale, scale, 1);

        puff.material.opacity =
            0.58 * Math.max(0, 1 - data.age / data.lifetime);

        if (data.age >= data.lifetime) {
            scene.remove(puff);
            puff.material.dispose();
            trailSmoke.splice(i, 1);
        }
    }

    stars.rotation.y += delta * 0.002;

    controls.update();
    renderer.render(scene, camera);
}

// ========================================
// تشغيل المشروع
// ========================================
if (loadingElement) loadingElement.style.display = 'none';

setStatus('الصاروخ جاهز للإطلاق');
resizeScene();
animate();
 