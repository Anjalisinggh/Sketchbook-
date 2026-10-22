import Sketchbook from "@/components/Sketchbook";
import Botanicals from "@/components/Botanicals";

const NAME = "Sanjeev";

export default function Home() {
  return (
    <>
      <header>
        <h1 className="nameplate">{NAME}</h1>
        <nav aria-label="Primary">
          <a href="#index">Journal</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <span className="sep" aria-hidden="true" />
          <span className="icons">
            <a href="#" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 8.5h3V20H5V8.5zM6.5 3.8a1.8 1.8 0 110 3.5 1.8 1.8 0 010-3.5zM10 8.5h2.9v1.6c.4-.8 1.4-1.8 3.1-1.8 3.2 0 3.9 2.1 3.9 4.9V20h-3v-6.1c0-1.4 0-3.3-2-3.3s-2.3 1.6-2.3 3.2V20H10V8.5z" /></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></svg>
            </a>
            <a href="#contact" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
            </a>
          </span>
        </nav>
        <p className="tagline">Designer / Sketcher / Builder / Field notes in ink &amp; wash</p>
      </header>

      <main>
        <Sketchbook />

        <section id="about">
          <div className="section-head"><h3>About this book</h3><span>Notes</span></div>
          <div className="about">
            <p className="lead">A pocket sketchbook carried everywhere — drawn on the spot, in whatever light there was.</p>
            <div>
              <p>Each plate starts as a quick fineliner line, then gets loosened up with a few washes of watercolour while the paper is still damp. Nothing is redrawn; the wobbles stay in.</p>
              <p>Pick up the glass and look closely — the grain of the paper, where the pigment pooled, the lines that overshot their corners.</p>
              <dl>
                <dt>Paper</dt><dd>Cold-press, 300 gsm, landscape spread</dd>
                <dt>Ink</dt><dd>Sepia fineliner, 0.1 – 0.5</dd>
                <dt>Paint</dt><dd>Twelve-pan travel set, one water brush</dd>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <span className="sig">{NAME}</span>
        Say hello — <a href="mailto:hello@example.com">hello@example.com</a>
      </footer>

      <Botanicals />
    </>
  );
}
