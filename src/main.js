const canvas = document.querySelector('#particle-scene');
const ctx = canvas.getContext('2d', { alpha: false });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const models = [
  { id: 'turtle', title: 'Turtle Tower', lines: ['Turtle', 'Tower'], subtitle: 'A quiet giant, held together\nby light and a little patience.', type: 'LIVING GEOMETRY', accent: [198, 239, 128], index: '01', scale: 1, feature: 'A map of old journeys' },
  { id: 'atlas', title: 'Human Atlas', lines: ['Human', 'Atlas'], subtitle: 'An open atlas of the systems\nthat make a life move.', type: 'ANATOMY / 001', accent: [165, 228, 198], index: '02', scale: .94, feature: 'The quiet architecture' },
  { id: 'engine', title: 'V8 Engine', lines: ['V8', 'Engine'], subtitle: 'A thousand small movements,\none extraordinary rhythm.', type: 'MECHANICAL / 008', accent: [255, 183, 116], index: '03', scale: 1.02, feature: 'Eight chambers, one pulse' }
];

let width = 0, height = 0, dpr = 1;
let modelIndex = 0;
let particles = [];
let yaw = -.34, pitch = -.12, targetYaw = yaw, targetPitch = pitch;
let zoom = 1, targetZoom = 1;
let separation = 0, targetSeparation = 0;
let impulse = 0, time = 0, isDragging = false, lastPointer = null;
let toastTimer;
let cameraStream = null, handLandmarker = null, trackingFrame = 0, cameraStarted = false;
let previousGesture = '', gestureCooldown = 0, previousHandsDistance = null;
let sensitivityForgiving = false;
const random = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const distance3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

