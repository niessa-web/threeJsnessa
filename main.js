import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ================= RENDERER / SCENE / CAMERA ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const DAY_BG = new THREE.Color(0x11162e);
const NIGHT_BG = new THREE.Color(0x05060f);
scene.background = DAY_BG.clone();
scene.fog = new THREE.Fog(scene.background, 18, 45);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 3, 7);

// Environment untuk material PBR yang bagus
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.6;
controls.target.set(0, 1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 3;
controls.maxDistance = 20;

/* ================= LIGHTS ================= */
const keyLight = new THREE.SpotLight(0xffffff, 60, 30, Math.PI / 5, 0.4);
keyLight.position.set(5, 9, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00e5ff, 2.2);
rimLight.position.set(-6, 4, -5);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xff6ec7, 12, 20);
fillLight.position.set(-3, 1.5, 4);
scene.add(fillLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.25));

/* ================= GROUND & PANGGUNG ================= */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(14, 64),
  new THREE.MeshStandardMaterial({ color: 0x151a33, roughness: 0.85, metalness: 0.25 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Cincin neon di lantai
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(3.2, 0.035, 16, 120),
  new THREE.MeshBasicMaterial({ color: 0x00e5ff })
);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.02;
scene.add(ring);

// Grid halus
const grid = new THREE.GridHelper(28, 28, 0x2a3560, 0x1b2342);
grid.position.y = 0.001;
scene.add(grid);

/* ================= PARTIKEL DEBU BINTANG ================= */
const P_COUNT = 350;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(P_COUNT * 3);
for (let i = 0; i < P_COUNT; i++) {
  pPos[i * 3]     = (Math.random() - 0.5) * 24;
  pPos[i * 3 + 1] = Math.random() * 9 + 0.3;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
  color: 0x8fd7ff, size: 0.05, transparent: true, opacity: 0.7,
  blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(particles);

/* ================= LOAD MODEL Little_Man.glb ================= */
const loaderEl = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
let model = null;
let mixer = null;
const baseScale = new THREE.Vector3();

new GLTFLoader().load(
  'Little_Man.glb',
  (gltf) => {
    model = gltf.scene;

    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material.userData.baseEmissive = obj.material.emissive?.clone();
      }
    });

    // Normalisasi ukuran & posisi
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const height = size.y || 1;
    const s = 2.6 / height;
    model.scale.setScalar(s);
    baseScale.copy(model.scale);

    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += (box.max.y - box.min.y) / 2;

    scene.add(model);

    // Animasi bawaan model (jika ada)
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
    }

    loaderEl.classList.add('hidden');
  },
  (xhr) => {
    const pct = Math.round((xhr.loaded / (xhr.total || 1)) * 100);
    loaderText.textContent = `Memuat Little_Man.glb ... ${pct}%`;
  },
  (err) => {
    loaderText.textContent = 'Gagal memuat model 😢 (jalankan lewat local server)';
    console.error(err);
  }
);

/* ================= UI CONTROLS ================= */
const $ = (id) => document.getElementById(id);

let partyMode = false;

$('btn-rotate').onclick = (e) => {
  controls.autoRotate = !controls.autoRotate;
  e.currentTarget.classList.toggle('active', controls.autoRotate);
};

$('btn-wireframe').onclick = (e) => {
  const on = e.currentTarget.classList.toggle('active');
  model?.traverse((o) => {
    if (o.isMesh) {
      o.material.wireframe = on;
      if (on) o.material.emissive?.set(0x00e5ff);
      else if (o.material.userData.baseEmissive) o.material.emissive.copy(o.material.userData.baseEmissive);
    }
  });
};

$('btn-night').onclick = (e) => {
  const on = e.currentTarget.classList.toggle('active');
  const bg = on ? NIGHT_BG : DAY_BG;
  scene.background.copy(bg);
  scene.fog.color.copy(bg);
  scene.environmentIntensity = on ? 0.25 : 1;
};

$('btn-party').onclick = (e) => {
  partyMode = e.currentTarget.classList.toggle('active');
};

$('btn-screenshot').onclick = () => {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.href = renderer.domElement.toDataURL('image/png');
  a.download = 'little-man-screenshot.png';
  a.click();
};

$('light-color').oninput = (e) => {
  rimLight.color.set(e.target.value);
  ring.material.color.set(e.target.value);
};

$('scale').oninput = (e) => {
  if (!model) return;
  model.scale.copy(baseScale).multiplyScalar(parseFloat(e.target.value));
};

$('speed').oninput = (e) => {
  animSpeed = parseFloat(e.target.value);
};
let animSpeed = 1;

/* ================= LOOP ================= */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  if (mixer) mixer.update(dt * animSpeed);

  // Partikel melayang naik
  const pos = particles.geometry.attributes.position;
  for (let i = 0; i < P_COUNT; i++) {
    let y = pos.getY(i) + dt * 0.35;
    if (y > 9.5) y = 0.2;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  particles.rotation.y += dt * 0.03;

  // Ring neon berdenyut
  const pulse = 1 + Math.sin(t * 2.5) * 0.04;
  ring.scale.setScalar(pulse);

  // Party lights 🎉
  if (partyMode) {
    rimLight.color.setHSL((t * 0.25) % 1, 1, 0.6);
    fillLight.color.setHSL((t * 0.25 + 0.5) % 1, 1, 0.6);
    ring.material.color.copy(rimLight.color);
    keyLight.intensity = 45 + Math.sin(t * 8) * 25;
  } else {
    keyLight.intensity = 60;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ================= RESIZE ================= */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
