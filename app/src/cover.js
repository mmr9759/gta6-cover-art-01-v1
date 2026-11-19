// Vice Lights Cover Studio — draws the GTA-poster-style cover onto a canvas.
// One photo or several, split across comic-style panels, washed in a Vice City sunset
// or neon colour grade, with a big condensed caption across the foot. Everything is
// drawn with the 2D canvas API; no image leaves the machine.

export const LAYOUTS = {
  hero: {
    label: 'Hero',
    hint: 'One big photo, title across the foot',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
    band: 0.3,
  },
  duo: {
    label: 'Duo',
    hint: 'Hero shot beside a second moment',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.63, y: 0, w: 0.37, h: 1 },
    ],
    band: 0.3,
  },
  comic5: {
    label: 'Comic 5',
    hint: 'Five panels, key-art comic page',
    panels: [
      { x: 0, y: 0, w: 0.55, h: 0.66 },
      { x: 0.56, y: 0, w: 0.44, h: 0.325 },
      { x: 0.56, y: 0.335, w: 0.44, h: 0.325 },
      { x: 0, y: 0.67, w: 0.49, h: 0.33 },
      { x: 0.5, y: 0.67, w: 0.5, h: 0.33 },
    ],
    band: 0.28,
  },
  grid4: {
    label: 'Grid 4',
    hint: 'Four equal moments',
    panels: [
      { x: 0, y: 0, w: 0.495, h: 0.495 },
      { x: 0.505, y: 0, w: 0.495, h: 0.495 },
      { x: 0, y: 0.505, w: 0.495, h: 0.495 },
      { x: 0.505, y: 0.505, w: 0.495, h: 0.495 },
    ],
    band: 0.26,
  },
  triptych: {
    label: 'Triptych',
    hint: 'Three tall panels, film-strip feel',
    panels: [
      { x: 0, y: 0, w: 0.326, h: 1 },
      { x: 0.337, y: 0, w: 0.326, h: 1 },
      { x: 0.674, y: 0, w: 0.326, h: 1 },
    ],
    band: 0.3,
  },
  grid9: {
    label: 'Grid 9',
    hint: 'Nine panels, a whole night out',
    panels: [
      { x: 0, y: 0, w: 0.326, h: 0.326 },
      { x: 0.337, y: 0, w: 0.326, h: 0.326 },
      { x: 0.674, y: 0, w: 0.326, h: 0.326 },
      { x: 0, y: 0.337, w: 0.326, h: 0.326 },
      { x: 0.337, y: 0.337, w: 0.326, h: 0.326 },
      { x: 0.674, y: 0.337, w: 0.326, h: 0.326 },
      { x: 0, y: 0.674, w: 0.326, h: 0.326 },
      { x: 0.337, y: 0.674, w: 0.326, h: 0.326 },
      { x: 0.674, y: 0.674, w: 0.326, h: 0.326 },
    ],
    band: 0.24,
  },
};

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    top: '#ff9a3d', bottom: '#c22a7a', tint: '#ff5e62', glow: '#ffb347',
    accent: '#ffd166', sky: '#2b1055', swatch: 'linear-gradient(135deg,#ff9a3d,#c22a7a)',
  },
  neon: {
    label: 'Neon Nights',
    top: '#00e5ff', bottom: '#ff2ea6', tint: '#7b2fff', glow: '#00e5ff',
    accent: '#00f0ff', sky: '#0b1035', swatch: 'linear-gradient(135deg,#00e5ff,#ff2ea6)',
  },
  coral: {
    label: 'Coral Coast',
    top: '#2ec4b6', bottom: '#ff6b6b', tint: '#ff8e72', glow: '#7ef0e0',
    accent: '#ffe66d', sky: '#073b4c', swatch: 'linear-gradient(135deg,#2ec4b6,#ff6b6b)',
  },
  heatwave: {
    label: 'Heatwave',
    top: '#ffb703', bottom: '#e63946', tint: '#fb8500', glow: '#ffd60a',
    accent: '#ffea00', sky: '#3d0c02', swatch: 'linear-gradient(135deg,#ffb703,#e63946)',
  },
  midnight: {
    label: 'Midnight Palm',
    top: '#4361ee', bottom: '#7209b7', tint: '#4cc9f0', glow: '#4895ef',
    accent: '#f72585', sky: '#10002b', swatch: 'linear-gradient(135deg,#4361ee,#7209b7)',
  },
  gold: {
    label: 'Golden Hour',
    top: '#ffd60a', bottom: '#ff7b00', tint: '#ffaa00', glow: '#ffe66d',
    accent: '#fff3b0', sky: '#3d2600', swatch: 'linear-gradient(135deg,#ffd60a,#ff7b00)',
  },
};