function makeParticles(id) {
  const rng = random(id === 'turtle' ? 4127 : id === 'atlas' ? 8831 : 1919);
  const list = [];
  const addEllipsoid = (center, radii, count, palette, minSize = .7, maxSize = 1.75, upperOnly = false) => {
    for (let i = 0; i < count; i++) {
      const u = rng() * 2 - 1;
      if (upperOnly && u < -.02) continue;
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const texture = .975 + rng() * .05;
      list.push({ x: center.x + Math.cos(a) * r * radii.x * texture, y: center.y + u * radii.y * texture, z: center.z + Math.sin(a) * r * radii.z * texture, color: palette[Math.floor(rng() * palette.length)], size: minSize + rng() * (maxSize - minSize), phase: rng() * Math.PI * 2, drift: .15 + rng() * .8 });
    }
  };
  const addRod = (a, b, radius, count, palette) => {
    const axis = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const len = Math.hypot(axis.x, axis.y, axis.z) || 1;
    for (let i = 0; i < count; i++) {
      const t = rng(), angle = rng() * Math.PI * 2, rr = radius * Math.sqrt(rng());
      const ex = Math.abs(axis.y / len) > .87 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
      const q = { x: axis.y * ex.z - axis.z * ex.y, y: axis.z * ex.x - axis.x * ex.z, z: axis.x * ex.y - axis.y * ex.x };
      const ql = Math.hypot(q.x, q.y, q.z) || 1; q.x /= ql; q.y /= ql; q.z /= ql;
      const r = { x: axis.y * q.z - axis.z * q.y, y: axis.z * q.x - axis.x * q.z, z: axis.x * q.y - axis.y * q.x };
      const off1 = Math.cos(angle) * rr, off2 = Math.sin(angle) * rr;
      list.push({ x: a.x + axis.x * t + q.x * off1 + r.x * off2, y: a.y + axis.y * t + q.y * off1 + r.y * off2, z: a.z + axis.z * t + q.z * off1 + r.z * off2, color: palette[Math.floor(rng() * palette.length)], size: .7 + rng() * 1.45, phase: rng() * Math.PI * 2, drift: .2 + rng() * .8 });
    }
  };
  const green = ['#c7f36b', '#aee657', '#e2ff9a', '#d2f87c', '#76ba65', '#efffbe'];
  const pale = ['#d4f4be', '#b8e7a4', '#ecf8cf', '#97ca84', '#d1edaf'];
  const blue = ['#b2f2d4', '#d8ffe9', '#73d6b6', '#99e8c8', '#c4f7df'];
  const amber = ['#ffd198', '#f4a665', '#ffe1ad', '#f3bc7c', '#fff0c8', '#c99765'];
  if (id === 'turtle') {
    // Darker under-shell; then a vaulted, panelled dome that reads as a light-built shell.
    addEllipsoid({ x: -.08, y: -.13, z: 0 }, { x: .94, y: .34, z: .69 }, 510, ['#6f9b59', '#99c86a', '#b8e779', '#567d50'], .75, 1.65);
    addEllipsoid({ x: -.04, y: .19, z: 0 }, { x: .96, y: .70, z: .73 }, 1080, green, .8, 1.8, true);
    // Shell rim, growth lines, and a restrained hexagonal impression.
    for (let a = 0; a < 18; a++) {
      const theta = (a / 18) * Math.PI * 2;
      for (let v = 0; v < 22; v++) {
        const u = -.02 + v / 23;
        const r = Math.sqrt(1 - u * u);
        list.push({ x: -.04 + Math.cos(theta) * r * .975, y: .19 + u * .712, z: Math.sin(theta) * r * .744, color: a % 2 ? '#efffbd' : '#83bd53', size: .8 + rng() * .65, phase: rng() * Math.PI * 2, drift: .12 });
      }
    }
    // Four softly jointed feet, a curious head and tiny, readable eyes.
    addEllipsoid({ x: -.05, y: -.30, z: 0 }, { x: .71, y: .23, z: .5 }, 280, ['#8dbc5e', '#c4ed81', '#759d53'], .7, 1.45);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      addEllipsoid({ x: sx * .62, y: -.41, z: sz * .48 }, { x: .22, y: .29, z: .21 }, 135, green, .75, 1.5);
      addEllipsoid({ x: sx * .65, y: -.62, z: sz * .50 }, { x: .22, y: .105, z: .21 }, 70, ['#dcf9a0', '#99cf67'], .7, 1.25);
    }
    addEllipsoid({ x: .99, y: .02, z: 0 }, { x: .39, y: .28, z: .30 }, 235, pale, .85, 1.65);
    for (const z of [-.205, .205]) addEllipsoid({ x: 1.13, y: .15, z }, { x: .047, y: .052, z: .035 }, 22, ['#f7ffc9', '#f6df91'], 1, 1.8);
    addRod({ x: -.94, y: -.17, z: 0 }, { x: -1.35, y: -.29, z: 0 }, .13, 64, ['#9fce66', '#daef94']);
  } else if (id === 'atlas') {
    addEllipsoid({ x: 0, y: .98, z: 0 }, { x: .25, y: .31, z: .22 }, 205, pale, .8, 1.6);
    addEllipsoid({ x: 0, y: .48, z: 0 }, { x: .38, y: .45, z: .24 }, 330, blue, .75, 1.6);
    addEllipsoid({ x: 0, y: -.02, z: 0 }, { x: .48, y: .42, z: .22 }, 300, ['#a4e4c4', '#d6f7d8', '#83d0b0'], .7, 1.4);
    addRod({ x: 0, y: .58, z: .02 }, { x: 0, y: -.37, z: .02 }, .065, 125, ['#efffe0', '#a0e1bc']);
    for (const side of [-1, 1]) {
      addRod({ x: side * .22, y: .65, z: 0 }, { x: side * .47, y: .08, z: .04 }, .115, 160, blue);
      addEllipsoid({ x: side * .48, y: .06, z: .04 }, { x: .13, y: .14, z: .14 }, 55, pale, .7, 1.35);
      addRod({ x: side * .47, y: .02, z: .02 }, { x: side * .64, y: -.36, z: .08 }, .095, 125, blue);
      addRod({ x: side * .19, y: -.28, z: 0 }, { x: side * .22, y: -.91, z: .04 }, .14, 185, blue);
      addEllipsoid({ x: side * .23, y: -1.02, z: .12 }, { x: .13, y: .085, z: .2 }, 50, pale, .8, 1.4);
    }
    addEllipsoid({ x: 0, y: .58, z: .245 }, { x: .17, y: .22, z: .065 }, 85, ['#d7fff1', '#8ddcbc'], .7, 1.25);
  } else {
    // A compact V8 block, eight softly glowing cylinder heads and suggestion of intake runners.
    addEllipsoid({ x: 0, y: .02, z: 0 }, { x: .88, y: .47, z: .63 }, 625, ['#d9a373', '#ffe0ad', '#bd8d66', '#ffcb8c'], .7, 1.55);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const x = -.57 + i * .38;
        addEllipsoid({ x, y: .46, z: side * .39 }, { x: .135, y: .34, z: .20 }, 104, amber, .75, 1.45);
        addEllipsoid({ x, y: -.02, z: side * .59 }, { x: .13, y: .18, z: .06 }, 44, ['#fff0ce', '#f0a969'], .7, 1.2);
        addRod({ x, y: .64, z: side * .40 }, { x, y: .91, z: side * .35 }, .085, 36, ['#fff0cb', '#ffbd79']);
      }
      addRod({ x: -.78, y: .52, z: side * .18 }, { x: .78, y: .52, z: side * .18 }, .09, 110, ['#fff1d1', '#c89467']);
    }
    addEllipsoid({ x: 0, y: -.51, z: 0 }, { x: .42, y: .12, z: .35 }, 105, ['#ffcc88', '#f19b5d'], .7, 1.3);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) addRod({ x: s * .83, y: .25 - i * .18, z: -.25 }, { x: s * 1.12, y: -.12 - i * .12, z: -.33 }, .075, 35, ['#e4ac77', '#ffd8a4']);
  }
  return list;
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height;
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function stageCenter() {
  const mobile = width < 600;
  const tablet = width < 850;
  return { x: width * (mobile ? .66 : tablet ? .69 : .665), y: height * (mobile ? .43 : .49) };
}

