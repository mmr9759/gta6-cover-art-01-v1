// Fixed scenes for screenshots: ?shot=editor shows the page with a sample photo loaded;
// ?shot=cover shows the finished cover alone, at the export size the query names.
// `layout`, `grade`, `caption`, `subtitle`, `tagline`, `style` and `size` pick the scene;
// `photo` (0 = pier, 1 = boulevard) fills every panel. window.__shotReady is set once
// the cover has painted, so a headless browser can wait on it.
export async function runShot(shot, query, api) {
  const layout = query.get('layout') || 'comic5';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || (shot === 'cover' ? '1920x1080' : '1080x1350');
  const photo = Number(query.get('photo') || '0');
  // `photos=0,1,0` fills panels with different photos (cycles if shorter).
  const photoList = query.get('photos')
    ? query.get('photos').split(',').map((s) => Number(s) || 0)
    : null;

  api.setLayout(layout);
  api.setGrade(grade);
  api.setTitle(query.get('caption') || 'Sunset Heist');
  if (query.get('subtitle')) api.setSubtitle(query.get('subtitle'));
  if (query.get('tagline')) api.setTagline(query.get('tagline'));
  if (query.get('style')) api.setTitleStyle(query.get('style'));
  api.state.panels = api.state.panels.map((p, i) => ({
    ...p,
    photo: photoList ? photoList[i % photoList.length] : photo,
  }));

  const sizeSelect = document.getElementById('exportSize');
  sizeSelect.value = size;
  api.applyAspect();
  api.redraw();

  if (shot === 'cover') document.body.classList.add('shot-cover');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