export const TITLE_STYLES = {
  solid: { label: 'Solid' },
  outline: { label: 'Outline' },
  halftone: { label: 'Halftone dots' },
};

/** The fallback cover state: two sample photos, hero layout, sunset grade. */
export function defaultState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'VICE LIGHTS • EST. 2026',
    tagline: 'One last ride down the coast.',
    titleStyle: 'solid',
    photos: [],
    panels: [{ photo: 0, zoom: 1, ox: 0, oy: 0, flip: false }],
  };
}

/** Panels for a layout, each with a photo slot (photo index, zoom, offsets, flip). */
export function panelsFor(layoutId, keep) {
  const count = LAYOUTS[layoutId].panels.length;
  const out = [];
  for (let i = 0; i < count; i++) {
    const old = keep && keep[i];
    out.push(old ? { ...old } : { photo: i % 2, zoom: 1, ox: 0, oy: 0, flip: false });
  }
  return out;
}

/** Cover-fits one photo into a panel rect, honouring zoom, offsets and flip. */
function drawPhotoInto(ctx, img, rect, panel) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const pw = iw * scale;
  const ph = ih * scale;
  let dx = rect.x + (rect.w - pw) / 2 + panel.ox * rect.w;
  let dy = rect.y + (rect.h - ph) / 2 + panel.oy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (panel.flip) {
    ctx.translate(rect.x + rect.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(rect.x + rect.w / 2), 0);
    dx = rect.x + rect.w - (dx - rect.x) - pw;
  }
  try { ctx.filter = 'saturate(1.3) contrast(1.06)'; } catch { /* older canvas */ }
  ctx.drawImage(img, dx, dy, pw, ph);
  try { ctx.filter = 'none'; } catch { /* older canvas */ }
  ctx.restore();
}

/** Washes a panel rect in the grade: sunset gradient, soft tint, sky glow, vignette. */
function gradePanel(ctx, rect, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // Hue pass: pulls the whole photo toward the grade's colour.
  ctx.globalCompositeOperation = 'color';
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = grade.tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // Warm foot: the grade's deep colour rising from the bottom.
  ctx.globalCompositeOperation = 'multiply';
  const foot = ctx.createLinearGradient(rect.x, rect.y + rect.h * 0.55, rect.x, rect.y + rect.h);
  foot.addColorStop(0, 'rgba(255,255,255,1)');
  foot.addColorStop(1, grade.bottom);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = foot;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.22;
  const glow = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y, 10,
    rect.x + rect.w / 2, rect.y, Math.max(rect.w, rect.h) * 0.75,
  );
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