function render(now) {
  time = now * .001;
  if (!isDragging) targetYaw += .00013;
  yaw += (targetYaw - yaw) * .075;
  pitch += (targetPitch - pitch) * .075;
  zoom += (targetZoom - zoom) * .085;
  separation += (targetSeparation - separation) * .07;
  impulse *= .94;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#09110f'; ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * .65, height * .46, 10, width * .65, height * .46, Math.max(width, height) * .68);
  glow.addColorStop(0, '#173226'); glow.addColorStop(.36, '#101f18'); glow.addColorStop(1, '#08100e');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
  drawAtmosphere(); drawFloor(); drawOrbit();
  const model = models[modelIndex], accent = model.accent;
  const center = stageCenter();
  const scale = Math.min(width, height) * .272 * zoom * model.scale;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const sorted = [];
  for (const p of particles) {
    const bloom = (Math.sin(time * .75 + p.phase) + 1) * .5;
    const spark = impulse * (1.2 + bloom * .9);
    const expanded = separation * (1.15 + p.drift * .85) + spark;
    let x = p.x * (1 + expanded) + Math.sin(time * .8 + p.phase) * .003 * (1 + separation);
    let y = p.y * (1 + expanded) + Math.cos(time * .7 + p.phase) * .003 * (1 + separation);
    let z = p.z * (1 + expanded);
    const xr = x * cy + z * sy, zr = -x * sy + z * cy;
    const yr = y * cp - zr * sp, zf = y * sp + zr * cp;
    const perspective = 1 / (1 + zf * .105);
    const px = center.x + xr * scale * perspective;
    const py = center.y - yr * scale * perspective;
    const size = p.size * (.62 + bloom * .42) * perspective * (dpr > 1 ? 1 : 1.08);
    const depth = Math.max(.25, Math.min(1, .73 - zf * .1));
    sorted.push({ px, py, zf, size, alpha: Math.min(.98, (.58 + bloom * .33) * depth), color: p.color });
  }
  sorted.sort((a, b) => a.zf - b.zf);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const p of sorted) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color; ctx.shadowBlur = p.size > 1.45 ? 8 : 3.4;
    ctx.beginPath(); ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  drawFocusRing(center, scale, accent);
  drawCornerMarks();
  requestAnimationFrame(render);
}

