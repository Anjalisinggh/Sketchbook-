"use client";

import { useEffect, useRef, useState } from "react";
import { plates, esc } from "@/lib/sketch";
import { rasterOnce } from "@/lib/raster";

const f = (n: number) => n.toFixed(1);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const Z_MIN = 1.5;
const Z_MAX = 4;
const pad = (n: number) => String(n).padStart(2, "0");

type Engine = { go: (to: number) => void; zoomBy: (d: number) => void };

/**
 * The open book: page turns (animated or dragged by hand), pointer tilt and the
 * magnifying glass. The page-turn and loupe internals run imperatively on refs —
 * they update every animation frame, which is no place for React re-renders —
 * while captions, dots, zoom readout and the index are ordinary React state.
 */
export default function Sketchbook() {
  const [urls, setUrls] = useState<(string | null)[]>(() => plates.map(() => null));
  const [shown, setShown] = useState(0);
  const [capOut, setCapOut] = useState(false);
  const [zoom, setZoom] = useState(2.2);
  const [zooming, setZooming] = useState(false);
  const [ready, setReady] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);
  const pageLRef = useRef<HTMLDivElement>(null);
  const pageRRef = useRef<HTMLDivElement>(null);
  const castLRef = useRef<HTMLDivElement>(null);
  const castRRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const magRef = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);

  useEffect(() => {
    const stage = stageRef.current!, book = bookRef.current!, tilt = tiltRef.current!, spread = spreadRef.current!;
    const pageL = pageLRef.current!, pageR = pageRRef.current!, castL = castLRef.current!, castR = castRRef.current!;
    const loupe = loupeRef.current!, mag = magRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Document, type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() => el.removeEventListener(type, fn as EventListener, opts));
    };
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => !disposed && fn(), ms);
      cleanups.push(() => clearTimeout(t));
    };

    /* ---------- plates ---------- */
    const local: (string | null)[] = plates.map(() => null);
    const readyP = plates.map((p, i) =>
      rasterOnce("plate-" + i, () => p.fn(p), 1400, 760, 2.4, "#f8f3e8").then((u) => {
        local[i] = u;
        if (!disposed) setUrls((prev) => prev.map((v, k) => (k === i ? u : v)));
      }),
    );

    let cur = 0, busy = false, queued: number | null = null;
    const art = (i: number, side: "l" | "r") =>
      `<div class="art ${side}"><img src="${local[i]}" alt="${side === "l" ? esc(plates[i].title) : ""}" draggable="false"></div>`;
    const setHalf = (page: HTMLElement, i: number, side: "l" | "r") => { page.innerHTML = art(i, side); };

    const setCaption = (i: number) => {
      setCapOut(true);
      later(() => { setShown(i); setCapOut(false); }, 360);
    };

    /* ---------- page turning ---------- */
    type Leaf = { set: (v: number) => void; settle: (target: 0 | 1, dur?: number, curve?: (t: number) => number) => void; readonly e: number };

    // Lifts a leaf off the book and returns a handle that can either be animated
    // (arrows, keys, clicks) or driven by the pointer (dragging the page).
    function liftLeaf(to: number): Leaf | null {
      if (busy || to === cur || to < 0 || to >= plates.length) return null;
      busy = true;
      const fwd = to > cur, from = cur;
      const leaf = document.createElement("div");
      leaf.className = "leaf " + (fwd ? "fwd" : "bwd");
      leaf.innerHTML =
        `<div class="face front sheet">${art(from, fwd ? "r" : "l")}<div class="fshade"></div></div>` +
        `<div class="face backf sheet">${art(to, fwd ? "l" : "r")}<div class="fshade"></div></div>`;
      tilt.appendChild(leaf);
      setHalf(fwd ? pageR : pageL, to, fwd ? "r" : "l");
      const fs = leaf.querySelector<HTMLElement>(".front .fshade")!, bs = leaf.querySelector<HTMLElement>(".backf .fshade")!;
      let e = 0, raf = 0;
      const set = (v: number) => {
        e = Math.max(0, Math.min(1, v));
        const lift = Math.sin(e * Math.PI), ang = (fwd ? -180 : 180) * e;
        // a little lift and droop sells the paper curl
        leaf.style.transform = `translateZ(${f(lift * 18)}px) rotateY(${f(ang)}deg) skewY(${f((fwd ? 1 : -1) * lift * -1.6)}deg) scaleX(${f(1 - lift * 0.06)})`;
        fs.style.opacity = String(Math.min(0.9, e * 1.6));
        bs.style.opacity = String(Math.min(0.9, (1 - e) * 1.6));
        (fwd ? castR : castL).style.opacity = String(e < 0.5 ? lift * 0.7 : 0);
        (fwd ? castL : castR).style.opacity = String(e >= 0.5 ? lift * 0.7 : 0);
      };
      const finish = (done: boolean) => {
        if (done) { setHalf(fwd ? pageL : pageR, to, fwd ? "l" : "r"); cur = to; }
        else setHalf(fwd ? pageR : pageL, from, fwd ? "r" : "l");
        leaf.remove();
        castL.style.opacity = castR.style.opacity = "0";
        busy = false;
        refreshMag();
        if (queued !== null) { const q = queued; queued = null; go(q); }
      };
      // tween from wherever the leaf is now to fully turned (1) or back flat (0)
      const settle: Leaf["settle"] = (target, dur, curve = ease) => {
        cancelAnimationFrame(raf);
        const e0 = e, t0 = performance.now(), d = dur ?? Math.max(220, Math.abs(target - e0) * 1050);
        const frame = (now: number) => {
          if (disposed) return;
          const t = Math.min(1, (now - t0) / d);
          set(e0 + (target - e0) * curve(t));
          if (t < 1) raf = requestAnimationFrame(frame);
          else finish(target === 1);
        };
        raf = requestAnimationFrame(frame);
      };
      refreshMag();
      set(0);
      return { set, settle, get e() { return e; } };
    }

    function turn(to: number) {
      if (reduce) {
        if (busy || to === cur) return;
        setHalf(pageL, to, "l"); setHalf(pageR, to, "r"); cur = to; setCaption(to); refreshMag();
        return;
      }
      const c = liftLeaf(to);
      if (!c) return;
      setCaption(to);
      c.settle(1, 1050);
    }
    function go(to: number) {
      if (to < 0 || to >= plates.length) return;
      if (busy) { queued = to; return; }
      readyP[to].then(() => { if (disposed) return; if (busy) queued = to; else turn(to); });
    }

    /* ---------- magnifying glass ---------- */
    let Z = 2.2, lx = 0, ly = 0, ringPx = 200; // lx/ly: loupe top-left in stage coords
    let zoomFlash: ReturnType<typeof setTimeout> | undefined;
    const bookBox = () => ({ x: book.offsetLeft, y: book.offsetTop, w: book.offsetWidth, h: book.offsetHeight });

    function refreshMag() {
      const b = bookBox();
      const c = spread.cloneNode(true) as HTMLElement;
      mag.innerHTML = "";
      mag.style.width = b.w + "px";
      mag.style.height = b.h + "px";
      c.style.position = "absolute";
      c.style.inset = "0";
      mag.appendChild(c);
      placeMag();
    }
    function placeMag() {
      const b = bookBox(), lensR = (ringPx - 22) / 2;
      const cx = lx + ringPx / 2 - b.x, cy = ly + ringPx / 2 - b.y;
      mag.style.transform = `translate(${f(lensR - cx * Z)}px,${f(lensR - cy * Z)}px) scale(${Z})`;
    }
    function moveLoupe(x: number, y: number) {
      const sw = stage.clientWidth, sh = stage.clientHeight;
      lx = Math.max(-ringPx * 0.3, Math.min(sw - ringPx * 0.7, x));
      ly = Math.max(-ringPx * 0.3, Math.min(sh - ringPx * 0.5, y));
      loupe.style.transform = `translate(${f(lx)}px,${f(ly)}px)`;
      placeMag();
    }
    function setZ(z: number, flash: boolean) {
      Z = Math.round(Math.max(Z_MIN, Math.min(Z_MAX, z)) * 10) / 10;
      setZoom(Z);
      placeMag();
      if (flash) {
        setZooming(true);
        clearTimeout(zoomFlash);
        zoomFlash = setTimeout(() => !disposed && setZooming(false), 900);
      }
    }
    cleanups.push(() => clearTimeout(zoomFlash));

    let drag: { dx: number; dy: number; id: number } | null = null;
    on(loupe, "pointerdown", (e) => {
      drag = { dx: e.clientX - lx, dy: e.clientY - ly, id: e.pointerId };
      loupe.setPointerCapture(e.pointerId);
      loupe.classList.add("drag");
      tilt.style.transform = "";
      e.preventDefault();
    });
    on(loupe, "pointermove", (e) => { if (drag && e.pointerId === drag.id) moveLoupe(e.clientX - drag.dx, e.clientY - drag.dy); });
    const endDrag = () => { drag = null; loupe.classList.remove("drag"); rememberRel(); };
    on(loupe, "pointerup", endDrag);
    on(loupe, "pointercancel", endDrag);
    on(loupe, "wheel", (e) => { e.preventDefault(); setZ(Z * (e.deltaY < 0 ? 1.08 : 1 / 1.08), true); }, { passive: false });
    on(loupe, "keydown", (e) => {
      const s = e.shiftKey ? 40 : 12;
      const m = ({ ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] } as Record<string, number[]>)[e.key];
      if (m) { e.preventDefault(); e.stopPropagation(); moveLoupe(lx + m[0], ly + m[1]); rememberRel(); }
    });

    /* ---------- pointer tilt — the book leans gently toward the cursor ---------- */
    on(stage, "pointermove", (e) => {
      if (drag || pd || busy || reduce || e.pointerType !== "mouse") return;
      const r = book.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      if (Math.abs(px) > 0.85 || Math.abs(py) > 0.9) { tilt.style.transform = ""; return; }
      tilt.style.transform = `rotateX(${f(-py * 5)}deg) rotateY(${f(px * 6)}deg)`;
    });
    on(stage, "pointerleave", () => { tilt.style.transform = ""; });

    /* ---------- grab a page and turn it by hand; a plain click turns it too ---------- */
    type PageDrag = {
      id: number; side: "l" | "r"; to: number; x0: number; y0: number; gutterX: number; gx0: number;
      c: Leaf | null; moved: boolean; lx: number; lt: number; v: number;
    };
    let pd: PageDrag | null = null;
    const sideAt = (x: number) => { const r = book.getBoundingClientRect(); return x > r.left + r.width / 2 ? "r" : "l"; };
    const targetFor = (side: "l" | "r") => cur + (side === "r" ? 1 : -1);

    on(book, "pointerdown", (e) => {
      if (e.button !== 0 || busy) return;
      const r = book.getBoundingClientRect(), side = sideAt(e.clientX), to = targetFor(side);
      if (to < 0 || to >= plates.length) return;
      const gutterX = r.left + r.width / 2;
      pd = { id: e.pointerId, side, to, x0: e.clientX, y0: e.clientY, gutterX, gx0: Math.max(40, Math.abs(e.clientX - gutterX)), c: null, moved: false, lx: e.clientX, lt: e.timeStamp, v: 0 };
      book.setPointerCapture(e.pointerId);
    });
    on(book, "pointermove", (e) => {
      if (!pd || e.pointerId !== pd.id) return;
      if (!pd.moved) {
        const dx = e.clientX - pd.x0, dy = e.clientY - pd.y0;
        if (Math.hypot(dx, dy) < 6) return;
        if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx)) { pd = null; return; } // let the page scroll
        if (!local[pd.to] || reduce) return;
        pd.c = liftLeaf(pd.to);
        if (!pd.c) { pd = null; return; }
        pd.moved = true; pd.lx = e.clientX; pd.lt = e.timeStamp; pd.v = 0;
        tilt.style.transform = "";
        book.classList.add("dragging");
        book.classList.remove("peek-l", "peek-r");
      }
      // the leaf hinges at the gutter: its edge sits where the pointer is, so angle = acos(distance / grab distance)
      const gx = pd.side === "r" ? e.clientX - pd.gutterX : pd.gutterX - e.clientX;
      pd.c!.set(Math.acos(Math.max(-1, Math.min(1, gx / pd.gx0))) / Math.PI);
      const dt = Math.max(8, e.timeStamp - pd.lt);
      pd.v = pd.v * 0.6 + ((e.clientX - pd.lx) / dt) * 0.4;
      pd.lx = e.clientX; pd.lt = e.timeStamp;
    });
    const releasePage = (e: PointerEvent, cancelled: boolean) => {
      if (!pd || e.pointerId !== pd.id) return;
      const p = pd; pd = null;
      book.classList.remove("dragging");
      if (!p.moved) { if (!cancelled) go(p.to); return; }
      const v = e.timeStamp - p.lt > 120 ? 0 : p.v; // pointer came to rest → no flick
      const toward = p.side === "r" ? -v : v;         // px/ms in the turning direction
      const done = !cancelled && ((p.c!.e > 0.5 && toward > -0.35) || toward > 0.45);
      if (done) setCaption(p.to);
      p.c!.settle(done ? 1 : 0, undefined, easeOut);
    };
    on(book, "pointerup", (e) => releasePage(e, false));
    on(book, "pointercancel", (e) => releasePage(e, true));

    // hovering a page lifts its corner, hinting that it can be turned
    on(book, "pointermove", (e) => {
      if (pd || busy || e.pointerType !== "mouse") return;
      const side = sideAt(e.clientX), to = targetFor(side), ok = to >= 0 && to < plates.length;
      book.classList.toggle("peek-r", ok && side === "r");
      book.classList.toggle("peek-l", ok && side === "l");
      book.classList.toggle("can-turn", ok);
    });
    on(book, "pointerleave", () => book.classList.remove("peek-l", "peek-r", "can-turn"));

    /* ---------- keyboard ---------- */
    on(document, "keydown", (e) => {
      if ((e.target as HTMLElement).closest?.("input,textarea")) return;
      if (e.key === "ArrowRight") go(cur + 1);
      else if (e.key === "ArrowLeft") go(cur - 1);
      else if (e.key === "+" || e.key === "=") setZ(Z + 0.3, true);
      else if (e.key === "-" || e.key === "_") setZ(Z - 0.3, true);
    });

    /* ---------- layout ---------- */
    let rel: { x: number; y: number } | null = null, laidOut = false, lastW = 0;
    function layout() {
      ringPx = loupe.offsetWidth;
      const b = bookBox();
      rel ??= { x: 0.8, y: 0.68 };
      moveLoupe(b.x + b.w * rel.x - ringPx / 2, b.y + b.h * rel.y - ringPx / 2);
      refreshMag();
    }
    // remember where the glass sits relative to the book, so it stays put on resize
    function rememberRel() {
      const b = bookBox();
      if (laidOut && b.w) rel = { x: (lx + ringPx / 2 - b.x) / b.w, y: (ly + ringPx / 2 - b.y) / b.h };
    }
    const ro = new ResizeObserver(() => {
      if (!laidOut || book.offsetWidth === lastW) return;
      lastW = book.offsetWidth;
      layout();
    });
    ro.observe(book);
    cleanups.push(() => ro.disconnect());

    engine.current = { go, zoomBy: (d) => setZ(Z + d, true) };

    /* ---------- boot ---------- */
    readyP[0].then(() => {
      if (disposed) return;
      setHalf(pageL, 0, "l");
      setHalf(pageR, 0, "r");
      const start = () => {
        if (laidOut || disposed) return;
        laidOut = true;
        lastW = book.offsetWidth;
        layout();
        setReady(true);
      };
      pageR.querySelector("img")!.decode().then(start, start);
      later(start, 1200); // don't wait forever if decode stalls (e.g. background tab)
    });

    return () => {
      disposed = true;
      engine.current = null;
      cleanups.forEach((c) => c());
      tilt.querySelectorAll(".leaf").forEach((l) => l.remove());
    };
  }, []);

  const go = (i: number) => engine.current?.go(i);
  const p = plates[shown];

  return (
    <div className={ready ? "ready" : undefined}>
      <div className="loading" aria-hidden="true">opening the sketchbook…</div>

      <div className="stage" id="stage" ref={stageRef}>
        <button className="arrow prev" aria-label="Previous plate" disabled={shown === 0} onClick={() => go(shown - 1)}>
          <svg viewBox="0 0 22 46" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M18 2 4 23l14 21" /></svg>
        </button>
        <div className="book" ref={bookRef}>
          <div className="tilt" ref={tiltRef}>
            <div className="spread" ref={spreadRef}>
              <div className="page left sheet" ref={pageLRef} />
              <div className="page right sheet" ref={pageRRef} />
              <div className="gutter" />
              <div className="cast l" ref={castLRef} />
              <div className="cast r" ref={castRRef} />
              <div className="peel l" />
              <div className="peel r" />
            </div>
          </div>
        </div>
        <button className="arrow next" aria-label="Next plate" disabled={shown === plates.length - 1} onClick={() => go(shown + 1)}>
          <svg viewBox="0 0 22 46" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M4 2l14 21L4 44" /></svg>
        </button>

        <div
          className={"loupe" + (zooming ? " zooming" : "")}
          ref={loupeRef}
          role="slider"
          tabIndex={0}
          aria-label="Magnifying glass — drag to inspect, arrow keys move, plus and minus zoom"
          aria-valuemin={Z_MIN}
          aria-valuemax={Z_MAX}
          aria-valuenow={zoom}
        >
          <div className="handle"><div className="collar" /><div className="grip" /></div>
          <div className="ring">
            <div className="lens">
              <div className="mag" ref={magRef} />
              <div className="glare" />
              <span className="zoombadge">{zoom.toFixed(1)}×</span>
            </div>
          </div>
        </div>

        <div className="caption">
          <div className={"capbody" + (capOut ? " out" : "")}>
            <div className="plate-no">Plate {p.n}</div>
            <h2>{p.title}</h2>
            <p>{p.place} · {p.medium}</p>
            <p className="note">“{p.note}”</p>
          </div>
          <div className="controls">
            <div className="zoom" role="group" aria-label="Magnifier zoom">
              <span className="lbl">Loupe</span>
              <button aria-label="Zoom out" onClick={() => engine.current?.zoomBy(-0.3)}>−</button>
              <span className="read">{zoom.toFixed(1)}×</span>
              <button aria-label="Zoom in" onClick={() => engine.current?.zoomBy(0.3)}>+</button>
            </div>
            <div className="dots">
              {plates.map((q, i) => (
                <button key={q.n} className={i === shown ? "on" : undefined} aria-label={`Plate ${q.n}: ${q.title}`} onClick={() => go(i)} />
              ))}
            </div>
            <div className="count">{pad(shown + 1)} / {pad(plates.length)}</div>
          </div>
        </div>
        <p className="hint">
          <span className="desk">Grab a page corner to turn it · drag the glass to look closer · scroll on it to zoom · <kbd>←</kbd> <kbd>→</kbd></span>
          <span className="touch">Drag a page to turn it · drag the glass to look closer</span>
        </p>
      </div>

      <section id="index">
        <div className="section-head"><h3>Index of plates</h3><span>Vol. 03 — 2025</span></div>
        <ol className="index">
          {plates.map((q, i) => (
            <li key={q.n} className={i === shown ? "on" : undefined}>
              <button
                onClick={() => {
                  stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => go(i), 350);
                }}
              >
                <span className="num">{q.n}</span>
                {/* eslint-disable-next-line @next/next/no-img-element -- runtime-generated blob URLs */}
                <span className="thumb">{urls[i] ? <img src={urls[i]!} alt="" /> : null}</span>
                <span>
                  <div className="t">{q.title}</div>
                  <div className="p">{q.place} — {q.medium}</div>
                </span>
                <span className="d">{q.date}</span>
                <span className="go" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
