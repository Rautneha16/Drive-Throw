import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { ZONES } from './data.js';

export function initThreeScene(canvas, callbacks) {
  const { onProgress, onReady, onSpeedChange, onZoneChange, onToast } = callbacks;
  
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x87CEEB); 
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const SKY_DAY = new THREE.Color(0x87CEEB);
  const SKY_NIGHT = new THREE.Color(0x0b1026);
  scene.background = SKY_NIGHT.clone();
  scene.fog = new THREE.FogExp2(0x0b1026, 0.012);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 8, 20);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.5, 0.85);
  bloomPass.threshold = 0.2;
  bloomPass.strength = 0.8;
  bloomPass.radius = 0.3;
  composer.addPass(bloomPass);

  const colliders = [];
  colliders.push({ x: 0, z: -5, r: 9 });
  const carWobble = { active: false, time: 0, duration: 0.8, strength: 0 };

  const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.1); 
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffee, 0.0); 
  dirLight.position.set(50, 60, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(512, 512);
  dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 150;
  dirLight.shadow.camera.left = -50; dirLight.shadow.camera.right = 50;
  dirLight.shadow.camera.top = 50; dirLight.shadow.camera.bottom = -50;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  let isNight = true; 
  let envPlants = [];
  let skyTime = isNight ? 1 : 0;
  let shootingStarTimer = 5;

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

  function getGroundHeight(x, z) {
    const dist = Math.sqrt(x * x + z * z);
    let h = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.0;
    if (dist > 70) h += Math.pow((dist - 70) * 0.1, 2);
    return h;
  }

  function createNoiseTexture(size, baseR, baseG, baseB, varR, varG, varB) {
    const cvs = document.createElement('canvas'); cvs.width = size; cvs.height = size;
    const ctx = cvs.getContext('2d'); const imgData = ctx.createImageData(size, size); const data = imgData.data;
    for (let i = 0; i < size * size; i++) {
      const n = Math.random();
      data[i * 4] = baseR + n * varR; data[i * 4 + 1] = baseG + n * varG; data[i * 4 + 2] = baseB + n * varB; data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(cvs); tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; return tex;
  }
  function createBarkTexture() {
    const cvs = document.createElement('canvas'); cvs.width = 128; cvs.height = 128;
    const ctx = cvs.getContext('2d'); const imgData = ctx.createImageData(128, 128);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const n = Math.random() * 0.5 + Math.sin(x * 0.5) * 0.5;
        const i = (y * 128 + x) * 4;
        imgData.data[i] = 70 + n * 30; imgData.data[i+1] = 40 + n * 20; imgData.data[i+2] = 20 + n * 10; imgData.data[i+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(cvs); tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; return tex;
  }

  const groundTex = createNoiseTexture(512, 40, 90, 40, 30, 40, 30); groundTex.repeat.set(40, 40);
  const rockTex1 = createNoiseTexture(256, 80, 80, 80, 40, 40, 40);
  const rockTex2 = createNoiseTexture(256, 60, 60, 60, 30, 30, 30);
  const barkTex = createBarkTexture();

  const groundGeo = new THREE.PlaneGeometry(300, 300, 30, 30);
  const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1.0, metalness: 0.05 });
  const posG = groundGeo.attributes.position;
  for (let i = 0; i < posG.count; i++) {
    const px = posG.getX(i), py = posG.getY(i);
    posG.setZ(i, getGroundHeight(px, py));
  }
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  function createGrassTexture() {
    const cvs = document.createElement('canvas'); cvs.width = 32; cvs.height = 128;
    const ctx = cvs.getContext('2d');
    const grad = ctx.createLinearGradient(0, 128, 0, 0);
    grad.addColorStop(0, '#1a401a');
    grad.addColorStop(0.5, '#4a8c40');
    grad.addColorStop(1, '#88cc44');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 32, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for(let i=0; i<10; i++) ctx.fillRect(Math.random()*32, 0, 1+Math.random()*2, 128);
    return new THREE.CanvasTexture(cvs);
  }
  const grassGeo = new THREE.PlaneGeometry(0.3, 0.8);
  grassGeo.translate(0, 0.4, 0);
  const grassMat = new THREE.MeshStandardMaterial({ map: createGrassTexture(), side: THREE.DoubleSide, roughness: 1.0 });
  const grassCount = 800;
  const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
  const grassDummy = new THREE.Object3D();
  for (let i = 0; i < grassCount; i++) {
    const gx = (Math.random() - 0.5) * 200; const gz = (Math.random() - 0.5) * 200;
    const dist = Math.sqrt(gx * gx + gz * gz);
    if (dist < 5 || (dist > 65 && dist < 75) || dist > 95) { grassMesh.setMatrixAt(i, new THREE.Matrix4().makeScale(0,0,0)); continue; }
    grassDummy.position.set(gx, getGroundHeight(gx, gz), gz);
    grassDummy.rotation.y = Math.random() * Math.PI;
    grassDummy.rotation.x = (Math.random() - 0.5) * 0.2;
    grassDummy.scale.setScalar(0.7 + Math.random() * 1.5);
    grassDummy.updateMatrix();
    grassMesh.setMatrixAt(i, grassDummy.matrix);
  }
  grassMesh.receiveShadow = false;
  scene.add(grassMesh);

  const clouds = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, flatShading: true });
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

  // getGroundHeight moved to top of file

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

  function makeSakura(x, z, scale = 1) {
    const g = new THREE.Group();
    envPlants.push(g);
    const trunkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 1.0 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, 3.5 * scale, 7), trunkMat);
    trunk.position.y = 1.75 * scale; trunk.castShadow = false; g.add(trunk);
    const branch1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.8 * scale, 5), trunkMat);
    branch1.position.set(0.6 * scale, 3.8 * scale, 0); branch1.rotation.z = 0.5; branch1.castShadow = false; g.add(branch1);
    const branch2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.6 * scale, 5), trunkMat);
    branch2.position.set(-0.5 * scale, 3.6 * scale, 0.3 * scale); branch2.rotation.z = -0.45; branch2.castShadow = false; g.add(branch2);
    const branch3 = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.10 * scale, 1.4 * scale, 5), trunkMat);
    branch3.position.set(0.2 * scale, 3.9 * scale, -0.6 * scale); branch3.rotation.x = -0.6; branch3.castShadow = false; g.add(branch3);
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0xffaec0, roughness: 0.9, flatShading: true });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0xff85a2, roughness: 0.9, flatShading: true });
    const leafMat3 = new THREE.MeshStandardMaterial({ color: 0xffc8d6, roughness: 0.9, flatShading: true });
    const mats = [leafMat1, leafMat2, leafMat3];
    const clusters = [
      { y: 4.2, s: 2.0, ox: 0, oz: 0 }, { y: 3.8, s: 1.6, ox: 1.4, oz: 0.4 }, { y: 3.6, s: 1.5, ox: -1.2, oz: -0.6 },
      { y: 4.0, s: 1.7, ox: -0.4, oz: 1.3 }, { y: 3.5, s: 1.3, ox: 0.8, oz: -1.1 }, { y: 4.5, s: 1.2, ox: 0.2, oz: 0.5 },
      { y: 4.6, s: 1.4, ox: 0.6, oz: -0.5 }, { y: 4.4, s: 1.3, ox: -0.8, oz: 0.8 }, { y: 4.2, s: 1.5, ox: 0.4, oz: -1.4 }
    ];
    clusters.forEach((c, i) => {
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(c.s * scale, 1), mats[i % 3]);
      leaf.position.set(c.ox * scale, c.y * scale, c.oz * scale);
      leaf.rotation.set(Math.random(), Math.random(), Math.random());
      leaf.scale.set(1, 0.8, 1);
      leaf.castShadow = false; g.add(leaf);
    });
    g.position.set(x, getGroundHeight(x, z), z);
    scene.add(g); return g;
  }

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
    g.position.set(x, getGroundHeight(x, z), z); scene.add(g);
  }

  const treeCoords = [
    [-12, 5], [-18, -5], [-8, -10], [-22, -18], [-14, -28], [-30, -35], [-10, -50], [-22, -58], [-35, -48],
    [12, 5], [18, -5], [8, -10], [22, -18], [14, -28], [30, -35], [10, -50], [22, -58], [35, -48],
    [-15, -65], [15, -65],
  ];
  treeCoords.forEach(([x, z]) => colliders.push({ x, z, r: 2.2 }));

  const mGeo = new THREE.ConeGeometry(50, 90, 4);
  const mMat = new THREE.MeshStandardMaterial({ color: 0x2b3833, roughness: 1.0, flatShading: true });
  const mSnowGeo = new THREE.ConeGeometry(22, 40, 4);
  const mSnowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, flatShading: true });
  for (let i = 0; i < 25; i++) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(mGeo, mMat); m.position.y = 45;
    const snow = new THREE.Mesh(mSnowGeo, mSnowMat); snow.position.y = 70.1;
    g.add(m, snow);
    const ang = Math.PI * 0.8 + Math.random() * Math.PI * 1.4;
    const dist = 180 + Math.random() * 80;
    g.position.set(Math.sin(ang) * dist, -10 + Math.random() * 15, Math.cos(ang) * dist);
    g.rotation.y = Math.random() * 2; scene.add(g);
  }

  const rockMat1 = new THREE.MeshStandardMaterial({ map: rockTex1, roughness: 0.9, flatShading: true });
  const rockMat2 = new THREE.MeshStandardMaterial({ map: rockTex2, roughness: 0.9, flatShading: true });
  const rockMat3 = new THREE.MeshStandardMaterial({ map: rockTex1, color: 0x888888, roughness: 0.9, flatShading: true });
  function makeRock(x, z, scale = 1, mat = rockMat1) {
    const g = new THREE.Group();
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), mat);
    boulder.scale.set(0.8 + Math.random() * 0.4, 0.6 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
    boulder.position.y = scale * 0.3; boulder.castShadow = false; boulder.receiveShadow = false; g.add(boulder);
    for (let j = 0; j < 3; j++) {
      const smallRock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale * (0.2 + Math.random() * 0.3), 0), j === 0 ? rockMat2 : mat);
      smallRock.scale.set(0.8 + Math.random() * 0.4, 0.5 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
      smallRock.position.set((Math.random() - 0.5) * scale * 1.8, 0, (Math.random() - 0.5) * scale * 1.8);
      smallRock.castShadow = false; g.add(smallRock);
    }
    g.position.set(x, getGroundHeight(x, z) - 0.1, z); scene.add(g);
    colliders.push({ x, z, r: scale * 1.2 });
  }

  [[18, 3, 1.6, rockMat1], [-18, 3, 1.4, rockMat2], [6, -3, 1.0, rockMat3], [-6, -3, 0.9, rockMat1],
   [38, -25, 2.2, rockMat1], [-38, -25, 2.0, rockMat2], [20, -55, 1.8, rockMat3], [-20, -55, 1.5, rockMat1],
   [0, -85, 2.5, rockMat2], [25, -72, 1.3, rockMat3]].forEach(([x, z, s, m]) => makeRock(x, z, s, m));

  treeCoords.forEach(([x, z]) => {
    makeSakura(x, z, 0.9 + Math.random() * 0.6);
    if (Math.random() > 0.4) makeBush(x + (Math.random() - 0.5) * 3, z + (Math.random() - 0.5) * 3, 0.6 + Math.random() * 0.4);
  });

  const pCount = 200; const pGeo = new THREE.BufferGeometry(); const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 120; pPos[i * 3 + 1] = Math.random() * 35; pPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const petals = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffb7c5, size: 0.35, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
  scene.add(petals);

  const sfCvs = document.createElement('canvas'); sfCvs.width = 32; sfCvs.height = 32; const sfCtx = sfCvs.getContext('2d');
  const sfGrad = sfCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  sfGrad.addColorStop(0, 'rgba(255,255,255,1)'); sfGrad.addColorStop(0.4, 'rgba(255,255,255,0.8)'); sfGrad.addColorStop(1, 'rgba(255,255,255,0)');
  sfCtx.fillStyle = sfGrad; sfCtx.beginPath(); sfCtx.arc(16, 16, 16, 0, Math.PI * 2); sfCtx.fill();
  const sfTex = new THREE.CanvasTexture(sfCvs);
  
  const sCount = 200; const sGeo = new THREE.BufferGeometry(); const sPos = new Float32Array(sCount * 3);
  for (let i = 0; i < sCount; i++) {
    sPos[i * 3] = (Math.random() - 0.5) * 150; sPos[i * 3 + 1] = Math.random() * 40; sPos[i * 3 + 2] = (Math.random() - 0.5) * 150;
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const snowflakes = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, map: sfTex, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(snowflakes);

  const cityGroup = new THREE.Group();
  const buildMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.8 });
  const wCvs = document.createElement('canvas'); wCvs.width = 64; wCvs.height = 64;
  const wCtx = wCvs.getContext('2d');
  wCtx.fillStyle = '#111'; wCtx.fillRect(0,0,64,64);
  wCtx.fillStyle = '#ffaa00';
  for(let i=0; i<64; i+=16) for(let j=0; j<64; j+=16) if(Math.random()>0.5) wCtx.fillRect(i+2, j+2, 12, 12);
  const wTex = new THREE.CanvasTexture(wCvs); wTex.wrapS = THREE.RepeatWrapping; wTex.wrapT = THREE.RepeatWrapping;
  const buildWinMat = new THREE.MeshStandardMaterial({ map: wTex, emissiveMap: wTex, emissive: 0xffffff, emissiveIntensity: 1.5, roughness: 0.2 });

  for (let i = 0; i < 40; i++) {
    const w = 5 + Math.random() * 15;
    const h = 20 + Math.random() * 60;
    const d = 5 + Math.random() * 15;
    const geo = new THREE.BoxGeometry(w, h, d);
    const materials = [buildWinMat, buildWinMat, buildMat, buildMat, buildWinMat, buildWinMat];
    const building = new THREE.Mesh(geo, materials);
    const angle = Math.random() * Math.PI * 2;
    const dist = 180 + Math.random() * 80;
    building.position.set(Math.sin(angle) * dist, h/2 - 10, Math.cos(angle) * dist);
    building.rotation.y = Math.random() * Math.PI;
    cityGroup.add(building);
  }
  scene.add(cityGroup);

  const trackPts2D = [
    [0, 80], [30, 85], [45, 75], [60, 80], [70, 60], [80, 50], [75, 30],
    [90, 20], [85, 0], [70, -10], [80, -20], [60, -40],
    [70, -60], [50, -70], [-20, -80], [-40, -75], [-45, -50], 
    [-60, -60], [-80, -40], [-70, -20], [-85, 0], [-80, 30], 
    [-60, 40], [-65, 60], [-40, 75], [-20, 70]
  ];
  const trackSplinePts = trackPts2D.map(p => new THREE.Vector3(p[0], 0, p[1]));
  const trackCurve = new THREE.CatmullRomCurve3(trackSplinePts, true);

  const tCvs = document.createElement('canvas'); tCvs.width = 512; tCvs.height = 128;
  const tCtx = tCvs.getContext('2d');
  tCtx.fillStyle = '#222'; tCtx.fillRect(0, 0, 512, 128);
  tCtx.fillStyle = '#2a2a2a'; for(let i=0; i<3000; i++) tCtx.fillRect(Math.random()*512, Math.random()*128, 2, 2);
  tCtx.fillStyle = '#cc1111';
  for(let y=0; y<128; y+=32) { tCtx.fillRect(0, y, 24, 16); tCtx.fillRect(488, y, 24, 16); }
  tCtx.fillStyle = '#eeeeee';
  for(let y=16; y<128; y+=32) { tCtx.fillRect(0, y, 24, 16); tCtx.fillRect(488, y, 24, 16); }
  const trackTex = new THREE.CanvasTexture(tCvs);
  trackTex.wrapS = THREE.RepeatWrapping; trackTex.wrapT = THREE.RepeatWrapping; trackTex.repeat.set(1, 400);

  const trackGeo = new THREE.BufferGeometry();
  const trackSegments = 1000;
  const tPos = new Float32Array((trackSegments + 1) * 2 * 3);
  const tUvs = new Float32Array((trackSegments + 1) * 2 * 2);
  const tInd = [];
  const trackWidth = 5;

  for (let i = 0; i <= trackSegments; i++) {
    const t = i / trackSegments;
    const pt = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    
    const leftPt = pt.clone().add(binormal.clone().multiplyScalar(-trackWidth));
    leftPt.y = getGroundHeight(leftPt.x, leftPt.z) + 0.15;
    const rightPt = pt.clone().add(binormal.clone().multiplyScalar(trackWidth));
    rightPt.y = getGroundHeight(rightPt.x, rightPt.z) + 0.15;

    tPos[i * 6] = leftPt.x; tPos[i * 6 + 1] = leftPt.y; tPos[i * 6 + 2] = leftPt.z;
    tPos[i * 6 + 3] = rightPt.x; tPos[i * 6 + 4] = rightPt.y; tPos[i * 6 + 5] = rightPt.z;

    tUvs[i * 4] = 0; tUvs[i * 4 + 1] = t * 400;
    tUvs[i * 4 + 2] = 1; tUvs[i * 4 + 3] = t * 400;

    if (i < trackSegments) {
      const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
      tInd.push(a, b, d); tInd.push(a, d, c);
    }
  }
  trackGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
  trackGeo.setAttribute('uv', new THREE.BufferAttribute(tUvs, 2));
  trackGeo.setIndex(tInd);
  trackGeo.computeVertexNormals();

  const trackMesh = new THREE.Mesh(trackGeo, new THREE.MeshStandardMaterial({ map: trackTex, roughness: 0.9 }));
  trackMesh.receiveShadow = true;
  scene.add(trackMesh);

  const zoneGroups = [];
  function makeToriiZone(zone) {
    const g = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8), woodMat); p1.position.set(-2.5, 2.25, 0); p1.castShadow = true;
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4.5, 8), woodMat); p2.position.set(2.5, 2.25, 0); p2.castShadow = true;
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8), blackMat); b1.position.set(-2.5, 0.3, 0); b1.castShadow = true;
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8), blackMat); b2.position.set(2.5, 0.3, 0); b2.castShadow = true;
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 0.5), woodMat); t1.position.set(0, 4.3, 0); t1.castShadow = true;
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.3, 0.4), woodMat); t2.position.set(0, 3.5, 0); t2.castShadow = true;
    const plat = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 5), blackMat); plat.position.set(0, 0.1, 0); plat.receiveShadow = true;
    g.add(p1, p2, b1, b2, t1, t2, plat);
    const symMat = new THREE.MeshStandardMaterial({ color: zone.color, emissive: zone.color, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
    const symbol = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), symMat); symbol.position.set(0, 1.5, 0); symbol.castShadow = true; g.add(symbol);
    const light = new THREE.PointLight(zone.color, 2, 10); light.position.set(0, 2, 0); g.add(light);
    
    const cvs = document.createElement('canvas'); cvs.width = 512; cvs.height = 128; const ctx = cvs.getContext('2d');
    ctx.fillStyle = 'rgba(20,0,10,0.6)'; ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#' + zone.color.toString(16).padStart(6, '0'); ctx.lineWidth = 4; ctx.strokeRect(2, 2, 508, 124);
    ctx.font = 'bold 48px arial, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(zone.label, 256, 64);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs), transparent: true, depthTest: false }));
    label.position.set(0, 5.5, 0); g.add(label);
    
    g.position.set(zone.x, getGroundHeight(zone.x, zone.z), zone.z); scene.add(g);
    zoneGroups.push({ group: g, symbol, light, label, id: zone.id });
    colliders.push({ x: zone.x, z: zone.z, r: 4 });
  }
  ZONES.forEach(z => makeToriiZone(z));

