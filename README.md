# Vice Lights Cover Studio

A web app that turns a person's photo and a caption into cover art in the
style of GTA 6's posters — multi-panel key art, bold condensed lettering, and
a Vice City sunset or neon colour grade — exported as a PNG to share.

Built for the make.fun bounty **gta6-cover-art-01** ("Make GTA 6 Cover Art").

## What it does

- **Any photo**: load your own photos (or use the two built-in samples), fill
  one panel or several, crop and position each panel, zoom, move and flip.
- **6 layouts**: Hero, Duo, Comic 5, Grid 4, Triptych, Grid 9 — comic-page
  panels with white keylines, a retro sliced sun and palm silhouettes.
- **6 colour grades**: Vice Sunset, Neon Nights, Coral Coast, Heatwave,
  Midnight Palm, Golden Hour.
- **Caption**: editable title, subtitle and tagline; title lettering in
  Solid, Outline or Halftone-dot styles, set in Anton (SIL OFL).
- **Fast export**: one click exports 1080×1080, 1080×1350 and 1920×1080 PNGs
  at once. Photos never leave the machine; the app works fully offline.

## Try it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

Open the page, add a photo, pick a layout and a grade, type a caption, and
export. `?shot=cover` / `?shot=editor` stage fixed scenes for screenshots
(see `shots.json`).

## Entry

`main.ts` (Node 22) copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json` with the vendored make.fun library
(`vendor/makefun-app.ts`, copied from the kit unchanged).

## License

MIT. The Anton font in `app/fonts/` is under the SIL Open Font License 1.1
(see `app/fonts/OFL.txt`). The sample photos in `app/samples/` were made for
make.fun with an image model and are free to use. No Rockstar Games logo,
artwork or font is used anywhere.