function drawAtmosphere() {
  const rng = random(177);
  ctx.save();
  for (let i = 0; i < 68; i++) {
    const x = rng() * width, y = rng() * height;
    const radius = .4 + rng() * 1;
    const a = .1 + (Math.sin(time * .7 + i) + 1) * .06;
    ctx.globalAlpha = a; ctx.fillStyle = i % 5 === 0 ? '#d5f2a5' : '#cae2d1';
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFloor() {
  const horizon = height * .74;
  ctx.save();
  const g = ctx.createLinearGradient(0, horizon - 55, 0, height);
  g.addColorStop(0, 'rgba(154,207,148,0)'); g.addColorStop(1, 'rgba(152,204,156,.09)');
  ctx.fillStyle = g; ctx.fillRect(0, horizon - 55, width, height - horizon + 55);
  ctx.strokeStyle = 'rgba(182,224,174,.065)'; ctx.lineWidth = .7;
  for (let i = 0; i <= 7; i++) {
    const t = i / 7, y = horizon + t * t * (height - horizon + 30);
    ctx.globalAlpha = .14 + t * .34; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
  const center = stageCenter();
  for (let i = -8; i <= 8; i++) {
    ctx.globalAlpha = .18;
    ctx.beginPath(); ctx.moveTo(center.x + i * 31, horizon); ctx.lineTo(center.x + i * 116, height); ctx.stroke();
  }
  ctx.restore();
}

function drawOrbit() {
  const center = stageCenter();
  ctx.save();
  ctx.translate(center.x, center.y + 7);
  ctx.strokeStyle = 'rgba(199,243,107,.14)'; ctx.lineWidth = .8;
  ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.ellipse(0, 0, Math.min(width, height) * .25, Math.min(width, height) * .075, -.12, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  const a = time * .16;
  ctx.fillStyle = '#d7f99a'; ctx.shadowColor = '#c7f36b'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(Math.cos(a) * Math.min(width, height) * .25, Math.sin(a) * Math.min(width, height) * .074, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawFocusRing(center, scale, accent) {
  const mobile = width < 600;
  const r = Math.min(width, height) * (mobile ? .22 : .246) * zoom;
  ctx.save(); ctx.translate(center.x, center.y + 5);
  ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},.12)`; ctx.lineWidth = .7;
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * .72, .18, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},.27)`; ctx.setLineDash([1, 8]);
  ctx.beginPath(); ctx.ellipse(0, 0, r * .88, r * .57, -.16, .18, Math.PI * .64); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}

function drawCornerMarks() {
  const c = stageCenter();
  ctx.save(); ctx.strokeStyle = 'rgba(211,238,203,.17)'; ctx.lineWidth = .8;
  for (const [dx, dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
    const x = c.x + dx * Math.min(width, height) * .285, y = c.y + dy * Math.min(width, height) * .27;
    ctx.beginPath(); ctx.moveTo(x, y + dy * 8); ctx.lineTo(x, y); ctx.lineTo(x + dx * 8, y); ctx.stroke();
  }
  ctx.restore();
}

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function updateModel() {
  const model = models[modelIndex];
  particles = makeParticles(model.id);
  $('#stage-model-title').innerHTML = `${model.lines[0]}<br /><em>${model.lines[1]}</em>`;
  $('#stage-model-subtitle').innerHTML = model.subtitle.replace('\n', '<br />');
  $('#scene-meta-type').textContent = model.type;
  $('.stage-bottom-counter').innerHTML = `${model.index}<span> / 03</span>`;
  $$('.model-option').forEach((button) => button.classList.toggle('is-selected', button.dataset.model === model.id));
  $('#feature-title').textContent = model.feature;
  $('#feature-category').textContent = `${model.type.split(' ')[0]} / ${model.index}`;
  $('#feature-copy').textContent = model.id === 'turtle' ? 'Each ridge records a different season.' : model.id === 'atlas' ? 'Structure meets movement, in miniature.' : 'Eight small chambers share one pulse.';
  targetSeparation = 0;
  $('#scene-status').textContent = 'Idle';
  setActiveAction('form');
}

function setActiveAction(action) { $$('.dock-button').forEach((button) => button.classList.toggle('is-active', button.dataset.action === action)); }
function runAction(action, fromGesture = false) {
  const model = models[modelIndex];
  if (action === 'next') {
    modelIndex = (modelIndex + 1) % models.length; updateModel(); impulse = .6;
    showToast(`Now exploring ${models[modelIndex].title}.`);
    return;
  }
  if (action === 'release') {
    targetSeparation = 1.15; impulse = .13; $('#scene-status').textContent = 'Released'; setActiveAction('release');
    $('#feature-note').hidden = false;
    showToast(fromGesture ? 'Open hand detected — the model is released.' : 'Released into its component parts.');
  } else if (action === 'form') {
    targetSeparation = 0; impulse = .45; $('#scene-status').textContent = 'Formed'; setActiveAction('form');
    $('#feature-note').hidden = true;
    showToast(fromGesture ? 'Closed hand detected — the model is forming.' : `${model.title} brought together.`);
  } else if (action === 'snap') {
    targetSeparation = 0; impulse = .9; $('#scene-status').textContent = 'Summoned'; setActiveAction('snap');
    $('#feature-note').hidden = true;
    showToast('A little light, gathered in one place.');
    setTimeout(() => { if ($('#scene-status').textContent === 'Summoned') $('#scene-status').textContent = 'Idle'; setActiveAction('form'); }, 1100);
  }
}

$$('.dock-button').forEach((button) => button.addEventListener('click', () => runAction(button.dataset.action)));
$$('.model-option').forEach((button) => button.addEventListener('click', () => {
  modelIndex = models.findIndex((m) => m.id === button.dataset.model); updateModel(); impulse = .5; closeModelMenu(); showToast(`${models[modelIndex].title} loaded.`);
}));
const modelsButton = $('#models-menu-button');
const modelsMenu = $('#models-menu');
function closeModelMenu() { modelsMenu.hidden = true; modelsButton.setAttribute('aria-expanded', 'false'); }
modelsButton.addEventListener('click', () => { const open = modelsMenu.hidden; modelsMenu.hidden = !open; modelsButton.setAttribute('aria-expanded', String(open)); });
document.addEventListener('click', (event) => { if (!event.target.closest('.model-menu-wrap')) closeModelMenu(); });

$('#details-toggle').addEventListener('click', () => {
  const panel = $('.details-panel'); const collapsed = panel.classList.toggle('collapsed');
  $('#details-content').hidden = collapsed; $('#details-toggle').setAttribute('aria-expanded', String(!collapsed));
  $('.collapse-icon').textContent = collapsed ? '+' : '−';
});
$('#sensitivity-toggle').addEventListener('click', () => {
  sensitivityForgiving = !sensitivityForgiving;
  $('#sensitivity-toggle').classList.toggle('selected', sensitivityForgiving);
  $('#sensitivity-toggle').setAttribute('aria-pressed', String(sensitivityForgiving));
  $('#sensitivity-button').innerHTML = `${sensitivityForgiving ? 'Forgiving' : 'Standard'} <span>⌄</span>`;
  $('#sensitivity-help').textContent = sensitivityForgiving ? 'Recognizes less distinct hand poses.' : 'A little room for natural movement.';
  showToast(sensitivityForgiving ? 'More forgiving gesture sensitivity enabled.' : 'Standard gesture sensitivity restored.');
});
$('#sensitivity-button').addEventListener('click', () => $('#sensitivity-toggle').click());

canvas.addEventListener('pointerdown', (event) => { isDragging = true; lastPointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture?.(event.pointerId); $('#feature-note').hidden = true; });
canvas.addEventListener('pointermove', (event) => {
  if (!isDragging || !lastPointer) return;
  const dx = event.clientX - lastPointer.x, dy = event.clientY - lastPointer.y;
  targetYaw += dx * .008; targetPitch = Math.max(-.8, Math.min(.8, targetPitch + dy * .006)); lastPointer = { x: event.clientX, y: event.clientY };
});
const finishDrag = () => { isDragging = false; lastPointer = null; };
canvas.addEventListener('pointerup', finishDrag); canvas.addEventListener('pointercancel', finishDrag); canvas.addEventListener('lostpointercapture', finishDrag);
canvas.addEventListener('wheel', (event) => { event.preventDefault(); targetZoom = Math.max(.68, Math.min(1.5, targetZoom - Math.sign(event.deltaY) * .07)); }, { passive: false });
canvas.addEventListener('click', (event) => {
  if (Math.abs((event.clientX - lastTap.x) || 0) < 5 && performance.now() - lastTap.time < 550) return;
  lastTap = { x: event.clientX, y: event.clientY, time: performance.now() };
});
let lastTap = { x: 0, y: 0, time: 0 };
canvas.addEventListener('dblclick', () => { const note = $('#feature-note'); note.hidden = !note.hidden; if (!note.hidden) showToast('Detail card focused — point at a part when using camera.'); });

function setOpenness(value) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  $('#openness-value').innerHTML = `${percent}<span>%</span>`;
  $('#openness-meter-fill').style.width = `${percent}%`;
}
function handDistance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function updateHandTracking(result) {
  const hands = result.landmarks || [];
  const handIndicator = $('#hand-indicator');
  if (!hands.length) {
    $('#hand-status').textContent = 'No hand'; handIndicator.classList.remove('live');
    setOpenness(0); previousGesture = ''; previousHandsDistance = null;
    return;
  }
  handIndicator.classList.add('live');
  const hand = hands[0], wrist = hand[0];
  const fingerPairs = [[8, 6], [12, 10], [16, 14], [20, 18]];
  const extended = fingerPairs.map(([tip, pip]) => handDistance(hand[tip], wrist) > handDistance(hand[pip], wrist) * (sensitivityForgiving ? 1.06 : 1.18));
  const extendedCount = extended.filter(Boolean).length;
  const thumbIndex = handDistance(hand[4], hand[8]);
  const openness = Math.min(1, Math.max(0, extendedCount / 4 * .7 + Math.min(1, handDistance(hand[8], hand[20]) / .4) * .3));
  setOpenness(openness);
  const pinch = thumbIndex < (sensitivityForgiving ? .09 : .065);
  const open = extendedCount >= (sensitivityForgiving ? 3 : 4);
  const pointing = extended[0] && extendedCount === 1;
  const peace = extended[0] && extended[1] && !extended[2] && !extended[3];
  const fist = extendedCount === 0;
  let gesture = pinch ? 'Pinch' : open ? 'Open' : peace ? 'Next' : pointing ? 'Point' : fist ? 'Fist' : 'Tracking';
  $('#hand-status').textContent = gesture;
  const pointer = hand[8];
  if (gesture === 'Point') {
    targetYaw = (0.5 - pointer.x) * 1.55;
    targetPitch = Math.max(-.72, Math.min(.72, (pointer.y - .5) * .92));
    $('#feature-note').hidden = false;
  }
  if (hands.length >= 2) {
    const d = handDistance(hands[0][8], hands[1][8]);
    if (previousHandsDistance !== null) targetZoom = Math.max(.68, Math.min(1.5, targetZoom + (d - previousHandsDistance) * 2.4));
    previousHandsDistance = d;
    gesture = 'Two hands · zoom'; $('#hand-status').textContent = gesture;
  } else previousHandsDistance = null;
  const now = performance.now();
  if (gesture !== previousGesture && now > gestureCooldown) {
    if (gesture === 'Open') { runAction('release', true); gestureCooldown = now + 1400; }
    else if (gesture === 'Fist') { runAction('form', true); gestureCooldown = now + 1400; }
    else if (gesture === 'Next') { runAction('next', true); gestureCooldown = now + 1700; }
    else if (gesture === 'Pinch') { targetSeparation = .55; $('#scene-status').textContent = 'Part isolated'; $('#feature-note').hidden = false; showToast('Pinch detected — a detail is pulled into focus.'); gestureCooldown = now + 1500; }
  }
  previousGesture = gesture;
}

async function startCamera() {
  if (cameraStarted) { showToast('Camera tracking is already active.'); return; }
  if (!navigator.mediaDevices?.getUserMedia) { cameraFallback('This browser does not offer camera access here.'); return; }
  $('#camera-top-button').disabled = true; $('#camera-top-button').querySelector('span:last-child').textContent = 'Starting…';
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    const video = $('#camera-video'); video.srcObject = cameraStream; await video.play();
    $('#camera-preview').hidden = false;
    $('#scene-status').textContent = 'Camera ready'; $('#mode-status').textContent = 'Camera · on-device';
    $('#hand-status').textContent = 'Loading tracker';
    showToast('Camera is on this device only. Loading the local hand tracker…');
    const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22');
    const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
    const modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
    const options = { runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .55, minHandPresenceConfidence: .5, minTrackingConfidence: .48 };
    try {
      handLandmarker = await vision.HandLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath, delegate: 'GPU' } });
    } catch (gpuError) {
      console.info('GPU hand tracking unavailable; retrying with on-device CPU inference.', gpuError);
      handLandmarker = await vision.HandLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath, delegate: 'CPU' } });
    }
    cameraStarted = true;
    $('#scene-status').textContent = 'Tracking'; $('#mode-status').textContent = 'Camera · on-device';
    $('#camera-top-button').querySelector('span:last-child').textContent = 'Camera live';
    $('#scene-indicator').classList.add('live');
    showToast('Hand tracking is live. Video stays in this browser tab.');
    trackingFrame = requestAnimationFrame(trackHands);
  } catch (error) {
    console.warn('On-device camera setup was unavailable:', error);
    cameraFallback(error?.name === 'NotAllowedError' ? 'Camera permission was declined. Continue with manual controls.' : 'Hand tracking could not start. Continue with manual controls.');
  }
}
function trackHands() {
  if (!cameraStarted || !handLandmarker) return;
  const video = $('#camera-video');
  if (video.readyState >= 2) {
    const result = handLandmarker.detectForVideo(video, performance.now());
    updateHandTracking(result);
  }
  trackingFrame = requestAnimationFrame(trackHands);
}
function cameraFallback(message) {
  cameraStarted = false;
  if (cameraStream) { cameraStream.getTracks().forEach((track) => track.stop()); cameraStream = null; }
  if (handLandmarker) { handLandmarker.close(); handLandmarker = null; }
  cancelAnimationFrame(trackingFrame);
  $('#camera-preview').hidden = true; $('#camera-top-button').disabled = false;
  $('#camera-top-button').querySelector('span:last-child').textContent = 'Use camera';
  $('#scene-status').textContent = 'Idle · manual'; $('#hand-status').textContent = 'No hand';
  $('#mode-status').textContent = 'Manual'; $('#scene-indicator').classList.remove('live'); $('#hand-indicator').classList.remove('live');
  setOpenness(0); showToast(message);
}
$('#start-camera').addEventListener('click', startCamera);
$('#camera-top-button').addEventListener('click', startCamera);
$('#camera-close').addEventListener('click', () => { cameraFallback('Camera off. Your model is ready for manual exploration.'); });
$('#continue-manual').addEventListener('click', () => { if (cameraStarted) cameraFallback('Camera off. Continuing in manual mode.'); else showToast('Manual mode ready — drag to rotate, scroll to zoom.'); $('#mode-status').textContent = 'Manual'; });
window.addEventListener('beforeunload', () => { if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop()); });
window.addEventListener('resize', resize);

resize(); updateModel(); requestAnimationFrame(render);
