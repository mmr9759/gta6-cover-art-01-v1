// Vice Lights Cover Studio — wires the editor page: load photos, pick a layout and a
// grade, crop and position each panel, edit the caption, export the cover as a PNG in
// the common post sizes. A `?shot=` query sets up a fixed scene for a screenshot
// instead (./shots.js). Photos are read on this machine and never uploaded.
import { drawCover, defaultState, panelsFor, LAYOUTS, GRADES, TITLE_STYLES } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const state = defaultState();
let selectedPanel = 0;
let photos = []; // HTMLImageElements, in load order; slots 0 and 1 are the samples.

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Rebuilds the photo picker options from the photos actually loaded. */
function renderPhotoOptions() {
  const sel = $('panelPhoto');
  sel.innerHTML = '';
  photos.forEach((img, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = i === 0 ? 'Photo 1 — Pier sample'
      : i === 1 ? 'Photo 2 — Boulevard sample'
      : `Photo ${i + 1} — uploaded`;
    sel.appendChild(opt);
  });
  const panel = state.panels[selectedPanel];
  if (panel) sel.value = String(panel.photo);
}

/** Redraws the live preview from the current state. */
function redraw() {
  state.photos = photos;
  drawCover(preview, state);
  renderPhotoOptions();
  syncPanelControls();
}

/** Fits the preview canvas to its box while keeping the export aspect. */
function fitPreview() {
  const box = preview.parentElement.getBoundingClientRect();
  const ratio = preview.width / preview.height;
  let w = box.width;
  let h = w / ratio;
  if (h > box.height) {
    h = box.height;
    w = h * ratio;
  }
  preview.style.width = `${Math.max(120, w)}px`;
  preview.style.height = `${Math.max(120, h)}px`;
}

function setStatus(text) {
  $('status').textContent = text;
}

function renderLayoutButtons() {
  const box = $('layouts');
  box.innerHTML = '';
  for (const [id, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn' + (state.layout === id ? ' active' : '');
    b.title = def.hint;
    b.setAttribute('aria-pressed', state.layout === id ? 'true' : 'false');
    const mini = document.createElement('span');
    mini.className = 'mini';
    for (const p of def.panels) {
      const cell = document.createElement('i');
      cell.style.left = `${p.x * 100}%`;
      cell.style.top = `${p.y * 100}%`;
      cell.style.width = `${p.w * 100}%`;
      cell.style.height = `${p.h * 100}%`;
      mini.appendChild(cell);
    }
    b.appendChild(mini);
    const label = document.createElement('span');
    label.textContent = def.label;
    b.appendChild(label);
    b.addEventListener('click', () => {
      state.layout = id;
      state.panels = panelsFor(id, state.panels);
      selectedPanel = 0;
      renderLayoutButtons();
      renderPanelList();
      applyAspect();
      redraw();
    });
    box.appendChild(b);
  }
}

function renderGradeButtons() {
  const box = $('grades');
  box.innerHTML = '';
  for (const [id, def] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-btn' + (state.grade === id ? ' active' : '');
    b.style.background = def.swatch;
    b.setAttribute('aria-pressed', state.grade === id ? 'true' : 'false');
    const label = document.createElement('span');
    label.textContent = def.label;
    b.appendChild(label);
    b.addEventListener('click', () => {
      state.grade = id;
      renderGradeButtons();
      redraw();
    });
    box.appendChild(b);
  }
}

function renderTitleStyles() {
  const box = $('titleStyles');
  box.innerHTML = '';
  for (const [id, def] of Object.entries(TITLE_STYLES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.titleStyle === id ? ' active' : '');
    b.textContent = def.label;
    b.addEventListener('click', () => {
      state.titleStyle = id;
      renderTitleStyles();
      redraw();
    });
    box.appendChild(b);
  }
}

/** The panel list: one row per panel, click to select it for crop controls. */
function renderPanelList() {
  const box = $('panelList');
  box.innerHTML = '';
  state.panels.forEach((panel, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'panel-row' + (selectedPanel === i ? ' active' : '');
    b.textContent = `Panel ${i + 1} — photo ${panel.photo + 1}`;
    b.addEventListener('click', () => {
      selectedPanel = i;
      renderPanelList();
      syncPanelControls();
    });
    box.appendChild(b);
  });
}

/** Pushes the selected panel's crop values into the sliders. */
function syncPanelControls() {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  $('panelPhoto').value = String(panel.photo);
  $('panelZoom').value = String(panel.zoom);
  $('panelZoomVal').textContent = `${Math.round(panel.zoom * 100)}%`;
  $('panelX').value = String(panel.ox);
  $('panelY').value = String(panel.oy);
  $('panelFlip').checked = panel.flip;
  document.querySelectorAll('.panel-row').forEach((row, i) => {
    row.classList.toggle('active', i === selectedPanel);
  });
}

/** Renders the cover at full export resolution and downloads it as a PNG. */
function exportCover(w, h, name) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, { ...state, photos });
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve();
    }, 'image/png');
  });
}

