// ─── ZONES DATA ────────────────────────────────────────────────────────────────
const ZONES = [
  {
    id: 'about', label: 'ABOUT ME', x: 0, z: -15, color: 0xff85a2,
    tag: 'INTRODUCTION', title: 'Hello, I am Neha Raut!',
    body: `Not just a developer — a digital architect who turns caffeine and curiosity into impactful digital experiences. With a B.Tech in IT and a love for all things full-stack, I craft web applications that are fast, intelligent, and visually alive.\n\nFrom research papers on OTP security to building immersive 3D environments, my journey is anything but ordinary. I write code that solves real problems — and occasionally makes people go "wow".`,

    extra: 'about'
  },
  {
    id: 'projects', label: 'PROJECTS', x: 30, z: -40, color: 0x5dbcd2,
    tag: 'PORTFOLIO', title: 'My Creations',
    body: `Here is a collection of things I've built. Each project represents a new challenge conquered and new technologies learned in my journey as an IT Engineer.`,
    extra: 'projects'
  },
  {
    id: 'skills', label: 'SKILLS', x: -30, z: -40, color: 0x9370db,
    tag: 'EXPERTISE', title: 'Technical Arsenal',
    body: `I adapt to the right tool for the job. Here are some of the technologies and languages I've mastered during my B.Tech and beyond.`,
    extra: 'skills'
  },
  {
    id: 'contact', label: 'CONTACT', x: 0, z: -70, color: 0xffaa00,
    tag: 'CONNECT', title: 'Let\'s Build Together',
    body: `I am currently open to exciting new opportunities and collaborations. If you are looking for a dedicated IT Engineer to bring your ideas to life, reach out!`,
    extra: 'contact'
  }
];

const PANEL_EXTRAS = {
  about: `<div class="panel-grid">
    <div class="panel-item"><span>Degree</span>B.Tech in IT</div>
    <div class="panel-item"><span>Role</span>Software Engineer</div>
    <div class="panel-item"><span>Status</span>Open to Work ✦</div>
    <div class="panel-item"><span>Focus</span>Web & Systems</div>
  </div>`,
  projects: `<div style="display:flex;flex-direction:column;gap:1rem;">
    ${[
      { name: 'Bachatgat Management Platform (2025)', stack: 'React.js · JavaScript · Modern UI', desc: 'A comprehensive web application designed to digitize and streamline the financial tracking, member management, and regular operational records of local Self-Help Groups.' },
      { name: 'Alpha Identification Based OTP System (2024)', stack: 'Node.js · Express.js · MongoDB · Twilio · React.js', desc: 'A secure authentication system using unique alphanumeric patterns for OTP generation, minimizing unauthorized access. Published in the IRJ on Advanced Engineering Hub.' },
      { name: 'J-ScriptPlug-in: Android Pattern Lock Simulator (2021)', stack: 'HTML · CSS · Research & Analysis', desc: 'A web-based solution replacing traditional passwords with an Android-style pattern lock. Published in the IRJ on Advanced Engineering Hub.' }
    ].map(p => `<div style="border:1px solid rgba(255,255,255,0.2);padding:1rem;border-radius:12px;">
      <div style="font-size:0.9rem;font-weight:800;color:var(--accent);margin-bottom:0.3rem;">${p.name}</div>
      <div style="font-size:0.7rem;opacity:0.8;margin-bottom:0.4rem;font-weight:600;">${p.stack}</div>
      <div style="font-size:0.75rem;">${p.desc}</div>
    </div>`).join('')} 
  </div>`,
  skills: `<div class="skill-pills">${[
    'HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js',
    'Express.js', 'REST API', 'MySQL', 'Tools', 'Git',
    'GitHub', 'Postman'
  ].map(s => `<div class="skill-pill">${s}</div>`).join('')}</div>`,
  contact: `<div class="panel-grid">
    <div class="panel-item"><span>Email</span><a href="mailto:nehasraut02@gmail.com">nehasraut02@gmail.com</a></div>
    <div class="panel-item"><span>GitHub</span><a href="https://github.com/Rautneha16" target="_blank">https://github.com/Rautneha16</a></div>
    <div class="panel-item"><span>LinkedIn</span><a href="https://www.linkedin.com/in/neha-raut0516/" target="_blank">https://www.linkedin.com/in/neha-raut0516/</a></div>
    <div class="panel-item"><span>Whatsapp</span><a href="#" onclick="openWhatsApp(event, '917420008485')">+917420008485</a></div>
  </div>
  <div class="proj-links">
    <a href="mailto:nehasraut02@gmail.com" class="proj-link">Send Email</a>
  </div>`
};

