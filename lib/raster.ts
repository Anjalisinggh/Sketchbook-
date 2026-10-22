// SVG filters are expensive to repaint, so each drawing is painted once into a
// high-resolution bitmap; the page, the page turns and the loupe all reuse it.
// Plates are opaque (paper baked in) so they can use JPEG, which encodes far
// faster than WebP/PNG at this size; transparent botanicals stay PNG.

const toURL = (svg: string) => URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

let grain: Promise<HTMLImageElement> | null = null;
function paperGrain() {
  grain ??= (async () => {
    const css = getComputedStyle(document.documentElement).getPropertyValue("--noise").trim();
    const im = new Image();
    im.src = css.slice(5, -2); // strip url(" … ")
    await im.decode();
    return im;
  })();
  return grain;
}

async function rasterize(svg: string, w: number, h: number, scale: number, paper?: string) {
  const src = toURL(svg);
  const im = new Image();
  im.src = src;
  await im.decode();
  try {
    const c = document.createElement("canvas");
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    const g = c.getContext("2d")!;
    if (paper) {
      g.fillStyle = paper;
      g.fillRect(0, 0, c.width, c.height);
      try {
        g.fillStyle = g.createPattern(await paperGrain(), "repeat")!;
        g.fillRect(0, 0, c.width, c.height);
      } catch {}
    }
    g.drawImage(im, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob>((res, rej) =>
      c.toBlob((b) => (b ? res(b) : rej()), paper ? "image/jpeg" : "image/png", 0.9),
    );
    URL.revokeObjectURL(src);
    return URL.createObjectURL(blob);
  } catch {
    return src;
  }
}

// One queue for the whole page, so drawings are painted one at a time in the
// order they were asked for; results are cached by key (effects may run twice).
let queue: Promise<unknown> = Promise.resolve();
const cache = new Map<string, Promise<string>>();

export function rasterOnce(key: string, draw: () => string, w: number, h: number, scale: number, paper?: string) {
  let p = cache.get(key);
  if (!p) {
    p = queue.then(() => rasterize(draw(), w, h, scale, paper));
    queue = p.catch(() => {});
    cache.set(key, p);
  }
  return p;
}