async function exportAllSizes() {
  const stamp = Date.now();
  const jobs = [
    [1080, 1080, `vice-lights-${stamp}-1080x1080.png`],
    [1080, 1350, `vice-lights-${stamp}-1080x1350.png`],
    [1920, 1080, `vice-lights-${stamp}-1920x1080.png`],
  ];
  for (const [w, h, name] of jobs) await exportCover(w, h, name);
  setStatus(`Saved 3 PNGs — 1080×1080, 1080×1350, 1920×1080.`);
}

/** Switches the preview canvas between the three post sizes. */
function applyAspect() {
  const size = $('exportSize').value;
  const [w, h] = size.split('x').map(Number);
  preview.width = w;
  preview.height = h;
  fitPreview();
  redraw();
}

/** Adds uploaded files as photos (slots 2, 3, 4, …). */
async function addFiles(files) {
  let added = 0;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    if (photos.length >= 6) break;
    photos.push(await loadImage(URL.createObjectURL(file)));
    added += 1;
  }
  if (added) {
    state.panels = state.panels.map((p) => ({ ...p }));
    renderPanelList();
    redraw();
    setStatus(`Added ${added} photo${added > 1 ? 's' : ''} — pick a panel, then choose its photo.`);
  }
}

/** Surprise me: a random layout, grade and title style. */
function surpriseMe() {
  const layouts = Object.keys(LAYOUTS);
  const grades = Object.keys(GRADES);
  const styles = Object.keys(TITLE_STYLES);
  state.layout = layouts[Math.floor(Math.random() * layouts.length)];
  state.grade = grades[Math.floor(Math.random() * grades.length)];
  state.titleStyle = styles[Math.floor(Math.random() * styles.length)];
  state.panels = panelsFor(state.layout, state.panels);
  selectedPanel = 0;
  renderLayoutButtons();
  renderGradeButtons();
  renderTitleStyles();
  renderPanelList();
  applyAspect();
  setStatus('Surprise! A fresh layout, grade and lettering.');
}

$('photoInput').addEventListener('change', (e) => addFiles([...e.target.files]));
$('samplePier').addEventListener('click', () => useSample(0));
$('sampleBoulevard').addEventListener('click', () => useSample(1));
$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('panelPhoto').addEventListener('change', (e) => {
  state.panels[selectedPanel].photo = Number(e.target.value);
  renderPanelList();
  redraw();
});
$('panelZoom').addEventListener('input', (e) => {
  state.panels[selectedPanel].zoom = Number(e.target.value);
  syncPanelControls();
  redraw();
});
$('panelX').addEventListener('input', (e) => {
  state.panels[selectedPanel].ox = Number(e.target.value);
  redraw();
});
$('panelY').addEventListener('input', (e) => {
  state.panels[selectedPanel].oy = Number(e.target.value);
  redraw();
});
$('panelFlip').addEventListener('change', (e) => {
  state.panels[selectedPanel].flip = e.target.checked;
  redraw();
});
$('exportSize').addEventListener('change', applyAspect);
$('exportOne').addEventListener('click', async () => {
  const [w, h] = $('exportSize').value.split('x').map(Number);
  await exportCover(w, h, `vice-lights-${Date.now()}-${w}x${h}.png`);
  setStatus(`Saved vice-lights-${w}x${h}.png`);
});
$('exportAll').addEventListener('click', exportAllSizes);
$('surprise').addEventListener('click', surpriseMe);
window.addEventListener('resize', fitPreview);

/** Fills every panel with one sample photo (slots 0 = pier, 1 = boulevard). */
async function useSample(slot) {
  state.panels = state.panels.map((p) => ({ ...p, photo: slot }));
  renderPanelList();
  redraw();
  setStatus(slot === 0 ? 'Pier photo in every panel.' : 'Boulevard photo in every panel.');
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  // Screenshot mode: wait for the Anton font, load the samples, then stage the scene.
  document.fonts.load(`80px 'Anton'`).catch(() => {});
  await document.fonts.ready;
  photos = [await loadImage('samples/pier.jpg'), await loadImage('samples/boulevard.jpg')];
  runShot(shot, new URLSearchParams(location.search), {
    state, photos, applyAspect, redraw,
    setLayout: (id) => {
      state.layout = id;
      state.panels = panelsFor(id, state.panels);
      renderLayoutButtons();
      renderPanelList();
    },
    setGrade: (id) => { state.grade = id; renderGradeButtons(); },
    setTitle: (text) => { state.title = text; $('title').value = text; },
    setSubtitle: (text) => { state.subtitle = text; $('subtitle').value = text; },
    setTagline: (text) => { state.tagline = text; $('tagline').value = text; },
    setTitleStyle: (id) => { state.titleStyle = id; renderTitleStyles(); },
  });
} else {
  document.fonts.load(`80px 'Anton'`).catch(() => {});
  renderLayoutButtons();
  renderGradeButtons();
  renderTitleStyles();
  renderPanelList();
  photos = [await loadImage('samples/pier.jpg'), await loadImage('samples/boulevard.jpg')];
  applyAspect();
  setStatus('Sample photos loaded — drop in your own photos to start.');
  document.fonts.ready.then(() => redraw());
}
