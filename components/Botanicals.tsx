"use client";

import { useEffect, useState } from "react";
import { fernSVG, orchidSVG } from "@/lib/sketch";
import { rasterOnce } from "@/lib/raster";

const sprigs = [
  { cls: "b1", draw: () => fernSVG(5), w: 440 },
  { cls: "b2", draw: () => fernSVG(9), w: 440 },
  { cls: "b3", draw: () => orchidSVG(13), w: 460 },
  { cls: "b4", draw: () => fernSVG(17), w: 440 },
];

/** Faded ferns and an orchid around the edges, plus soft watercolour blots. */
export default function Botanicals() {
  const [urls, setUrls] = useState<(string | null)[]>(() => sprigs.map(() => null));

  useEffect(() => {
    let live = true;
    sprigs.forEach((s, i) =>
      rasterOnce("botanic-" + s.cls, s.draw, s.w, 780, 1.2).then((u) => {
        if (live) setUrls((prev) => prev.map((v, k) => (k === i ? u : v)));
      }),
    );
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="botanic" aria-hidden="true">
      <div className="blot" style={{ left: "-6%", top: "12%", width: 420, height: 380, background: "#e2cfa9" }} />
      <div className="blot" style={{ right: "-4%", top: "30%", width: 460, height: 420, background: "#e8d6b8" }} />
      <div className="blot" style={{ left: "30%", bottom: "-10%", width: 520, height: 300, background: "#e9dcc4" }} />
      {sprigs.map((s, i) =>
        // eslint-disable-next-line @next/next/no-img-element -- runtime-generated blob URLs
        urls[i] ? <img key={s.cls} className={s.cls} src={urls[i]!} alt="" /> : null,
      )}
    </div>
  );
}