window.openWhatsApp = function (e, phone) {
  e.preventDefault();
  const hour = new Date().getHours();
  let greeting = 'night';
  if (hour >= 5 && hour < 12) greeting = 'morning';
  else if (hour >= 12 && hour < 17) greeting = 'afternoon';
  else if (hour >= 17 && hour < 21) greeting = 'evening';
  const text = `Hello good ${greeting}, I viewed your portfolio and I'm interested in connecting with you.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
};

// ─── THREE.JS SETUP ────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x87CEEB); // Sky blue
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const SKY_DAY = new THREE.Color(0x87CEEB);
const SKY_NIGHT = new THREE.Color(0x0b1026);
scene.background = SKY_NIGHT.clone(); // Starts in Dark Mode
scene.fog = new THREE.FogExp2(0x0b1026, 0.012);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 8, 20);

// ─── COLLISION OBJECTS REGISTRY ───────────────────────────────────────────────
// Simple sphere-based colliders: {x, z, r} in world space
const colliders = [];
// Temple block (rough footprint)
colliders.push({ x: 0, z: -5, r: 9 });
// Will add tree and rock colliders after they are placed

// Car wobble state
const carWobble = { active: false, time: 0, duration: 0.8, strength: 0 };

// ─── LIGHTING & DAY/NIGHT CYCLE ────────────────────────────────────────────────
// Toned-down ambient: not too harsh in day mode
const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.1); // start dark
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffee, 0.0); // start dark
dirLight.position.set(50, 60, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 150;
const d = 50;
dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

let isNight = true; // Dark mode by default
let envPlants = [];
let skyTime = isNight ? 1 : 0;
let shootingStarTimer = 5;

// Sky Bodies (Sun / Moon / Stars)
const skyGeo = new THREE.SphereGeometry(18, 32, 32);
const skyMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
const skyBody = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyBody);

const starsGeo = new THREE.BufferGeometry();
const stPos = new Float32Array(800 * 3);
for (let i = 0; i < 800; i++) {
  const r = 200 + Math.random() * 50;
  const t1 = Math.random() * Math.PI * 2;
  const t2 = Math.random() * Math.PI;
  stPos[i * 3] = r * Math.sin(t1) * Math.cos(t2);
  stPos[i * 3 + 1] = Math.abs(r * Math.sin(t2));
  stPos[i * 3 + 2] = r * Math.cos(t1) * Math.cos(t2);
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 1 });
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

const shMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
const shootingStar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.4, 25, 4), shMat);
shootingStar.rotation.x = Math.PI / 2;
scene.add(shootingStar);

document.getElementById('themeToggle').addEventListener('click', () => {
  isNight = !isNight;
  document.body.classList.toggle('dark-mode', isNight);
  document.getElementById('themeToggle').textContent = isNight ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// ─── GROUND (GRASS HILLS) ─────────────────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(300, 300, 60, 60);
// Realistic earthy green grass, not neon
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x3d8c40,
  roughness: 1.0, metalness: 0.05
});
const posG = groundGeo.attributes.position;
for (let i = 0; i < posG.count; i++) {
  // PlaneGeometry vertices are in XY plane before rotation — X is world X, Y is world Z
  const px = posG.getX(i), py = posG.getY(i);
  const dist = Math.sqrt(px * px + py * py);
  let h = Math.sin(px * 0.1) * Math.cos(py * 0.1) * 1.0;
  if (dist > 70) h += Math.pow((dist - 70) * 0.1, 2);
  posG.setZ(i, h); // setZ becomes world Y after rotation.x = -PI/2
}
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ─── CLOUDS ───────────────────────────────────────────────────────────────────
const clouds = new THREE.Group();
const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, flatShading: true });

// ─── SKID MARKS ───────────────────────────────────────────────────────────────
let carLightsOn = true;
const maxSkids = 200;
const skidGeo = new THREE.PlaneGeometry(0.8, 0.4);
const skidMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.6, depthWrite: false });
const skidMarks = new THREE.InstancedMesh(skidGeo, skidMat, maxSkids);
skidMarks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(skidMarks);
let skidIdx = 0;
const skidDummy = new THREE.Object3D();
function createSkidMark(x, z, angle) {
  skidDummy.position.set(x, getGroundHeight(x, z) + 0.05, z);
  skidDummy.rotation.x = -Math.PI / 2;
  skidDummy.rotation.z = -angle;
  skidDummy.updateMatrix();
  skidMarks.setMatrixAt(skidIdx, skidDummy.matrix);
  skidMarks.instanceMatrix.needsUpdate = true;
  skidIdx = (skidIdx + 1) % maxSkids;
}
for (let i = 0; i < 15; i++) {
  const g = new THREE.Group();
  for (let j = 0; j < 5; j++) {
    const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(2 + Math.random() * 2, 1), cloudMat);
    mesh.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 5);
    g.add(mesh);
  }
  g.position.set((Math.random() - 0.5) * 200, 40 + Math.random() * 20, (Math.random() - 0.5) * 200);
  clouds.add(g);
}
scene.add(clouds);

// ─── CHERRY BLOSSOM TREES (IMPROVED) ────────────────────────────────────────
function makeSakura(x, z, scale = 1) {
  const g = new THREE.Group();
  envPlants.push(g);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 1.0 });
  // Multi-segment trunk for natural look
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, 3.5 * scale, 7), trunkMat);
  trunk.position.y = 1.75 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  // Branch
  const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.8 * scale, 5), trunkMat);
  branch1.position.set(0.6 * scale, 3.8 * scale, 0);
  branch1.rotation.z = 0.5;
  branch1.castShadow = true;
  g.add(branch1);
  const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.6 * scale, 5), trunkMat);
  branch2.position.set(-0.5 * scale, 3.6 * scale, 0.3 * scale);
  branch2.rotation.z = -0.45;
  branch2.castShadow = true;
  g.add(branch2);

  // Blossom clusters
  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0xffaec0, roughness: 0.8 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0xff85a2, roughness: 0.8 });
  const leafMat3 = new THREE.MeshStandardMaterial({ color: 0xffc8d6, roughness: 0.8 });
  const mats = [leafMat1, leafMat2, leafMat3];
  const clusters = [
    { y: 4.2, s: 2.0, ox: 0, oz: 0 },
    { y: 3.8, s: 1.6, ox: 1.4, oz: 0.4 },
    { y: 3.6, s: 1.5, ox: -1.2, oz: -0.6 },
    { y: 4.0, s: 1.7, ox: -0.4, oz: 1.3 },
    { y: 3.5, s: 1.3, ox: 0.8, oz: -1.1 },
    { y: 4.5, s: 1.2, ox: 0.2, oz: 0.5 },
  ];
  clusters.forEach((c, i) => {
    const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(c.s * scale, 1), mats[i % 3]);
    leaf.position.set(c.ox * scale, c.y * scale, c.oz * scale);
    leaf.rotation.set(Math.random(), Math.random(), Math.random());
    leaf.castShadow = true;
    g.add(leaf);
  });

  g.position.set(x, getGroundHeight(x, z), z);
  scene.add(g);
  return g;
}

// Small bamboo bush
function makeBush(x, z, scale = 1) {
  const g = new THREE.Group();
  envPlants.push(g);
  const mat = new THREE.MeshStandardMaterial({ color: 0x4a7c3f, roughness: 0.9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a6030, roughness: 0.9 });
  for (let i = 0; i < 3; i++) {
    const h = (0.6 + Math.random() * 0.4) * scale;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, h * 2, 5), mat);
    stem.position.set((Math.random() - 0.5) * 0.5 * scale, h * scale, (Math.random() - 0.5) * 0.5 * scale);
    g.add(stem);
    const top = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * scale, 0), darkMat);
    top.position.set(stem.position.x, stem.position.y + h * scale, stem.position.z);
    g.add(top);
  }
  g.position.set(x, getGroundHeight(x, z), z);
  scene.add(g);
}

// Tree positions — NO trees near origin (car spawn area 0,5 to 0,10)
// Cleared corridor from z=0 to z=-5 along x=0 for car
const treeCoords = [
  // Left side
  [-12, 5], [-18, -5], [-8, -10], [-22, -18], [-14, -28],
  [-30, -35], [-10, -50], [-22, -58], [-35, -48],
  // Right side
  [12, 5], [18, -5], [8, -10], [22, -18], [14, -28],
  [30, -35], [10, -50], [22, -58], [35, -48],
  // Far back near contact zone
  [-15, -65], [15, -65],
];

// ─── MOUNTAINS (SNOW ILLUSION) ────────────────────────────────────────────────
const mGeo = new THREE.ConeGeometry(50, 90, 4);
const mMat = new THREE.MeshStandardMaterial({ color: 0x2b3833, roughness: 1.0, flatShading: true });
const mSnowGeo = new THREE.ConeGeometry(22, 40, 4);
const mSnowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true });
for (let i = 0; i < 25; i++) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(mGeo, mMat);
  m.position.y = 45;
  const snow = new THREE.Mesh(mSnowGeo, mSnowMat);
  snow.position.y = 70.1;
  g.add(m, snow);

  const ang = Math.PI * 0.8 + Math.random() * Math.PI * 1.4; // Wrapped around the far back
  const dist = 180 + Math.random() * 80;
  g.position.set(Math.sin(ang) * dist, -10 + Math.random() * 15, Math.cos(ang) * dist);
  g.rotation.y = Math.random() * 2;
  scene.add(g);
}

// Register trees as colliders (push into global array)
treeCoords.forEach(([x, z]) => colliders.push({ x, z, r: 2.2 }));

// ─── BIG DECORATIVE ROCKS ─────────────────────────────────────────────────────
const rockMat1 = new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.9, flatShading: true });
const rockMat2 = new THREE.MeshStandardMaterial({ color: 0x525252, roughness: 0.9, flatShading: true });
const rockMat3 = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.9, flatShading: true });

function makeRock(x, z, scale = 1, mat = rockMat1) {
  const g = new THREE.Group();
  // Solid boulder (Dodecahedron without vertex shredding to prevent hollow/flipped faces)
  const bGeo = new THREE.DodecahedronGeometry(scale, 0);
  const boulder = new THREE.Mesh(bGeo, mat);
  boulder.scale.set(0.8 + Math.random() * 0.4, 0.6 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
  boulder.position.y = scale * 0.3;
  boulder.castShadow = true; boulder.receiveShadow = true;
  g.add(boulder);

  // Several smaller accent rocks
  for (let j = 0; j < 3; j++) {
    const sGeo = new THREE.DodecahedronGeometry(scale * (0.2 + Math.random() * 0.3), 0);
    const smallRock = new THREE.Mesh(sGeo, j === 0 ? rockMat2 : mat);
    smallRock.scale.set(0.8 + Math.random() * 0.4, 0.5 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
    smallRock.position.set((Math.random() - 0.5) * scale * 1.8, 0, (Math.random() - 0.5) * scale * 1.8);
    smallRock.castShadow = true;
    g.add(smallRock);
  }

  g.position.set(x, getGroundHeight(x, z) - 0.1, z);
  scene.add(g);
  colliders.push({ x, z, r: scale * 1.2 });
  return g;
}

// Place scenic rocks around the world
const rockDefs = [
  [18, 3, 1.6, rockMat1], [-18, 3, 1.4, rockMat2],
  [6, -3, 1.0, rockMat3], [-6, -3, 0.9, rockMat1],
  [38, -25, 2.2, rockMat1], [-38, -25, 2.0, rockMat2],
  [20, -55, 1.8, rockMat3], [-20, -55, 1.5, rockMat1],
  [0, -85, 2.5, rockMat2], [25, -72, 1.3, rockMat3],
];
rockDefs.forEach(([x, z, s, m]) => makeRock(x, z, s, m));

treeCoords.forEach(([x, z]) => {
  makeSakura(x, z, 0.9 + Math.random() * 0.6);
  if (Math.random() > 0.4) makeBush(x + (Math.random() - 0.5) * 3, z + (Math.random() - 0.5) * 3, 0.6 + Math.random() * 0.4);
});

// ─── SNOWFLAKES + PETALS COMBO ────────────────────────────────────────────────
// Petals
const pCount = 600;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 120;
  pPos[i * 3 + 1] = Math.random() * 35;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0xffb7c5, size: 0.35, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
const petals = new THREE.Points(pGeo, pMat);
scene.add(petals);

// Snowflakes with best texture
const sfCvs = document.createElement('canvas');
sfCvs.width = 32; sfCvs.height = 32;
const sfCtx = sfCvs.getContext('2d');
const sfGrad = sfCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
sfGrad.addColorStop(0, 'rgba(255,255,255,1)');
sfGrad.addColorStop(0.4, 'rgba(255,255,255,0.8)');
sfGrad.addColorStop(1, 'rgba(255,255,255,0)');
sfCtx.fillStyle = sfGrad;
sfCtx.beginPath();
sfCtx.arc(16, 16, 16, 0, Math.PI * 2);
sfCtx.fill();
const sfTex = new THREE.CanvasTexture(sfCvs);

const sCount = 600;
const sGeo = new THREE.BufferGeometry();
const sPos = new Float32Array(sCount * 3);
for (let i = 0; i < sCount; i++) {
  sPos[i * 3] = (Math.random() - 0.5) * 150;
  sPos[i * 3 + 1] = Math.random() * 40;
  sPos[i * 3 + 2] = (Math.random() - 0.5) * 150;
}
sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
const sMat = new THREE.PointsMaterial({
  color: 0xffffff, size: 0.6, map: sfTex,
  transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending
});
const snowflakes = new THREE.Points(sGeo, sMat);
scene.add(snowflakes);


// ─── PORTFOLIO ZONES (TORII GATES) ────────────────────────────────────────────
const zoneGroups = [];
function makeToriiZone(zone) {
  const g = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

  // Pillars
  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8), woodMat);
  p1.position.set(-2.5, 2.25, 0); p1.castShadow = true;
  const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8), woodMat);
  p2.position.set(2.5, 2.25, 0); p2.castShadow = true;

  // Bases
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8), blackMat);
  b1.position.set(-2.5, 0.3, 0); b1.castShadow = true;
  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8), blackMat);
  b2.position.set(2.5, 0.3, 0); b2.castShadow = true;

  // Top beams
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 0.5), woodMat);
  t1.position.set(0, 4.3, 0); t1.castShadow = true;
  const t2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.3, 0.4), woodMat);
  t2.position.set(0, 3.5, 0); t2.castShadow = true;

  // Platform
  const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 5), blackMat);
  plat.position.set(0, 0.1, 0); plat.receiveShadow = true;

  g.add(p1, p2, b1, b2, t1, t2, plat);

  // Animated glowing symbol character inside
  const symMat = new THREE.MeshStandardMaterial({ color: zone.color, emissive: zone.color, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
  const symbol = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), symMat);
  symbol.position.set(0, 1.5, 0);
  symbol.castShadow = true;
  g.add(symbol);

  // Glowing ambient light
  const light = new THREE.PointLight(zone.color, 2, 10);
  light.position.set(0, 2, 0);
  g.add(light);

  // Billboard Name
  const cvs = document.createElement('canvas');
  cvs.width = 512; cvs.height = 128;
  const ctx = cvs.getContext('2d');
  // Background fill — must use fillRect, not fill() on empty path
  ctx.fillStyle = 'rgba(20,0,10,0.6)';
  ctx.fillRect(0, 0, 512, 128);
  // Colored border
  ctx.strokeStyle = '#' + zone.color.toString(16).padStart(6, '0');
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 124);
  ctx.font = 'bold 48px arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(zone.label, 256, 64);
  const tex = new THREE.CanvasTexture(cvs);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.8), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }));
  label.position.set(0, 5.5, 0);
  label.userData = { billboard: true };
  g.add(label);

  g.position.set(zone.x, getGroundHeight(zone.x, zone.z), zone.z);
  scene.add(g);
  zoneGroups.push({ group: g, symbol, light, label, id: zone.id });
  // Add collider
  colliders.push({ x: zone.x, z: zone.z, r: 4 });
}
ZONES.forEach(z => makeToriiZone(z));

// ─── JAPANESE MAIN TEMPLE (CENTER) ────────────────────────────────────────────
function makeTemple() {
  const g = new THREE.Group();
  const tCvs = document.createElement('canvas');
  tCvs.width = 64; tCvs.height = 64;
  const tCtx = tCvs.getContext('2d');
  tCtx.fillStyle = '#222'; tCtx.fillRect(0, 0, 64, 64);
  tCtx.fillStyle = '#111'; tCtx.fillRect(0, 60, 64, 4);
  const tTex = new THREE.CanvasTexture(tCvs);
  tTex.wrapS = THREE.RepeatWrapping; tTex.wrapT = THREE.RepeatWrapping;
  tTex.repeat.set(4, 4);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.9 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xbb2222, roughness: 0.8 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 1.0 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6b800, roughness: 0.3, metalness: 0.8 });
  const tileMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8, map: tTex });

  // Much grander, realistic temple
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1.0 });
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 20), baseMat);
  base1.position.y = 0.25; base1.receiveShadow = true;
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 16), baseMat);
  base2.position.y = 0.8; base2.receiveShadow = true;
  const base3 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 12), baseMat);
  base3.position.y = 1.35; base3.receiveShadow = true;
  g.add(base1, base2, base3);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(13, 0.2, 13), woodMat);
  deck.position.y = 1.7; deck.receiveShadow = true; deck.castShadow = true;
  g.add(deck);

  for (let px = -5.5; px <= 5.5; px += 11) {
    for (let pz = -5.5; pz <= 5.5; pz += 11) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), redMat);
      p.position.set(px, 4.2, pz); p.castShadow = true; g.add(p);
    }
  }

  const core = new THREE.Mesh(new THREE.BoxGeometry(9, 4.5, 9), woodMat);
  core.position.set(0, 4.05, 0); core.castShadow = true; core.receiveShadow = true;
  g.add(core);

  // Glowing altar inside open front
  const altarGlow = new THREE.PointLight(0xffaa00, 3, 20);
  altarGlow.position.set(0, 3, -1);
  const altar = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), goldMat);
  altar.position.set(0, 2.5, -2);
  altar.castShadow = true;
  g.add(altarGlow, altar);

  // Roof Tier 1 (Lower Eave)
  const roofEave1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 14), woodMat);
  roofEave1.position.set(0, 6.5, 0); roofEave1.castShadow = true; g.add(roofEave1);
  const roofSlope1 = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 9, 2.5, 4, 1), tileMat);
  roofSlope1.position.set(0, 7.9, 0); roofSlope1.rotation.y = Math.PI / 4; roofSlope1.castShadow = true;
  g.add(roofSlope1);

  // Second Floor Room
  const floor2 = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 7), woodMat);
  floor2.position.set(0, 10.6, 0); floor2.castShadow = true; g.add(floor2);

  // Wooden balcony 2nd tier
  const deck2 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.2, 8.5), woodMat);
  deck2.position.set(0, 9.2, 0); deck2.castShadow = true; g.add(deck2);

  // Roof Tier 2
  const roofEave2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 10), woodMat);
  roofEave2.position.set(0, 12.3, 0); roofEave2.castShadow = true; g.add(roofEave2);
  const roofSlope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7.5, 3.5, 4, 1), tileMat);
  roofSlope2.position.set(0, 14.2, 0); roofSlope2.rotation.y = Math.PI / 4; roofSlope2.castShadow = true;
  g.add(roofSlope2);

  // Top Spire
  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 8), tileMat);
  spireBase.position.set(0, 16.2, 0); g.add(spireBase);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 3, 6), goldMat);
  spire.position.set(0, 17.9, 0); spire.castShadow = true; g.add(spire);
  const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), goldMat);
  ball1.position.set(0, 18.5, 0); g.add(ball1);
  const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), goldMat);
  ball2.position.set(0, 19.1, 0); g.add(ball2);

  for (let s = 0; s < 6; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 0.8), baseMat);
    step.position.set(0, s * 0.25 + 0.125, 6 - s * 0.8);
    step.receiveShadow = true;
    g.add(step);
  }

  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 1.0 });
  [[-4.5, 5], [4.5, 5], [-3, 11], [3, 11]].forEach(([lx, ly]) => {
    const lBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8), lanternMat);
    lBody.position.set(lx, ly, 4.8);
    const lGlow = new THREE.PointLight(0xffaa00, 1.5, 10);
    lGlow.position.set(lx, ly, 4.8);
    g.add(lBody, lGlow);
  });

  g.position.set(0, getGroundHeight(0, -5), -5);
  scene.add(g);

  // Realistic Gravel Path
  const pCvs = document.createElement('canvas');
  pCvs.width = 256; pCvs.height = 256;
  const pCtx = pCvs.getContext('2d');
  pCtx.fillStyle = '#848478'; pCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4000; i++) {
    pCtx.fillStyle = Math.random() > 0.5 ? '#6c6c60' : '#9a9a8c';
    pCtx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 2, 2 + Math.random() * 2);
  }
  const pTex = new THREE.CanvasTexture(pCvs);
  pTex.wrapS = THREE.RepeatWrapping; pTex.wrapT = THREE.RepeatWrapping;
  const pathMat = new THREE.MeshStandardMaterial({
    map: pTex,
    roughness: 1.0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

  function makePath(x1, z1, x2, z2, w = 2) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const segs = Math.max(1, Math.floor(len * 2));
    const geo = new THREE.PlaneGeometry(w, len, 1, segs);

    geo.rotateX(-Math.PI / 2);
    geo.rotateY(Math.atan2(dx, dz));
    geo.translate((x1 + x2) / 2, 0, (z1 + z2) / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let vx = pos.getX(i);
      let vz = pos.getZ(i);
      pos.setY(i, getGroundHeight(vx, vz) + 0.04);
    }
    geo.computeVertexNormals();

    const uvs = geo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      uvs.setX(i, uvs.getX(i) * w);
      uvs.setY(i, uvs.getY(i) * (len / 2)); // stretch slightly
    }

    const mesh = new THREE.Mesh(geo, pathMat);
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Smooth junctions (circles)
    const jGeo = new THREE.CircleGeometry(w / 2 + 0.3, 16);
    jGeo.rotateX(-Math.PI / 2);
    jGeo.translate(x1, 0, z1);
    const jPos = jGeo.attributes.position;
    for (let i = 0; i < jPos.count; i++) {
      jPos.setY(i, getGroundHeight(jPos.getX(i), jPos.getZ(i)) + 0.041);
    }
    jGeo.computeVertexNormals();

    const jUvs = jGeo.attributes.uv;
    for (let i = 0; i < jUvs.count; i++) { jUvs.setX(i, jUvs.getX(i) * w); jUvs.setY(i, jUvs.getY(i) * w); }
    const jMesh1 = new THREE.Mesh(jGeo, pathMat);
    jMesh1.receiveShadow = true;
    scene.add(jMesh1);

    const jGeo2 = new THREE.CircleGeometry(w / 2 + 0.3, 16);
    jGeo2.rotateX(-Math.PI / 2);
    jGeo2.translate(x2, 0, z2);
    const jPos2 = jGeo2.attributes.position;
    for (let i = 0; i < jPos2.count; i++) {
      jPos2.setY(i, getGroundHeight(jPos2.getX(i), jPos2.getZ(i)) + 0.041);
    }
    jGeo2.computeVertexNormals();

    const jUvs2 = jGeo2.attributes.uv;
    for (let i = 0; i < jUvs2.count; i++) { jUvs2.setX(i, jUvs2.getX(i) * w); jUvs2.setY(i, jUvs2.getY(i) * w); }
    const jMesh2 = new THREE.Mesh(jGeo2, pathMat);
    jMesh2.receiveShadow = true;
    scene.add(jMesh2);
  }

  // Connected roads network
  makePath(0, 12, 0, 3.3, 3);
  makePath(0, -7, 0, -15, 2.5);
  makePath(0, -15, 30, -40, 2);
  makePath(0, -15, -30, -40, 2);
  makePath(30, -40, 0, -70, 2);
  makePath(-30, -40, 0, -70, 2);
  makePath(30, -40, -30, -40, 1.8);
}
makeTemple();

// ─── STREET LAMPS & BENCHES ───────────────────────────────────────────────────
const streetLamps = [];
function makeStreetLamp(x, z, rotY = 0) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 12, 8), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
  pole.position.y = -2; pole.castShadow = true;
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  top.position.set(0.3, 4, 0); top.castShadow = true;
  const bulbColor = 0xffba00; // Strong streetlamp yellow
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: bulbColor }));
  bulb.position.set(0.55, 3.9, 0);
  const spot = new THREE.PointLight(bulbColor, 0, 20);
  spot.position.set(0.55, 3.8, 0);

  // Dust particles dancing under the light
  const dGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(40 * 3);
  for (let i = 0; i < 40; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * 1.5;
    dPos[i * 3 + 1] = -Math.random() * 3;
    dPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dMat = new THREE.PointsMaterial({ color: bulbColor, size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const dust = new THREE.Points(dGeo, dMat);
  dust.position.set(0.55, 3.8, 0);

  g.add(pole, top, bulb, spot, dust);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  streetLamps.push({ spot, dust });
  colliders.push({ x, z, r: 0.5 });
}

function makeBench(x, z, rotY = 0) {
  const g = new THREE.Group();
  const wMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
  const iMat = new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.8 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.6), wMat);
  seat.position.y = 0.45; seat.castShadow = true;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.1), wMat);
  back.position.set(0, 0.75, -0.25); back.castShadow = true;
  const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.6), iMat);
  l1.position.set(0.7, 0.225, 0); l1.castShadow = true;
  const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.6), iMat);
  l2.position.set(-0.7, 0.225, 0); l2.castShadow = true;
  g.add(seat, back, l1, l2);
  g.position.set(x, getGroundHeight(x, z), z);
  g.rotation.y = rotY;
  scene.add(g);
  colliders.push({ x, z, r: 1.2 });
}

const decorationSpots = [
  { x: -2.5, z: 6, faceLamp: 0, faceBench: Math.PI / 2 },   // Left side
  { x: 2.5, z: 6, faceLamp: Math.PI, faceBench: -Math.PI / 2 },  // Right side
  { x: -2.5, z: -10, faceLamp: 0, faceBench: Math.PI / 2 },
  { x: 2.5, z: -10, faceLamp: Math.PI, faceBench: -Math.PI / 2 },
  { x: 28, z: -38, faceLamp: Math.PI, faceBench: Math.PI },
  { x: -28, z: -38, faceLamp: 0, faceBench: Math.PI }
];

decorationSpots.forEach(s => {
  makeStreetLamp(s.x, s.z, s.faceLamp);
  makeBench(s.x, s.z + 2, s.faceBench);
});

// ─── FLOWERS & SNOW PATCHES ───────────────────────────────────────────────────
const flowerGeo = new THREE.BufferGeometry();
const fPos = [], fCol = [];
const flColors = [new THREE.Color(0xff4477), new THREE.Color(0xffaa00), new THREE.Color(0x2288ff), new THREE.Color(0xffffff)];
for (let i = 0; i < 400; i++) {
  const x = (Math.random() - 0.5) * 180;
  const z = (Math.random() - 0.5) * 180;
  if (Math.sqrt(x * x + z * z) > 6 && Math.sqrt(x * x + z * z) < 85) {
    fPos.push(x, getGroundHeight(x, z) + 0.06, z);
    const c = flColors[Math.floor(Math.random() * flColors.length)];
    fCol.push(c.r, c.g, c.b);
  }
}
flowerGeo.setAttribute('position', new THREE.Float32BufferAttribute(fPos, 3));
flowerGeo.setAttribute('color', new THREE.Float32BufferAttribute(fCol, 3));
const flowers = new THREE.Points(flowerGeo, new THREE.PointsMaterial({ size: 0.35, vertexColors: true }));
scene.add(flowers);

for (let i = 0; i < 50; i++) { // Snow patches
  const x = (Math.random() - 0.5) * 180, z = (Math.random() - 0.5) * 180;
  const patch = new THREE.Mesh(new THREE.CylinderGeometry(1 + Math.random() * 3, 1 + Math.random() * 3, 0.05, 7), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }));
  patch.position.set(x, getGroundHeight(x, z) + 0.02, z);
  patch.rotation.set(Math.random() * 0.1, Math.random() * 0.1, Math.random() * 0.1);
  scene.add(patch);
}



// ─── SPORTS CAR (PORSCHE STYLE) ───────────────────────────────────────────────
const car = new THREE.Group();

// Main Body (Sleek Red)
const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc0a12, roughness: 0.2, metalness: 0.7 });
const bottomGeo = new THREE.BoxGeometry(1.6, 0.35, 3.8);
const pB = bottomGeo.attributes.position;
for (let i = 0; i < pB.count; i++) {
  const z = pB.getZ(i), y = pB.getY(i);
  if (z > 0 && y > 0) pB.setY(i, y - 0.15); // Slope front hood
  if (z < -1.0 && y > 0) pB.setY(i, y - 0.05); // slight slope back
}
bottomGeo.computeVertexNormals();
const bottomMesh = new THREE.Mesh(bottomGeo, bodyMat);
bottomMesh.position.y = 0.35;
bottomMesh.castShadow = true;
car.add(bottomMesh);

// Cabin
const cabinGeo = new THREE.BoxGeometry(1.2, 0.45, 1.8);
const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
const pC = cabinGeo.attributes.position;
for (let i = 0; i < pC.count; i++) {
  if (pC.getY(i) > 0) {
    pC.setX(i, pC.getX(i) * 0.8); // taper roof width
    if (pC.getZ(i) > 0) pC.setZ(i, pC.getZ(i) - 0.4); // slanted windshield
    if (pC.getZ(i) < 0) pC.setZ(i, pC.getZ(i) + 0.5); // fastback slope
  }
}
cabinGeo.computeVertexNormals();
const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
cabinMesh.position.set(0, 0.75, -0.2);
car.add(cabinMesh);

// Wheels
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2, metalness: 0.8 });
[[0.85, 0.25, 1.2], [-0.85, 0.25, 1.2], [0.85, 0.25, -1.2], [-0.85, 0.25, -1.2]].forEach(([x, y, z]) => {
  const wg = new THREE.Group();
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), wheelMat);
  w.rotation.z = Math.PI / 2;
  wg.add(w);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 8), rimMat);
  rim.rotation.z = Math.PI / 2;
  wg.add(rim);
  wg.position.set(x, y, z);
  car.add(wg);
});

// Headlights & Taillights
const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const tlMat = new THREE.MeshBasicMaterial({ color: 0x550000 });
[0.5, -0.5].forEach(x => {
  const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), hlMat);
  hl.position.set(x, 0.45, 1.91);
  car.add(hl);
  const tl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), tlMat);
  tl.position.set(x, 0.45, -1.91);
  tl.rotation.y = Math.PI;
  car.add(tl);
});

// Spawns at clear open spot with full forward view toward temple
car.position.set(0, 0.25, 22);
car.rotation.y = 0; // carAngle starts at 0 = car model already faces +Z initially
car.userData.spotlights = [];
// Spotlights for Night mode
[0.5, -0.5].forEach(x => {
  const spot = new THREE.SpotLight(0xffffff, 4.0, 35, 0.4, 0.5, 1); // Bright pure white
  spot.position.set(x, 0.45, 1.9);
  spot.target.position.set(x, 0, 15);
  car.add(spot);
  car.add(spot.target);
  car.userData.spotlights.push(spot);
});

scene.add(car);


// ─── CATS (IMPROVED — BELL + STATE MACHINE AI) ───────────────────────────────
const cats = [];
// CAT STATES: 0=wandering, 1=sitting, 2=grooming
function spawnCat(startX, startZ, furColor = 0xffffee) {
  const cat = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 1.0 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1.0 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xff9999, roughness: 1.0 });
  const bellMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.2, metalness: 0.8 });

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.6), mat);
  body.position.y = 0.18; body.castShadow = true;
  // Belly (slightly lighter)
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.4), bellyMat);
  belly.position.set(0, 0.18, 0.05);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), mat);
  head.position.set(0, 0.38, 0.32); head.castShadow = true;

  // Pointy ears
  const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mat);
  ear1.position.set(0.12, 0.58, 0.32); ear1.rotation.y = Math.PI / 4;
  const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mat);
  ear2.position.set(-0.12, 0.58, 0.32); ear2.rotation.y = Math.PI / 4;

  // Eyes (small black spheres)
  const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), darkMat);
  eye1.position.set(0.1, 0.42, 0.48);
  const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), darkMat);
  eye2.position.set(-0.1, 0.42, 0.48);

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 5), noseMat);
  nose.position.set(0, 0.36, 0.49);

  // Tail (parented for seamless connection)
  const tail1 = new THREE.Group();
  tail1.position.set(0, 0.22, -0.3);
  const t1Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 6), mat);
  t1Mesh.position.y = 0.15;
  tail1.add(t1Mesh);

  const tail2 = new THREE.Group();
  tail2.position.set(0, 0.28, -0.02); // Exact joint point
  const t2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.3, 6), mat);
  t2Mesh.position.y = 0.15;
  t2Mesh.rotation.x = -0.15;
  tail2.add(t2Mesh);
  tail1.add(tail2);

  // Legs
  [[0.14, 0, 0.2], [-0.14, 0, 0.2], [0.14, 0, -0.18], [-0.14, 0, -0.18]].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.2, 5), mat);
    leg.position.set(lx, 0.1, lz);
    cat.add(leg);
  });

  // Bell on collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0xff3355, roughness: 0.5 }));
  collar.position.set(0, 0.32, 0.32);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), bellMat);
  bell.position.set(0, 0.25, 0.38);

  cat.add(body, belly, head, ear1, ear2, eye1, eye2, nose, tail1, collar, bell);
  cat.position.set(startX, 0.12, startZ);
  scene.add(cat);

  cats.push({
    mesh: cat,
    tail1, tail2, bell,
    angle: Math.random() * Math.PI * 2,
    state: 0,          // 0=walk, 1=sit, 2=groom
    stateTimer: 2 + Math.random() * 4,
    walkSpeed: 0.018 + Math.random() * 0.015,
    homeX: startX,     // soft home to drift back
    homeZ: startZ,
    turnTimer: 0,
    turnTarget: Math.random() * Math.PI * 2,
  });
}

// Spawn cats at varied positions around the world, well away from trees/car
spawnCat(7, 8, 0xffffcc); // near start, white-cream
spawnCat(-7, 8, 0xddaa77); // ginger
spawnCat(12, -22, 0xdddddd); // grey
spawnCat(-12, -38, 0x443322); // dark tabby
spawnCat(5, -60, 0xffffcc);


const birds = [];
function spawnBird() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x444444 });
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.2), mat);
  w1.position.x = 0.3;
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.2), mat);
  w2.position.x = -0.3;
  g.add(w1, w2);
  g.position.set((Math.random() - 0.5) * 100, 15 + Math.random() * 15, (Math.random() - 0.5) * 100);
  scene.add(g);
  birds.push({ mesh: g, w1, w2, angle: Math.random() * Math.PI * 2, speed: 0.15 + Math.random() * 0.1 });
}
for (let i = 0; i < 10; i++) spawnBird();


// ─── MUSIC / WEB AUDIO API SYNTH ──────────────────────────────────────────────
let audioCtx, masterGain, musicInterval;
let isPlayingMusic = false;
const btnMusic = document.getElementById('musicToggle');

function playSynthNote() {
  if (!isPlayingMusic || !audioCtx) return;
  // Japanese pentatonic scale (Kumoijoshi / Hirajoshi approx)
  const freqs = [261.63, 277.18, 349.23, 392.00, 415.30, 523.25]; // C Db F G Ab C
  const base = freqs[Math.floor(Math.random() * freqs.length)];
  const mult = Math.random() > 0.5 ? 2 : 1;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine'; // pure calm tone
  osc.frequency.setValueAtTime(base * mult, audioCtx.currentTime);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);
  osc.stop(audioCtx.currentTime + 3.5);
}

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.2;
    masterGain.connect(audioCtx.destination);
  }
}

function playHorn() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth'; osc2.type = 'square';
  osc.frequency.setValueAtTime(320, audioCtx.currentTime);
  osc2.frequency.setValueAtTime(390, audioCtx.currentTime);
  osc.connect(gain); osc2.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(); osc2.start();
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  osc.stop(audioCtx.currentTime + 0.5);
  osc2.stop(audioCtx.currentTime + 0.5);
}

// ─── MUSIC PLAYER (local file) ────────────────────────────────────────────
const bgMusic = new Audio('Bairan.mp3');
bgMusic.volume = 0.5;
const SONG_START = 8; // "Ho Mane Sambh-Sambh Rakhe Tere Jhanjhara Ke Jode"

// Loop back to the desired lyric start instead of the very beginning
bgMusic.addEventListener('ended', () => {
  bgMusic.currentTime = SONG_START;
  bgMusic.play();
});

btnMusic.addEventListener('click', () => {
  isPlayingMusic = !isPlayingMusic;
  if (isPlayingMusic) {
    bgMusic.currentTime = SONG_START;
    bgMusic.play();
    btnMusic.textContent = '🔊 Pause Music';
    btnMusic.classList.add('active');
  } else {
    bgMusic.pause();
    btnMusic.textContent = '🎵 Play Music';
    btnMusic.classList.remove('active');
  }
});


// ─── CONTROLS ─────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => {
  if (e.repeat) return; // Fixes frame drops by preventing constant DOM updates on hold
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === 'w' || e.key === 'ArrowUp') document.getElementById('kW').classList.add('active');
  if (k === 's' || e.key === 'ArrowDown') document.getElementById('kS').classList.add('active');
  if (k === 'a' || e.key === 'ArrowLeft') document.getElementById('kA').classList.add('active');
  if (k === 'd' || e.key === 'ArrowRight') document.getElementById('kD').classList.add('active');

  // Shortcuts
  if (k === 'm') document.getElementById('musicToggle').click();
  if (k === 't') document.getElementById('themeToggle').click(); // Using T instead of D since D is for driving right
  if (k === 'l') carLightsOn = !carLightsOn;
  if (k === 'h') playHorn();

  if (e.key === 'Escape') closePanel();
});
document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  keys[k] = false;
  if (k === 'w' || e.key === 'ArrowUp') document.getElementById('kW').classList.remove('active');
  if (k === 's' || e.key === 'ArrowDown') document.getElementById('kS').classList.remove('active');
  if (k === 'a' || e.key === 'ArrowLeft') document.getElementById('kA').classList.remove('active');
  if (k === 'd' || e.key === 'ArrowRight') document.getElementById('kD').classList.remove('active');
});

let touchSteer = 0, touchAccel = 0;
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', e => {
  const t = e.touches[0]; touchStartX = t.clientX; touchStartY = t.clientY;
}, { passive: true });
document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  touchSteer = Math.max(-1, Math.min(1, (t.clientX - touchStartX) / 80));
  touchAccel = Math.max(-1, Math.min(1, -(t.clientY - touchStartY) / 80));
}, { passive: true });
document.addEventListener('touchend', () => { touchSteer = 0; touchAccel = 0; }, { passive: true });


// ─── PHYSICS & STATE ──────────────────────────────────────────────────────────
let carSpeed = 0, carAngle = Math.PI; // Math.PI = car faces -Z (toward temple)
const MAX_SPEED = 0.45, ACCEL = 0.015, FRICTION = 0.94, STEER = 0.042;
let camTarget = new THREE.Vector3(0, 1, 5); // start slightly in front of spawn

let panelOpen = false;
const panel = document.getElementById('panel');
document.getElementById('panelClose').addEventListener('click', closePanel);

function openPanel(zone) {
  document.getElementById('panelTag').textContent = zone.tag;
  document.getElementById('panelTitle').textContent = zone.title;
  document.getElementById('panelBody').innerHTML = zone.body.replace(/\n/g, '<br/>');
  document.getElementById('panelExtra').innerHTML = PANEL_EXTRAS[zone.id] || '';
  panel.classList.add('open');
  panelOpen = true;
}
function closePanel() {
  panel.classList.remove('open');
  panelOpen = false;
}

let currentZone = null;
const toast = document.getElementById('toast');
function showToast(title, sub) {
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastSub').textContent = sub;
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function checkZones() {
  let found = null;
  for (const z of ZONES) {
    if (Math.sqrt((car.position.x - z.x) ** 2 + (car.position.z - z.z) ** 2) < 8) { found = z; break; }
  }
  if (found && found.id !== currentZone) {
    currentZone = found.id;
    document.getElementById('zoneName').textContent = found.label;
    document.getElementById('zoneHint').textContent = 'Press [E] to interact';
    showToast(found.label, 'Press E to view info');
  } else if (!found && currentZone) {
    currentZone = null;
    document.getElementById('zoneName').textContent = 'SAKURA FIELD';
    document.getElementById('zoneHint').textContent = 'Drive around';
  }
}

document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'e' && currentZone && !panelOpen) openPanel(ZONES.find(z => z.id === currentZone));
});
renderer.domElement.addEventListener('click', () => {
  if (currentZone && !panelOpen) openPanel(ZONES.find(z => z.id === currentZone));
});


// ─── MAIN ANIMATION LOOP ──────────────────────────────────────────────────────
const clock = new THREE.Clock();
let time = 0;

// Heights map for simple collisions/bouncing
function getGroundHeight(x, z) {
  const dist = Math.sqrt(x * x + z * z);
  let h = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.0;
  if (dist > 70) h += Math.pow((dist - 70) * 0.1, 2);
  return h;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  time += dt;

  if (!panelOpen) {
    // Drive physics
    const fwd = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0) + touchAccel;
    carSpeed += fwd * 0.005;
    carSpeed *= 0.96; // drag

    const str = (keys['a'] || keys['arrowleft'] ? 1 : 0) - (keys['d'] || keys['arrowright'] ? 1 : 0) - touchSteer;
    let turnSpeed = str * 0.04;

    // Drifting logic
    if (keys[' '] && Math.abs(carSpeed) > 0.02) {
      turnSpeed *= 1.5; // Sharper turn when drifting
      carSpeed *= 0.9;  // Slows down slightly while sliding
      createSkidMark(car.position.x, car.position.z, carAngle);
    }

    // Reverse turn logic
    if (carSpeed < -0.01) turnSpeed = -turnSpeed;
    if (Math.abs(carSpeed) > 0.01) carAngle += turnSpeed;

    car.position.x += Math.sin(carAngle) * carSpeed;
    car.position.z += Math.cos(carAngle) * carSpeed;

    // Clamp world (don't drive too far up the mountains)
    const dist = Math.sqrt(car.position.x ** 2 + car.position.z ** 2);
    if (dist > 75) {
      car.position.x -= Math.sin(carAngle) * carSpeed;
      car.position.z -= Math.cos(carAngle) * carSpeed;
      carSpeed *= 0.8;
    }

    // Ground follow
    car.position.y = getGroundHeight(car.position.x, car.position.z) + 0.1;

    // Wheel spin
    const spinSpeed = carSpeed * 6;
    car.children.forEach((c, i) => { if (i >= 2 && i <= 5) c.children[0] && (c.children[0].rotation.x += spinSpeed); });
    document.getElementById('speedVal').textContent = Math.round(Math.abs(carSpeed) * 280);
  } // end if(!panelOpen)

  // ─── UPDATE CAR TRANSFORM ───────────────────────────────────────────────────
  // Apply wobble (hit animation)
  if (carWobble.active) {
    carWobble.time += dt;
    const t = carWobble.time / carWobble.duration;
    const wobble = Math.sin(t * Math.PI * 8) * carWobble.strength * (1 - t);
    car.rotation.z = wobble;
    if (t >= 1) {
      carWobble.active = false;
      car.rotation.z = 0;
    }
  } else {
    car.rotation.y = carAngle;
    // Ground slope tilt (fake suspension)
    car.rotation.x = THREE.MathUtils.lerp(car.rotation.x,
      (getGroundHeight(car.position.x, car.position.z - 1) - getGroundHeight(car.position.x, car.position.z + 1)) * 0.12, 0.1);
  }

  // ─── COLLISION CHECK ─────────────────────────────────────────────────────────
  for (const col of colliders) {
    const cdx = car.position.x - col.x;
    const cdz = car.position.z - col.z;
    const cdist = Math.sqrt(cdx * cdx + cdz * cdz);
    if (cdist < col.r + 0.4) {
      // Push car out
      const push = (col.r + 0.4 - cdist);
      const nx = cdx / cdist, nz = cdz / cdist;
      car.position.x += nx * push;
      car.position.z += nz * push;
      // Apply wobble if hitting something at speed
      if (Math.abs(carSpeed) > 0.05 && !carWobble.active) {
        carWobble.active = true;
        carWobble.time = 0;
        carWobble.strength = Math.min(0.3, Math.abs(carSpeed) * 2);
      }
      carSpeed *= 0.4;
    }
  }


  // ─── CAMERA: DIRECT ANGLE MATH (No quaternion confusion) ─────────────────────
  // Car forward direction at carAngle: (sin(carAngle), 0, cos(carAngle))
  // Camera should be BEHIND the car = opposite of forward direction
  const camDist = 9.5, camH = 5.0;
  const camIdealX = car.position.x - Math.sin(carAngle) * camDist;
  const camIdealY = car.position.y + camH;
  const camIdealZ = car.position.z - Math.cos(carAngle) * camDist;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, camIdealX, 0.09);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, camIdealY, 0.09);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, camIdealZ, 0.09);
  // Look ahead of the car
  const lookX = car.position.x + Math.sin(carAngle) * 3;
  const lookY = car.position.y + 0.7;
  const lookZ = car.position.z + Math.cos(carAngle) * 3;
  camTarget.set(
    THREE.MathUtils.lerp(camTarget.x, lookX, 0.12),
    THREE.MathUtils.lerp(camTarget.y, lookY, 0.12),
    THREE.MathUtils.lerp(camTarget.z, lookZ, 0.12)
  );
  camera.lookAt(camTarget);


  // ─── DAY/NIGHT TRANSITIONS ────────────────────────────────────────────────────
  const tSun = isNight ? 0.0 : 1.0;
  const tAmb = isNight ? 0.1 : 0.45;
  const tSky = isNight ? SKY_NIGHT : SKY_DAY;
  dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, tSun, 0.02);
  ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, tAmb, 0.02);
  scene.background.lerp(tSky, 0.02);
  scene.fog.color.lerp(tSky, 0.02);
  renderer.setClearColor(scene.background);

  // Transition the Sun and Moon seamlessly
  skyTime += ((isNight ? 1 : 0) - skyTime) * 0.01;
  const currSkyX = THREE.MathUtils.lerp(150, -150, skyTime);
  const currSkyY = 150 - Math.sin(skyTime * Math.PI) * 150; // dips to 0 horizon on transition
  skyBody.position.set(currSkyX, currSkyY, -150);
  dirLight.position.copy(skyBody.position);
  skyMat.color.lerp(isNight ? new THREE.Color(0xff1111) : new THREE.Color(0xfffa88), 0.02);
  starsMat.opacity = THREE.MathUtils.lerp(starsMat.opacity, isNight ? 1 : 0, 0.02);

  // Shooting Stars
  shootingStarTimer -= dt;
  if (isNight && shootingStarTimer <= 0) {
    shootingStar.position.set((Math.random() - 0.5) * 200, 150 + Math.random() * 50, -150);
    shootingStar.userData.v = new THREE.Vector3(-100 - Math.random() * 100, -50 - Math.random() * 50, 0);
    shMat.opacity = 1;
    shootingStarTimer = 8 + Math.random() * 4;
  }
  if (shMat.opacity > 0) {
    shootingStar.position.addScaledVector(shootingStar.userData.v, dt);
    shMat.opacity -= dt * 0.5;
  }

  // Wind blowing trees
  const swayT = time * 1.5;
  envPlants.forEach(p => {
    p.rotation.z = Math.sin(swayT + p.position.x * 0.1) * 0.03;
    p.rotation.x = Math.cos(swayT + p.position.z * 0.1) * 0.03;
  });

  car.userData.spotlights.forEach(s => {
    s.intensity = THREE.MathUtils.lerp(s.intensity, (isNight && carLightsOn) ? 4 : 0, 0.05);
  });

  streetLamps.forEach(lamp => {
    lamp.spot.intensity = THREE.MathUtils.lerp(lamp.spot.intensity, isNight ? 2.5 : 0, 0.05);
    lamp.dust.material.opacity = THREE.MathUtils.lerp(lamp.dust.material.opacity, isNight ? 0.8 : 0, 0.05);
    if (isNight) {
      const parr = lamp.dust.geometry.attributes.position.array;
      for (let i = 0; i < 40; i++) {
        parr[i * 3 + 1] -= 0.01;
        parr[i * 3] += Math.sin(time * 2.5 + i) * 0.004;
        parr[i * 3 + 2] += Math.cos(time * 2.5 + i) * 0.004;
        if (parr[i * 3 + 1] < -3) parr[i * 3 + 1] = 0;
      }
      lamp.dust.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (keys['s'] || keys['arrowdown']) {
    tlMat.color.setHex(0xff0000); // Bright brake light
  } else {
    tlMat.color.setHex(0x330000); // Dim tail light
  }

  // Torii Zones Animations
  zoneGroups.forEach(z => {
    z.symbol.position.y = 1.5 + Math.sin(time * 2 + z.symbol.position.x) * 0.3;
    z.symbol.rotation.y += 0.01;
    z.symbol.rotation.z += 0.01;
    z.label.lookAt(camera.position);
    z.light.intensity = isNight ? 2.5 : 0.5;
  });

  // Clouds drifting
  clouds.children.forEach(c => {
    c.position.x -= 0.05;
    if (c.position.x < -150) c.position.x = 150;
  });

  // Sakura Petals falling
  const positions = petals.geometry.attributes.position.array;
  for (let i = 0; i < pCount; i++) {
    positions[i * 3 + 1] -= 0.08; // fall
    positions[i * 3] += Math.sin(time + i) * 0.03; // drift x
    positions[i * 3 + 2] += Math.cos(time + i * 0.5) * 0.03; // drift z
    if (positions[i * 3 + 1] < 0) { positions[i * 3 + 1] = 40; } // wrap top
  }
  petals.geometry.attributes.position.needsUpdate = true;

  // Snowflakes falling
  const sPositions = snowflakes.geometry.attributes.position.array;
  for (let i = 0; i < sCount; i++) {
    sPositions[i * 3 + 1] -= 0.05; // fall slower than petals
    sPositions[i * 3] += Math.sin(time * 0.5 + i * 0.7) * 0.02;
    sPositions[i * 3 + 2] += Math.cos(time * 0.5 + i * 0.5) * 0.02;
    if (sPositions[i * 3 + 1] < -1) { sPositions[i * 3 + 1] = 35; }
  }
  snowflakes.geometry.attributes.position.needsUpdate = true;

  // Cats — full state machine AI
  cats.forEach(c => {
    c.stateTimer -= dt;

    // State transitions
    if (c.stateTimer <= 0) {
      const roll = Math.random();
      if (c.state === 0) {
        // Was walking: sit, groom, or play
        if (roll < 0.38) c.state = 1; // sit
        else if (roll < 0.70) c.state = 2; // groom
        else c.state = 3; // play! (bat/jump)
        c.stateTimer = 1.5 + Math.random() * 4;
      } else {
        // Rest states → walk again
        c.state = 0;
        c.stateTimer = 3 + Math.random() * 6;
        const dx = c.homeX - c.mesh.position.x;
        const dz = c.homeZ - c.mesh.position.z;
        const homeDist = Math.sqrt(dx * dx + dz * dz);
        if (homeDist > 12) {
          c.angle = Math.atan2(dx, dz) + (Math.random() - 0.5) * 0.8;
        } else {
          c.angle += (Math.random() - 0.5) * Math.PI * 0.8;
        }
      }
    }

    if (c.state === 0) {
      // Walking
      c.turnTimer -= dt;
      if (c.turnTimer <= 0) {
        c.turnTarget = c.angle + (Math.random() - 0.5) * Math.PI * 0.7;
        c.turnTimer = 1 + Math.random() * 2;
      }
      let angleDiff = c.turnTarget - c.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      c.angle += angleDiff * Math.min(1, dt * 1.5);

      c.mesh.position.x += Math.sin(c.angle) * c.walkSpeed;
      c.mesh.position.z += Math.cos(c.angle) * c.walkSpeed;
      // ✅ FIX: rotation.y = c.angle (positive), NOT -c.angle
      c.mesh.rotation.y = c.angle;

      if (Math.abs(c.mesh.position.x) > 40 || Math.abs(c.mesh.position.z) > 75) {
        c.angle += Math.PI;
        c.turnTarget = c.angle;
      }
      c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.12
        + Math.abs(Math.sin(time * 8)) * 0.05;
      c.tail1.rotation.x = 0.5 + Math.sin(time * 4) * 0.3;
      c.tail2.rotation.x = -0.3 + Math.sin(time * 4 + 1) * 0.3;
      const jingle = 1 + Math.abs(Math.sin(time * 8)) * 0.12;
      c.bell.scale.set(jingle, jingle, jingle);
      c.mesh.rotation.z = 0; // reset z-tilt from grooming

    } else if (c.state === 1) {
      // Sitting
      c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.06;
      c.tail1.rotation.x = 1.2;
      c.tail2.rotation.x = 0.2;
      c.bell.scale.set(1, 1, 1);
      c.mesh.rotation.z = 0;

    } else if (c.state === 2) {
      // Grooming: sway head side to side
      c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.08;
      c.mesh.rotation.z = Math.sin(time * 3) * 0.12;
      c.tail1.rotation.x = 0.8;
      c.bell.scale.set(1, 1, 1);

    } else {
      // PLAY state: jump + spin animation
      const jt = c.stateTimer; // countdown
      const bounce = Math.abs(Math.sin(time * 10)) * 0.5;
      c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.12 + bounce;
      c.mesh.rotation.y += dt * 4; // spin rapidly
      c.tail1.rotation.x = Math.sin(time * 12) * 0.8;
      c.tail2.rotation.x = Math.cos(time * 12) * 0.6;
      const jingle = 1 + bounce * 0.4;
      c.bell.scale.set(jingle, jingle, jingle);
      c.mesh.rotation.z = Math.sin(time * 8) * 0.15;
    }
  });


  // Birds flying
  birds.forEach(b => {
    b.mesh.position.x += Math.sin(b.angle) * b.speed;
    b.mesh.position.z += Math.cos(b.angle) * b.speed;
    b.mesh.rotation.y = b.angle + Math.PI / 2; // align bird geometry forward
    b.w1.rotation.z = Math.sin(time * 12) * 0.6; // flap
    b.w2.rotation.z = -Math.sin(time * 12) * 0.6;
    if (b.mesh.position.length() > 80) b.angle += (Math.random() * 0.5 + 0.1);
  });

  checkZones();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── LOADER INITIALIZATION ────────────────────────────────────────────────────
let prog = 0;
const barEl = document.getElementById('loaderBar');
const loaderEl = document.getElementById('loader');
const interval = setInterval(() => {
  prog += Math.random() * 15;
  barEl.style.width = Math.min(prog, 100) + '%';
  if (prog >= 100) {
    clearInterval(interval);
    setTimeout(() => {
      loaderEl.classList.add('hidden');
      setTimeout(() => loaderEl.remove(), 900);
      showToast('SAKURA FIELD', 'Use WASD to drive • E to view Portfolios');
    }, 500);
  }
}, 100);

animate();
