import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { missions, modelDimensions } from './mars-missions-data.js';
import { createReplay } from './mars-mission-replay.js';
import { createDust } from './mars-surface-effects.js';
import { createSiteTerrain, terrainSites } from './mars-site-terrain.js';
import { createChat } from './mars-chat.js';
import { loadMissionModel, fitModel } from './mars-models.js';
import { createMissionMedia } from './mars-mission-media.js';

const $ = id => document.getElementById(id);
const asset = name => name === 'sojourner-dan.glb' ? '/assets/models/sojourner-dan.glb' : import.meta.env.BASE_URL + 'mars-assets/' + name;
// ?tour=1: shown inside the Legacy Voyage cockpit, which does the talking and the controls.
const touring = new URLSearchParams(location.search).has('tour');
if (touring) document.body.classList.add('is-tour');
const viewport = $('viewport');
const markerLayer = $('markers');
const message = $('message');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const savedModels = new Map();
let active = null;
let flight = null;
let model = null;

function showMessage(text = '') {
  message.textContent = text;
  message.hidden = !text;
}

try {
  start();
} catch (error) {
  showMessage('Could not open 3D. Try a browser that supports WebGL.');
  $('reset').disabled = true;
  console.error(error);
}

function start() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  viewport.append(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.02, 160);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;

  const globe = new THREE.Scene();
  globe.background = new THREE.Color(0x0c0a11);
  const surface = new THREE.Scene();
  surface.background = new THREE.Color(0xa8674a);
  surface.fog = new THREE.FogExp2(0xa8674a, 0.035);
  const dust = createDust(surface);
  const replay = createReplay(camera, controls, reduceMotion, dust, () => chat.finishReplay());
  const chat = createChat({ waitForReplay: true, speechEnabled: !touring });
  const media = createMissionMedia(viewport.parentElement);

  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xa95433, roughness: 0.93 });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(2, 96, 64), sphereMaterial);
  globe.add(planet);
  new THREE.TextureLoader().load(asset('mars.jpg'), texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    sphereMaterial.map = texture;
    sphereMaterial.color.set(0xffffff);
    sphereMaterial.needsUpdate = true;
  }, undefined, () => showMessage('Could not load the NASA surface image. The mission dots still work.'));

  const stars = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i < 900; i++) {
    const y = 2 * random(i + 31) - 1;
    const angle = random(i + 1120) * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    points.push(55 * r * Math.cos(angle), 55 * y, 55 * r * Math.sin(angle));
  }
  stars.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  globe.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xcac7d5, size: 0.12 })));
  globe.add(new THREE.HemisphereLight(0xffdfc8, 0x8a4d32, 2));
  const sun = new THREE.DirectionalLight(0xffeee0, 2.4);
  sun.position.set(5, 4, 3);
  globe.add(sun);

  surface.add(new THREE.HemisphereLight(0xffe5d2, 0x966344, 1.15));
  const key = new THREE.DirectionalLight(0xffe3bf, 2.45);
  key.position.set(-6, 8, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: .5, far: 24 });
  key.shadow.normalBias = .025;
  key.shadow.bias = -.0002;
  surface.add(key);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  surface.environment = pmrem.fromScene(room, 0.04).texture;
  surface.environmentIntensity = 0.45;
  room.dispose();
  pmrem.dispose();

  const siteCache = new Map();
  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('draco/', new URL(asset('mars.jpg'), location.href)).href);
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const pins = missions.map(mission => {
    const vector = geo(mission.lat, mission.lon);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'marker';
    button.setAttribute('aria-label', 'Explore ' + mission.name);
    const label = document.createElement('span');
    label.textContent = mission.name;
    button.append(label);
    button.addEventListener('click', () => select(mission, vector));
    markerLayer.append(button);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'mission';
    const name = document.createElement('strong');
    name.textContent = mission.name;
    const site = document.createElement('small');
    site.textContent = mission.site;
    card.append(name, site);
    card.addEventListener('click', () => select(mission, vector));
    $('mission-list').append(card);
    return { vector, button };
  });
  const projection = new THREE.Vector3();
  const initial = geo(17, 42).multiplyScalar(6.7);
  let globeView = initial.clone();

  function reset() {
    const span = active?.model ? modelDimensions[active.model].meters : 3;
    // One wide, fixed view per machine: rovers and the helicopter keep their whole
    // travel area in frame, so the camera never has to zoom or chase during the replay.
    const moving = Boolean(active) && active.type !== 'Lander';
    const framing = modelDimensions[active?.model]?.framing ?? (moving ? Math.max(span < 2 ? 1.05 : 1.35, span / 3 * 1.25) : Math.max(.9, span / 3 * 1.15));
    controls.target.set(0, active ? modelFocusHeight() : 0, moving ? -.45 : 0);
    controls.minDistance = active ? Math.max(.35, span * .7) : 4.4;
    controls.maxDistance = active ? Math.max(16, span * 4.5) : 13;
    controls.maxPolarAngle = active ? 1.48 : Math.PI - 0.04;
    controls.minPolarAngle = 0.05;
    if (active) {
      camera.position.set(4.3, 2.4, 5.1).multiplyScalar(framing).add(controls.target);
    } else {
      camera.position.copy(initial);
    }
    controls.update();
  }

  function modelFocusHeight() {
    return model ? model.userData.focusHeight : .6;
  }

  function select(mission, vector) {
    if (active || flight) return;
    globeView = camera.position.clone();
    markerLayer.hidden = true;
    $('catalog').inert = true;
    $('reset').disabled = true;
    controls.enabled = false;
    const direction = camera.position.clone().normalize();
    const rotation = new THREE.Quaternion().setFromUnitVectors(direction, vector);
    flight = { mission, direction, rotation, distance: camera.position.length(), started: performance.now() };
    if (reduceMotion) openMission(mission);
  }

  function openMission(mission) {
    flight = null;
    active = mission;
    const site = terrainSites[mission.id];
    media.close();
    if (mission.model) {
      if (!siteCache.has(mission.id)) siteCache.set(mission.id, createSiteTerrain(mission.id));
      const terrain = siteCache.get(mission.id);
      surface.add(terrain.group);
      surface.background.setHex(site.sky);
      surface.fog.color.setHex(site.sky);
      replay.setTerrain(terrain.groundOffset);
    }
    controls.enabled = true;
    $('reset').disabled = false;
    $('reset').hidden = !mission.model;
    $('back').hidden = false;
    $('catalog').hidden = true;
    document.body.classList.add('is-mission');
    $('replay-restart').hidden = !mission.model;
    $('story-bar').hidden = !mission.model;
    $('more').hidden = false;
    $('more').open = false;
    // Kind of location stays visible (CLAUDE.md rule 2: Ingenuity's final resting place ≠ deployment site).
    $('stage-site').textContent = mission.type + ' · ' + mission.site + ' · ' + mission.location;
    $('stage-site').hidden = false;
    $('hint').textContent = !mission.model && !mission.viewer ? 'NASA mission photograph' : 'Drag to rotate · Scroll to zoom · Not to scale';
    const dimensions = modelDimensions[mission.model];
    $('model-size').parentElement.hidden = !dimensions;
    $('model-size').textContent = dimensions?.label ?? (mission.viewer ? 'Rotate the model in the 3D viewer' : 'NASA photograph');
    $('model-size').href = dimensions?.source ?? mission.source;
    $('mission-source').href = mission.source;
    $('model-credit').textContent = '3D model · ' + mission.credit;
    $('model-reference').hidden = !mission.modelReference;
    $('model-reference').href = mission.modelReference ?? '';
    $('model-license').hidden = !mission.modelLicense;
    $('model-license').href = mission.modelLicense ?? '';
    $('model-reference').parentElement.hidden = !mission.modelReference && !mission.modelLicense;
    if (mission.model) replay.open(mission);
    chat.open(mission.id, mission);
    // Tell the story straight away: the click that opened this machine allows speech.
    if (!touring) chat.narrate();
    document.querySelector('.stage-title h1').textContent = mission.name;
    document.querySelector('.stage-title .kicker').textContent = site?.title ?? mission.site;
    const link = $('scene-source');
    link.href = site?.source ?? mission.source;
    link.textContent = site ? 'Terrain built from NASA images ↗' : 'NASA mission page ↗';
    $('terrain-note').textContent = site?.note ?? mission.summary;
    $('stage-name').focus({ preventScroll: true });
    reset();
    if (!mission.model) {
      media.open(mission);
      showMessage();
      return;
    }
    showMessage('Loading NASA model…');

    if (!savedModels.has(mission.model)) {
      savedModels.set(mission.model, loadMissionModel(loader, asset, mission.model).catch(error => {
        savedModels.delete(mission.model);
        throw error;
      }));
    }
    savedModels.get(mission.model).then(result => {
      if (active !== mission || model) return;
      model = fitModel(result.scene, mission.model, dimensions);
      surface.add(model);
      replay.attach(model);
      reset();
      showMessage();
      // Play the actions straight away; the Replay button starts them again.
      replay.autoplay();
    }).catch(error => {
      if (active !== mission) return;
      showMessage('Could not load the model. Go back to the globe and try again.');
      console.error(error);
    });
  }

  $('back').addEventListener('click', () => {
    const previous = active;
    const previousTerrain = siteCache.get(previous.id);
    if (previousTerrain) surface.remove(previousTerrain.group);
    media.close();
    replay.close();
    chat.close();
    document.body.classList.remove('is-mission');
    $('replay-restart').hidden = true;
    if (model) surface.remove(model);
    model = null;
    active = null;
    controls.enabled = true;
    reset();
    camera.position.copy(globeView);
    controls.update();
    $('back').hidden = true;
    $('story-bar').hidden = true;
    $('more').hidden = true;
    $('stage-site').hidden = true;
    $('catalog').hidden = false;
    $('reset').hidden = false;
    $('hint').textContent = 'Drag to rotate · Scroll to zoom · Not to scale';
    $('catalog').inert = false;
    markerLayer.hidden = false;
    document.querySelector('.stage-title h1').textContent = 'Mars';
    document.querySelector('.stage-title .kicker').textContent = 'MISSION MAP';
    const link = $('scene-source');
    link.href = 'https://science.nasa.gov/3d-resources/mars/';
    link.textContent = 'Surface image · NASA/JPL ↗';
    showMessage();
    const index = missions.indexOf(previous);
    $('mission-list').children[index]?.focus({ preventScroll: true });
  });
  $('replay-restart').addEventListener('click', () => {
    if (!active || !model) return;
    replay.reset();
    reset();
    replay.autoplay();
  });
  $('reset').addEventListener('click', () => {
    if (active) replay.reset();
    reset();
  });
  reset();

  // ?mission=<id>: open one machine directly (used when returning from the main app's artifact card).
  const requested = missions.find(mission => mission.id === new URLSearchParams(location.search).get('mission'));
  if (requested) {
    globeView = geo(requested.lat, requested.lon).multiplyScalar(initial.length());
    markerLayer.hidden = true;
    $('catalog').inert = true;
    openMission(requested);
  }

  new ResizeObserver(() => {
    const { clientWidth, clientHeight } = viewport;
    if (!clientWidth || !clientHeight) return;
    camera.aspect = clientWidth / clientHeight;
    // In the cockpit the console covers the bottom of the frame: lift the picture into the windshield.
    if (touring) camera.setViewOffset(clientWidth, clientHeight, 0, Math.round(clientHeight * .16), clientWidth, clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }).observe(viewport);

  const step = new THREE.Quaternion();
  const facing = new THREE.Vector3();
  renderer.setAnimationLoop(now => {
    if (flight) {
      const t = Math.min(1, Math.max(0, (now - flight.started) / 950));
      const eased = t * t * (3 - 2 * t);
      step.identity().slerp(flight.rotation, eased);
      camera.position.copy(flight.direction).applyQuaternion(step).multiplyScalar(THREE.MathUtils.lerp(flight.distance, 2.52, eased));
      camera.lookAt(0, 0, 0);
      if (t === 1) openMission(flight.mission);
    } else {
      if (active) replay.animate(now);
      controls.update();
      if (active) replay.project();
    }

    if (!active && !flight) {
      camera.updateMatrixWorld();
      facing.copy(camera.position).normalize();
      for (const { vector, button } of pins) {
        projection.copy(vector).multiplyScalar(2.01).project(camera);
        button.hidden = vector.dot(facing) <= 2 / camera.position.length()
          || Math.abs(projection.x) > 1 || Math.abs(projection.y) > 1;
        if (!button.hidden) {
          button.style.left = (projection.x + 1) * 50 + '%';
          button.style.top = (1 - projection.y) * 50 + '%';
        }
      }
    }
    renderer.render(active ? surface : globe, camera);
  });
}

function random(seed) {
  const value = Math.sin(seed * 374.129) * 43758.5453;
  return value - Math.floor(value);
}

function geo(latitude, longitude) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon));
}