function makeTemple() {
    const g = new THREE.Group();
    const tCvs = document.createElement('canvas'); tCvs.width = 64; tCvs.height = 64; const tCtx = tCvs.getContext('2d');
    tCtx.fillStyle = '#222'; tCtx.fillRect(0, 0, 64, 64); tCtx.fillStyle = '#111'; tCtx.fillRect(0, 60, 64, 4);
    const tTex = new THREE.CanvasTexture(tCvs); tTex.wrapS = THREE.RepeatWrapping; tTex.wrapT = THREE.RepeatWrapping; tTex.repeat.set(4, 4);
  
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.9 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xbb2222, roughness: 0.8 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 1.0 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6b800, roughness: 0.3, metalness: 0.8 });
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8, map: tTex });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 1.0 });
  
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 20), baseMat); base1.position.y = 0.25; base1.receiveShadow = true;
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 16), baseMat); base2.position.y = 0.8; base2.receiveShadow = true;
    const base3 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 12), baseMat); base3.position.y = 1.35; base3.receiveShadow = true;
    g.add(base1, base2, base3);
  
    const deck = new THREE.Mesh(new THREE.BoxGeometry(13, 0.2, 13), woodMat); deck.position.y = 1.7; deck.receiveShadow = true; deck.castShadow = true; g.add(deck);
  
    for (let px = -5.5; px <= 5.5; px += 11) {
      for (let pz = -5.5; pz <= 5.5; pz += 11) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), redMat); p.position.set(px, 4.2, pz); p.castShadow = true; g.add(p);
      }
    }
  
    const core = new THREE.Mesh(new THREE.BoxGeometry(9, 4.5, 9), woodMat); core.position.set(0, 4.05, 0); core.castShadow = true; core.receiveShadow = true; g.add(core);
    const altarGlow = new THREE.PointLight(0xffaa00, 3, 20); altarGlow.position.set(0, 3, -1);
    const altar = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), goldMat); altar.position.set(0, 2.5, -2); altar.castShadow = true; g.add(altarGlow, altar);
  
    const roofEave1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 14), woodMat); roofEave1.position.set(0, 6.5, 0); roofEave1.castShadow = true; g.add(roofEave1);
    const roofSlope1 = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 9, 2.5, 4, 1), tileMat); roofSlope1.position.set(0, 7.9, 0); roofSlope1.rotation.y = Math.PI / 4; roofSlope1.castShadow = true; g.add(roofSlope1);
    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 7), woodMat); floor2.position.set(0, 10.6, 0); floor2.castShadow = true; g.add(floor2);
    const deck2 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.2, 8.5), woodMat); deck2.position.set(0, 9.2, 0); deck2.castShadow = true; g.add(deck2);
    const roofEave2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 10), woodMat); roofEave2.position.set(0, 12.3, 0); roofEave2.castShadow = true; g.add(roofEave2);
    const roofSlope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7.5, 3.5, 4, 1), tileMat); roofSlope2.position.set(0, 14.2, 0); roofSlope2.rotation.y = Math.PI / 4; roofSlope2.castShadow = true; g.add(roofSlope2);
  
    const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 8), tileMat); spireBase.position.set(0, 16.2, 0); g.add(spireBase);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 3, 6), goldMat); spire.position.set(0, 17.9, 0); spire.castShadow = true; g.add(spire);
    const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), goldMat); ball1.position.set(0, 18.5, 0); g.add(ball1);
    const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), goldMat); ball2.position.set(0, 19.1, 0); g.add(ball2);
  
    for (let s = 0; s < 6; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 0.8), baseMat); step.position.set(0, s * 0.25 + 0.125, 6 - s * 0.8); step.receiveShadow = true; g.add(step);
    }
  
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 1.0 });
    [[-4.5, 5], [4.5, 5], [-3, 11], [3, 11]].forEach(([lx, ly]) => {
      const lBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8), lanternMat); lBody.position.set(lx, ly, 4.8);
      const lGlow = new THREE.PointLight(0xffaa00, 1.5, 10); lGlow.position.set(lx, ly, 4.8); g.add(lBody, lGlow);
    });
  
    g.position.set(0, getGroundHeight(0, -5), -5); scene.add(g);
  
    const pCvs = document.createElement('canvas'); pCvs.width = 256; pCvs.height = 256; const pCtx = pCvs.getContext('2d');
    pCtx.fillStyle = '#848478'; pCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      pCtx.fillStyle = Math.random() > 0.5 ? '#6c6c60' : '#9a9a8c';
      pCtx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 2, 2 + Math.random() * 2);
    }
    const pTex = new THREE.CanvasTexture(pCvs); pTex.wrapS = THREE.RepeatWrapping; pTex.wrapT = THREE.RepeatWrapping;
    const pathMat = new THREE.MeshStandardMaterial({ map: pTex, roughness: 1.0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  
    function makePath(x1, z1, x2, z2, w = 2) {
      const dx = x2 - x1, dz = z2 - z1; const len = Math.sqrt(dx * dx + dz * dz); const segs = Math.max(1, Math.floor(len * 2));
      const geo = new THREE.PlaneGeometry(w, len, 1, segs);
      geo.rotateX(-Math.PI / 2); geo.rotateY(Math.atan2(dx, dz)); geo.translate((x1 + x2) / 2, 0, (z1 + z2) / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) { pos.setY(i, getGroundHeight(pos.getX(i), pos.getZ(i)) + 0.04); }
      geo.computeVertexNormals();
      const uvs = geo.attributes.uv;
      for (let i = 0; i < uvs.count; i++) { uvs.setX(i, uvs.getX(i) * w); uvs.setY(i, uvs.getY(i) * (len / 2)); }
      const mesh = new THREE.Mesh(geo, pathMat); mesh.receiveShadow = true; scene.add(mesh);
    }
  
    makePath(0, 12, 0, 3.3, 3); makePath(0, -7, 0, -15, 2.5);
    makePath(0, -15, 30, -40, 2); makePath(0, -15, -30, -40, 2);
    makePath(30, -40, 0, -70, 2); makePath(-30, -40, 0, -70, 2);
    makePath(30, -40, -30, -40, 1.8);
  }
  makeTemple();

  const streetLamps = [];
  function makeStreetLamp(x, z, rotY = 0) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 12, 8), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
    pole.position.y = -2; pole.castShadow = true;
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    top.position.set(0.3, 4, 0); top.castShadow = true;
    const bulbColor = 0xffba00; 
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: bulbColor }));
    bulb.position.set(0.55, 3.9, 0);
    const spot = new THREE.PointLight(bulbColor, 0, 20);
    spot.position.set(0.55, 3.8, 0);
    const dGeo = new THREE.BufferGeometry(); const dPos = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) { dPos[i * 3] = (Math.random() - 0.5) * 1.5; dPos[i * 3 + 1] = -Math.random() * 3; dPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5; }
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    const dMat = new THREE.PointsMaterial({ color: bulbColor, size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const dust = new THREE.Points(dGeo, dMat); dust.position.set(0.55, 3.8, 0);
    g.add(pole, top, bulb, spot, dust); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g);
    streetLamps.push({ spot, dust }); colliders.push({ x, z, r: 0.5 });
  }

  function makeBench(x, z, rotY = 0) {
    const g = new THREE.Group();
    const wMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const iMat = new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.6), wMat); seat.position.y = 0.45; seat.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.1), wMat); back.position.set(0, 0.75, -0.25); back.castShadow = true;
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.6), iMat); l1.position.set(0.7, 0.225, 0); l1.castShadow = true;
    const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.6), iMat); l2.position.set(-0.7, 0.225, 0); l2.castShadow = true;
    g.add(seat, back, l1, l2); g.position.set(x, getGroundHeight(x, z), z); g.rotation.y = rotY; scene.add(g);
    colliders.push({ x, z, r: 1.2 });
  }

  [ { x: -2.5, z: 6, faceLamp: 0, faceBench: Math.PI / 2 }, { x: 2.5, z: 6, faceLamp: Math.PI, faceBench: -Math.PI / 2 },
    { x: -2.5, z: -10, faceLamp: 0, faceBench: Math.PI / 2 }, { x: 2.5, z: -10, faceLamp: Math.PI, faceBench: -Math.PI / 2 },
    { x: 28, z: -38, faceLamp: Math.PI, faceBench: Math.PI }, { x: -28, z: -38, faceLamp: 0, faceBench: Math.PI }
  ].forEach(s => { makeStreetLamp(s.x, s.z, s.faceLamp); makeBench(s.x, s.z + 2, s.faceBench); });

  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc0a12, roughness: 0.2, metalness: 0.7 });
  const bottomGeo = new THREE.BoxGeometry(1.6, 0.35, 3.8);
  const pB = bottomGeo.attributes.position;
  for (let i = 0; i < pB.count; i++) {
    const z = pB.getZ(i), y = pB.getY(i);
    if (z > 0 && y > 0) pB.setY(i, y - 0.15); 
    if (z < -1.0 && y > 0) pB.setY(i, y - 0.05); 
  }
  bottomGeo.computeVertexNormals();
  const bottomMesh = new THREE.Mesh(bottomGeo, bodyMat); bottomMesh.position.y = 0.35; bottomMesh.castShadow = true; car.add(bottomMesh);

  const cabinGeo = new THREE.BoxGeometry(1.2, 0.45, 1.8);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
  const pC = cabinGeo.attributes.position;
  for (let i = 0; i < pC.count; i++) {
    if (pC.getY(i) > 0) {
      pC.setX(i, pC.getX(i) * 0.8);
      if (pC.getZ(i) > 0) pC.setZ(i, pC.getZ(i) - 0.4);
      if (pC.getZ(i) < 0) pC.setZ(i, pC.getZ(i) + 0.5);
    }
  }
  cabinGeo.computeVertexNormals();
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat); cabinMesh.position.set(0, 0.75, -0.2); car.add(cabinMesh);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2, metalness: 0.8 });
  [[0.85, 0.25, 1.2], [-0.85, 0.25, 1.2], [0.85, 0.25, -1.2], [-0.85, 0.25, -1.2]].forEach(([x, y, z]) => {
    const wg = new THREE.Group();
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), wheelMat); w.rotation.z = Math.PI / 2; wg.add(w);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 8), rimMat); rim.rotation.z = Math.PI / 2; wg.add(rim);
    wg.position.set(x, y, z); car.add(wg);
  });

  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tlMat = new THREE.MeshBasicMaterial({ color: 0x550000 });
  [0.5, -0.5].forEach(x => {
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), hlMat); hl.position.set(x, 0.45, 1.91); car.add(hl);
    const tl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), tlMat); tl.position.set(x, 0.45, -1.91); tl.rotation.y = Math.PI; car.add(tl);
  });

  car.position.set(0, 0.25, 22); car.rotation.y = 0; 
  car.userData.spotlights = [];
  [0.5, -0.5].forEach(x => {
    const spot = new THREE.SpotLight(0xffffff, 4.0, 35, 0.4, 0.5, 1);
    spot.position.set(x, 0.45, 1.9); spot.target.position.set(x, 0, 15);
    car.add(spot); car.add(spot.target); car.userData.spotlights.push(spot);
  });
  scene.add(car);

  const cats = [];
  function spawnCat(startX, startZ, furColor = 0xffffee) {
    const cat = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 1.0 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1.0 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff9999, roughness: 1.0 });
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.2, metalness: 0.8 });
  
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.6), mat); body.position.y = 0.18; body.castShadow = true;
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 });
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.4), bellyMat); belly.position.set(0, 0.18, 0.05);
  
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), mat); head.position.set(0, 0.38, 0.32); head.castShadow = true;
    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mat); ear1.position.set(0.12, 0.58, 0.32); ear1.rotation.y = Math.PI / 4;
    const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 4), mat); ear2.position.set(-0.12, 0.58, 0.32); ear2.rotation.y = Math.PI / 4;
  
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), darkMat); eye1.position.set(0.1, 0.42, 0.48);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), darkMat); eye2.position.set(-0.1, 0.42, 0.48);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 5, 5), noseMat); nose.position.set(0, 0.36, 0.49);
  
    const tail1 = new THREE.Group(); tail1.position.set(0, 0.22, -0.3);
    const t1Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 6), mat); t1Mesh.position.y = 0.15; tail1.add(t1Mesh);
    const tail2 = new THREE.Group(); tail2.position.set(0, 0.28, -0.02); 
    const t2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.3, 6), mat); t2Mesh.position.y = 0.15; t2Mesh.rotation.x = -0.15;
    tail2.add(t2Mesh); tail1.add(tail2);
  
    [[0.14, 0, 0.2], [-0.14, 0, 0.2], [0.14, 0, -0.18], [-0.14, 0, -0.18]].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.2, 5), mat); leg.position.set(lx, 0.1, lz); cat.add(leg);
    });
  
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0xff3355, roughness: 0.5 }));
    collar.position.set(0, 0.32, 0.32);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), bellMat); bell.position.set(0, 0.25, 0.38);
  
    cat.add(body, belly, head, ear1, ear2, eye1, eye2, nose, tail1, collar, bell);
    cat.position.set(startX, 0.12, startZ); scene.add(cat);
  
    cats.push({
      mesh: cat, tail1, tail2, bell, angle: Math.random() * Math.PI * 2, state: 0, stateTimer: 2 + Math.random() * 4,
      walkSpeed: 0.018 + Math.random() * 0.015, homeX: startX, homeZ: startZ, turnTimer: 0, turnTarget: Math.random() * Math.PI * 2,
    });
  }
  spawnCat(7, 8, 0xffffcc); spawnCat(-7, 8, 0xddaa77); spawnCat(12, -22, 0xdddddd); spawnCat(-12, -38, 0x443322); spawnCat(5, -60, 0xffffcc);
  
  const birds = [];
  function spawnBird() {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.2), mat); w1.position.x = 0.3;
    const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.2), mat); w2.position.x = -0.3;
    g.add(w1, w2); g.position.set((Math.random() - 0.5) * 100, 15 + Math.random() * 15, (Math.random() - 0.5) * 100);
    scene.add(g); birds.push({ mesh: g, w1, w2, angle: Math.random() * Math.PI * 2, speed: 0.15 + Math.random() * 0.1 });
  }
  for (let i = 0; i < 10; i++) spawnBird();

  const keys = {};
  const onKeyDown = e => { if (!e.repeat) keys[e.key.toLowerCase()] = true; if(e.key.toLowerCase() === 'l') carLightsOn = !carLightsOn; };
  const onKeyUp = e => { keys[e.key.toLowerCase()] = false; };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  let carSpeed = 0, carAngle = Math.PI; 
  let camTarget = new THREE.Vector3(0, 1, 5); 
  let currentZone = null;
  let panelOpen = false;

  function checkZones() {
    let found = null;
    for (const z of ZONES) {
      if (Math.sqrt((car.position.x - z.x) ** 2 + (car.position.z - z.z) ** 2) < 8) { found = z; break; }
    }
    if (found && found.id !== currentZone) {
      currentZone = found.id;
      if (onZoneChange) onZoneChange(found);
      if (onToast) onToast(found.label, 'Press E to view info');
    } else if (!found && currentZone) {
      currentZone = null;
      if (onZoneChange) onZoneChange(null);
    }
  }

  const clock = new THREE.Clock();
  let time = 0;
  let reqId;

  function animate() {
    reqId = requestAnimationFrame(animate);
    const dt = clock.getDelta(); time += dt;

    if (!panelOpen) {
      const fwd = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
      const isBoosting = keys['control'] && fwd > 0;
      const accel = isBoosting ? 0.05 : 0.02;
      const friction = isBoosting ? 0.985 : 0.97;
      carSpeed += fwd * accel; carSpeed *= friction; 
      
      camera.fov = THREE.MathUtils.lerp(camera.fov, isBoosting ? 75 : 50, 0.1);
      camera.updateProjectionMatrix();

      const str = (keys['a'] || keys['arrowleft'] ? 1 : 0) - (keys['d'] || keys['arrowright'] ? 1 : 0);
      let turnSpeed = str * 0.05;
      if (keys[' '] && Math.abs(carSpeed) > 0.02) {
        turnSpeed *= 1.5; carSpeed *= 0.9; 
        createSkidMark(car.position.x, car.position.z, carAngle);
      }
      if (carSpeed < -0.01) turnSpeed = -turnSpeed;
      if (Math.abs(carSpeed) > 0.01) carAngle += turnSpeed;

      car.position.x += Math.sin(carAngle) * carSpeed; car.position.z += Math.cos(carAngle) * carSpeed;
      const dist = Math.sqrt(car.position.x ** 2 + car.position.z ** 2);
      if (dist > 140) {
        car.position.x -= Math.sin(carAngle) * carSpeed; car.position.z -= Math.cos(carAngle) * carSpeed;
        carSpeed *= 0.8;
      }
      car.position.y = THREE.MathUtils.lerp(car.position.y, getGroundHeight(car.position.x, car.position.z) + 0.1, 0.3);
      const spinSpeed = carSpeed * 6;
      car.children.forEach((c, i) => { if (i >= 2 && i <= 5) c.children[0] && (c.children[0].rotation.x += spinSpeed); });
      
      if (onSpeedChange) onSpeedChange(Math.round(Math.abs(carSpeed) * 450));
    }

    if (carWobble.active) {
      carWobble.time += dt;
      const t = carWobble.time / carWobble.duration;
      car.rotation.z = Math.sin(t * Math.PI * 8) * carWobble.strength * (1 - t);
      if (t >= 1) { carWobble.active = false; car.rotation.z = 0; }
    } else {
      car.rotation.y = carAngle;
      car.rotation.x = THREE.MathUtils.lerp(car.rotation.x, (getGroundHeight(car.position.x, car.position.z - 1) - getGroundHeight(car.position.x, car.position.z + 1)) * 0.06, 0.1);
    }

    for (const col of colliders) {
      const cdx = car.position.x - col.x, cdz = car.position.z - col.z;
      const cdist = Math.sqrt(cdx * cdx + cdz * cdz);
      if (cdist < col.r + 0.4) {
        const push = (col.r + 0.4 - cdist); const nx = cdx / cdist, nz = cdz / cdist;
        car.position.x += nx * push; car.position.z += nz * push;
        if (Math.abs(carSpeed) > 0.05 && !carWobble.active) {
          carWobble.active = true; carWobble.time = 0; carWobble.strength = Math.min(0.2, Math.abs(carSpeed));
        }
        carSpeed *= 0.8;
      }
    }

    const camIdealX = car.position.x - Math.sin(carAngle) * 11.0;
    const camIdealY = car.position.y + 6.0;
    const camIdealZ = car.position.z - Math.cos(carAngle) * 11.0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camIdealX, 0.15);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camIdealY, 0.15);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camIdealZ, 0.15);
    let lookX = car.position.x + Math.sin(carAngle) * 5, lookY = car.position.y + 0.7, lookZ = car.position.z + Math.cos(carAngle) * 5;
    if (keys['control'] && Math.abs(carSpeed) > 0.05) {
      lookX += (Math.random() - 0.5) * 0.4;
      lookY += (Math.random() - 0.5) * 0.4;
    }
    camTarget.set(THREE.MathUtils.lerp(camTarget.x, lookX, 0.2), THREE.MathUtils.lerp(camTarget.y, lookY, 0.2), THREE.MathUtils.lerp(camTarget.z, lookZ, 0.2));
    camera.lookAt(camTarget);

    const tSun = isNight ? 0.0 : 1.0; const tAmb = isNight ? 0.1 : 0.45; const tSky = isNight ? SKY_NIGHT : SKY_DAY;
    dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, tSun, 0.02); ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, tAmb, 0.02);
    scene.background.lerp(tSky, 0.02); scene.fog.color.lerp(tSky, 0.02); renderer.setClearColor(scene.background);
    
    skyTime += ((isNight ? 1 : 0) - skyTime) * 0.01;
    skyBody.position.set(THREE.MathUtils.lerp(150, -150, skyTime), 150 - Math.sin(skyTime * Math.PI) * 150, -150);
    dirLight.position.copy(skyBody.position); skyMat.color.lerp(isNight ? new THREE.Color(0xff1111) : new THREE.Color(0xfffa88), 0.02);
    starsMat.opacity = THREE.MathUtils.lerp(starsMat.opacity, isNight ? 1 : 0, 0.02);

    shootingStarTimer -= dt;
    if (isNight && shootingStarTimer <= 0) {
      shootingStar.position.set((Math.random() - 0.5) * 200, 150 + Math.random() * 50, -150);
      shootingStar.userData.v = new THREE.Vector3(-100 - Math.random() * 100, -50 - Math.random() * 50, 0);
      shMat.opacity = 1; shootingStarTimer = 8 + Math.random() * 4;
    }
    if (shMat.opacity > 0) { shootingStar.position.addScaledVector(shootingStar.userData.v, dt); shMat.opacity -= dt * 0.5; }

    envPlants.forEach(p => { p.rotation.z = Math.sin(time * 1.5 + p.position.x * 0.1) * 0.03; p.rotation.x = Math.cos(time * 1.5 + p.position.z * 0.1) * 0.03; });
    car.userData.spotlights.forEach(s => { s.intensity = THREE.MathUtils.lerp(s.intensity, (isNight && carLightsOn) ? 4 : 0, 0.05); });
    streetLamps.forEach(lamp => {
      lamp.spot.intensity = THREE.MathUtils.lerp(lamp.spot.intensity, isNight ? 2.5 : 0, 0.05);
      lamp.dust.material.opacity = THREE.MathUtils.lerp(lamp.dust.material.opacity, isNight ? 0.8 : 0, 0.05);
      if (isNight) {
        const parr = lamp.dust.geometry.attributes.position.array;
        for (let i = 0; i < 40; i++) {
          parr[i * 3 + 1] -= 0.01; parr[i * 3] += Math.sin(time * 2.5 + i) * 0.004; parr[i * 3 + 2] += Math.cos(time * 2.5 + i) * 0.004;
          if (parr[i * 3 + 1] < -3) parr[i * 3 + 1] = 0;
        }
        lamp.dust.geometry.attributes.position.needsUpdate = true;
      }
    });

    if (keys['s'] || keys['arrowdown']) tlMat.color.setHex(0xff0000); else tlMat.color.setHex(0x330000);

    zoneGroups.forEach(z => {
      z.symbol.position.y = 1.5 + Math.sin(time * 2 + z.symbol.position.x) * 0.3;
      z.symbol.rotation.y += 0.01; z.symbol.rotation.z += 0.01;
      z.label.lookAt(camera.position); z.light.intensity = isNight ? 2.5 : 0.5;
    });

    clouds.children.forEach(c => { c.position.x -= 0.05; if (c.position.x < -150) c.position.x = 150; });

    const positions = petals.geometry.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      positions[i * 3 + 1] -= 0.08; positions[i * 3] += Math.sin(time + i) * 0.03; positions[i * 3 + 2] += Math.cos(time + i * 0.5) * 0.03;
      if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 40;
    }
    petals.geometry.attributes.position.needsUpdate = true;

    const sPositions = snowflakes.geometry.attributes.position.array;
    for (let i = 0; i < sCount; i++) {
      sPositions[i * 3 + 1] -= 0.05; sPositions[i * 3] += Math.sin(time * 0.5 + i * 0.7) * 0.02; sPositions[i * 3 + 2] += Math.cos(time * 0.5 + i * 0.5) * 0.02;
      if (sPositions[i * 3 + 1] < -1) sPositions[i * 3 + 1] = 35;
    }
    snowflakes.geometry.attributes.position.needsUpdate = true;

    birds.forEach(b => {
      b.mesh.position.x += Math.sin(b.angle) * b.speed; b.mesh.position.z += Math.cos(b.angle) * b.speed;
      b.mesh.rotation.y = b.angle + Math.PI / 2;
      b.w1.rotation.z = Math.sin(time * 12) * 0.6; b.w2.rotation.z = -Math.sin(time * 12) * 0.6;
      if (b.mesh.position.length() > 80) b.angle += (Math.random() * 0.5 + 0.1);
    });

    cats.forEach(c => {
      c.stateTimer -= dt;
      if (c.stateTimer <= 0) {
        const roll = Math.random();
        if (c.state === 0) {
          if (roll < 0.38) c.state = 1; else if (roll < 0.70) c.state = 2; else c.state = 3; 
          c.stateTimer = 1.5 + Math.random() * 4;
        } else {
          c.state = 0; c.stateTimer = 3 + Math.random() * 6;
          const dx = c.homeX - c.mesh.position.x; const dz = c.homeZ - c.mesh.position.z;
          const homeDist = Math.sqrt(dx * dx + dz * dz);
          if (homeDist > 12) { c.angle = Math.atan2(dx, dz) + (Math.random() - 0.5) * 0.8; } 
          else { c.angle += (Math.random() - 0.5) * Math.PI * 0.8; }
        }
      }
  
      if (c.state === 0) {
        c.turnTimer -= dt;
        if (c.turnTimer <= 0) { c.turnTarget = c.angle + (Math.random() - 0.5) * Math.PI * 0.7; c.turnTimer = 1 + Math.random() * 2; }
        let angleDiff = c.turnTarget - c.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2; while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        c.angle += angleDiff * Math.min(1, dt * 1.5);
  
        c.mesh.position.x += Math.sin(c.angle) * c.walkSpeed; c.mesh.position.z += Math.cos(c.angle) * c.walkSpeed;
        c.mesh.rotation.y = c.angle;
  
        if (Math.abs(c.mesh.position.x) > 40 || Math.abs(c.mesh.position.z) > 75) { c.angle += Math.PI; c.turnTarget = c.angle; }
        c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.12 + Math.abs(Math.sin(time * 8)) * 0.05;
        c.tail1.rotation.x = 0.5 + Math.sin(time * 4) * 0.3; c.tail2.rotation.x = -0.3 + Math.sin(time * 4 + 1) * 0.3;
        const jingle = 1 + Math.abs(Math.sin(time * 8)) * 0.12; c.bell.scale.set(jingle, jingle, jingle); c.mesh.rotation.z = 0; 
      } else if (c.state === 1) {
        c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.06;
        c.tail1.rotation.x = 1.2; c.tail2.rotation.x = 0.2; c.bell.scale.set(1, 1, 1); c.mesh.rotation.z = 0;
      } else if (c.state === 2) {
        c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.08;
        c.mesh.rotation.z = Math.sin(time * 3) * 0.12; c.tail1.rotation.x = 0.8; c.bell.scale.set(1, 1, 1);
      } else {
        const bounce = Math.abs(Math.sin(time * 10)) * 0.5;
        c.mesh.position.y = getGroundHeight(c.mesh.position.x, c.mesh.position.z) + 0.12 + bounce;
        c.mesh.rotation.y += dt * 4; 
        c.tail1.rotation.x = Math.sin(time * 12) * 0.8; c.tail2.rotation.x = Math.cos(time * 12) * 0.6;
        const jingle = 1 + bounce * 0.4; c.bell.scale.set(jingle, jingle, jingle); c.mesh.rotation.z = Math.sin(time * 8) * 0.15;
      }
    });

    checkZones();
    composer.render();
  }

  let prog = 0;
  const loadInt = setInterval(() => {
    prog += Math.random() * 15;
    if (onProgress) onProgress(Math.min(prog, 100));
    if (prog >= 100) {
      clearInterval(loadInt);
      setTimeout(() => { if (onReady) onReady(); }, 500);
    }
  }, 100);

  animate();

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);

  return {
    cleanup: () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      clearInterval(loadInt);
      renderer.dispose();
    },
    setTheme: (night) => { isNight = night; },
    setPause: (p) => { panelOpen = p; }
  };
}
