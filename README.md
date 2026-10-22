# Sketchbook-

A tactile sketchbook portfolio built with Next.js: ink-and-watercolour plates you can turn by hand, a draggable magnifying glass with zoom, and a botanical paper backdrop.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How it's put together

- `app/` — layout (fonts via `next/font`), page and global styles.
- `components/Sketchbook.tsx` — the book: page turns (drag, flick, click, arrows, ← →), pointer tilt, the loupe and the index of plates.
- `components/Botanicals.tsx` — the faded ferns and orchid in the background.
- `lib/sketch.js` — generates every drawing as SVG (seeded, so they're the same on each load).
- `lib/raster.ts` — paints each drawing once into a high-resolution bitmap so dragging the glass and turning pages stay smooth.