/** A retro sliced sun, drawn inside a panel rect (top-right corner). */
function drawRetroSun(ctx, rect, grade) {
  const r = Math.min(rect.w, rect.h) * 0.1;
  const cx = rect.x + rect.w - r * 1.25;
  const cy = rect.y + r * 1.35;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const sun = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  sun.addColorStop(0, '#ffe66d');
  sun.addColorStop(0.55, grade.top);
  sun.addColorStop(1, grade.bottom);
  ctx.fillStyle = sun;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 4; i++) {
    const y = cy + r * (0.05 + i * 0.22);
    ctx.fillRect(cx - r, y, r * 2, r * 0.09);
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Halftone dot pattern, tile size in px. */
function halftonePattern(ctx, size, color) {
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const t = tile.getContext('2d');
  t.fillStyle = color;
  t.beginPath();
  t.arc(size / 2, size / 2, size * 0.32, 0, Math.PI * 2);
  t.fill();
  return ctx.createPattern(tile, 'repeat');
}

/** The caption block: accent rule, subtitle, big condensed title, tagline.
 *  The title's font size is fitted to BOTH the width and the height left between
 *  the subtitle and the tagline, so nothing is ever clipped at the foot. */
function drawCaption(ctx, w, h, state, grade) {
  const layout = LAYOUTS[state.layout];
  const bandH = h * layout.band;
  const bandY = h - bandH;
  const shade = ctx.createLinearGradient(0, bandY - h * 0.1, 0, h);
  shade.addColorStop(0, 'rgba(10,3,22,0)');
  shade.addColorStop(0.45, 'rgba(10,3,22,0.62)');
  shade.addColorStop(1, 'rgba(10,3,22,0.9)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, bandY - h * 0.1, w, bandH + h * 0.1);

  const pad = w * 0.045;
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const tagline = (state.tagline || '').trim();
  const subSize = Math.max(10, h * 0.021);
  const tagSize = Math.max(10, h * 0.02);

  // Accent rule above the subtitle.
  const ruleY = bandY + bandH * 0.09;
  ctx.fillStyle = grade.accent;
  ctx.fillRect(pad, ruleY, w * 0.16, Math.max(3, h * 0.006));

  // Subtitle, then the title zone, then the tagline pinned to the foot.
  let top = ruleY + subSize * 1.7;
  if (subtitle) {
    ctx.font = `700 ${subSize}px 'Anton', 'Arial Narrow', sans-serif`;
    try { ctx.letterSpacing = `${subSize * 0.32}px`; } catch { /* older canvas */ }
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(subtitle, pad, top);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
    top += subSize * 0.9;
  }
  const tagBaseline = h - h * 0.03;
  const tagTop = tagline ? tagBaseline - tagSize * 1.5 : h - h * 0.01;
  const zoneTop = top;
  const zoneH = Math.max(20, tagTop - zoneTop - h * 0.01);

  if (title) {
    const availW = w - pad * 2;
    const measure = (s) => {
      ctx.font = `${s}px 'Anton', 'Arial Narrow', sans-serif`;
      return ctx.measureText(title).width * 0.86;
    };
    // Anton's cap height is ~0.72em, so the font size may fill the zone.
    let size = Math.min(zoneH * 1.15, h * 0.22);
    while (size > 12 && measure(size) > availW) size -= 2;
    const textCanvas = document.createElement('canvas');
    textCanvas.width = w;
    textCanvas.height = h;
    const t = textCanvas.getContext('2d');
    t.translate(w / 2, zoneTop + zoneH / 2);
    t.rotate(-0.02);
    t.scale(0.86, 1);
    t.font = `${size}px 'Anton', 'Arial Narrow', sans-serif`;
    t.textAlign = 'center';
    t.textBaseline = 'middle';
    if (state.titleStyle === 'outline') {
      t.lineWidth = Math.max(2, size * 0.07);
      t.strokeStyle = '#ffffff';
      t.lineJoin = 'round';
      t.strokeText(title, 0, 0);
      t.globalAlpha = 0.25;
      t.fillStyle = grade.bottom;
      t.fillText(title, 0, 0);
      t.globalAlpha = 1;
    } else if (state.titleStyle === 'halftone') {
      t.fillStyle = '#ffffff';
      t.fillText(title, 0, 0);
      t.globalCompositeOperation = 'source-in';
      t.fillStyle = halftonePattern(t, Math.max(5, size * 0.09), grade.accent);
      t.fillRect(-w / 2, -h / 2, w, h);
      t.globalCompositeOperation = 'source-over';
    } else {
      t.shadowColor = 'rgba(0,0,0,0.55)';
      t.shadowBlur = size * 0.16;
      t.shadowOffsetY = size * 0.05;
      t.fillStyle = '#ffffff';
      t.fillText(title, 0, 0);
      t.shadowBlur = 0;
      t.shadowOffsetY = 0;
    }
    ctx.drawImage(textCanvas, 0, 0);
  }

  if (tagline) {
    ctx.font = `italic 600 ${tagSize}px Georgia, serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(tagline, pad, tagBaseline);
  }
}

/**
 * Draws the whole cover onto `canvas` at its own pixel size.
 * `state`: { layout, grade, title, subtitle, tagline, titleStyle, photos, panels }.
 * `photos` are HTMLImageElements (or null slots); `panels[i]` maps to layout panel i.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = LAYOUTS[state.layout] || LAYOUTS.hero;
  const grade = GRADES[state.grade] || GRADES.sunset;

  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, w, h);

  const rects = layout.panels.map((p) => ({
    x: p.x * w, y: p.y * h, w: p.w * w, h: p.h * h,
  }));
  let biggest = rects[0];
  for (const r of rects) if (r.w * r.h > biggest.w * biggest.h) biggest = r;

  rects.forEach((rect, i) => {
    const panel = (state.panels && state.panels[i]) || { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false };
    const img = state.photos[panel.photo];
    if (img) drawPhotoInto(ctx, img, rect, panel);
    else {
      ctx.fillStyle = grade.sky;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    gradePanel(ctx, rect, grade);
    // Thin white keyline around every panel, comic-page style.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  // Retro sun lives on the biggest panel only, when it dominates the cover.
  if (biggest.w * biggest.h > w * h * 0.4) drawRetroSun(ctx, biggest, grade);

  drawCaption(ctx, w, h, state, grade);
}
