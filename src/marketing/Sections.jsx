// Sections — content beats below the stack-card region.
// Order: Real results → Small potatoes (growth) → Stay in control → Peak vs the rest.
// Visual language: dark forest green throughout, full-bleed hairline grids,
// gold accents only on data, lifestyle videos as small square polaroids
// flicked onto the page at section seams. Animations are scroll-driven so
// the user controls pace.
import React from 'react';

// ── LoopVideo ──────────────────────────────────────────────────────
// Two modes:
//   loop=true (default) — two stacked <video> elements playing the same
//     source offset by half the duration. We crossfade between them at the
//     loop seam so the hard end→start cut is hidden behind a 600ms fade.
//     Reads as a continuous, slightly drifting clip.
//   loop=false — single <video> that plays once and stops. Used for the
//     polaroids so they don't keep cycling.
const CrossfadeLoop = ({ src, className }) => {
  const v1Ref = React.useRef(null);
  const v2Ref = React.useRef(null);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const v1 = v1Ref.current;
    const v2 = v2Ref.current;
    if (!v1 || !v2) return;
    // Belt-and-suspenders muting. React's `muted` JSX prop sets the JS
    // property after mount, which races with the browser's autoplay
    // decision — pinning the HTML attribute via setAttribute and zeroing
    // volume here guarantees silence before play() is called.
    [v1, v2].forEach((v) => {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      v.setAttribute('muted', '');
    });
    let raf;
    let mounted = true;
    let primed = false;

    const prime = () => {
      if (primed || !v1.duration) return;
      primed = true;
      v2.currentTime = v1.duration / 2;
      v1.play().catch(() => {});
      v2.play().catch(() => {});
    };

    const tick = () => {
      if (!mounted) return;
      if (!primed) prime();
      const dur = v1.duration || 1;
      const distFromSeam = (t) => Math.min(t, dur - t);
      const d1 = distFromSeam(v1.currentTime);
      const d2 = distFromSeam(v2.currentTime);
      setActive(d1 > d2 ? 0 : 1);
      raf = requestAnimationFrame(tick);
    };

    v1.addEventListener('loadedmetadata', prime);
    v1.addEventListener('canplay', prime);
    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
      v1.removeEventListener('loadedmetadata', prime);
      v1.removeEventListener('canplay', prime);
    };
  }, [src]);

  return (
    <div className={`loop-vid-wrap ${className}`} aria-hidden="true">
      <video ref={v1Ref} src={src} muted playsInline loop preload="auto"
             className={`loop-vid ${active === 0 ? 'is-active' : ''}`} />
      <video ref={v2Ref} src={src} muted playsInline loop preload="auto"
             className={`loop-vid ${active === 1 ? 'is-active' : ''}`} />
    </div>
  );
};

const PlayOnce = ({ src, className }) => {
  // Same imperative-muting pattern as CrossfadeLoop — React's `muted`
  // prop alone can race with autoplay, so we pin the property + HTML
  // attribute + volume via a ref callback.
  const setMuted = (v) => {
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
    v.setAttribute('muted', '');
  };
  return (
    <div className={`loop-vid-wrap ${className}`} aria-hidden="true">
      <video ref={setMuted} src={src} muted defaultMuted playsInline autoPlay preload="auto"
             className="loop-vid is-active" />
    </div>
  );
};

export const LoopVideo = ({ src, className = '', loop = true }) =>
  loop ? <CrossfadeLoop src={src} className={className} />
       : <PlayOnce src={src} className={className} />;

// ── Scroll-driven progress ─────────────────────────────────────────
// 0→1 progress mapped to the element's position as it moves through the
// viewport. The optional [rangeStart, rangeEnd] window lets us start the
// animation later (after the element is partly on-screen) and finish
// earlier (before it leaves), so the user controls pacing with their wheel.
export const useScrollProgress = (rangeStart = 0.2, rangeEnd = 0.7) => {
  const ref = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = null;
    let mounted = true;

    const compute = () => {
      raf = null;
      if (!mounted) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // t=0 when bottom of element enters viewport bottom,
      // t=1 when top of element exits viewport top.
      const total = vh + rect.height;
      const traveled = vh - rect.top;
      const t = Math.max(0, Math.min(1, traveled / total));
      const mapped = Math.max(0, Math.min(1, (t - rangeStart) / (rangeEnd - rangeStart)));
      setProgress(mapped);
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      mounted = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [rangeStart, rangeEnd]);
  return [ref, progress];
};

// One-shot enter detector — for the polaroid throws.
const useDidEnter = (threshold = 0.2, rootMargin = '0px 0px -10% 0px') => {
  const ref = React.useRef(null);
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setEntered(true); },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
  return [ref, entered];
};

// ── 1) Real results ───────────────────────────────────────────────
const fmtK = (n) => (n >= 1000 ? Math.round(n / 1000) + 'K' : Math.round(n).toString());

const RESULTS = [
  { target: 10000,  format: (n) => fmtK(n) + '+',          label: 'Total users on platform' },
  { target: 10000,  format: (n) => fmtK(n) + '+',          label: 'Total reservations booked' },
  { target: 100000, format: (n) => '$' + fmtK(n) + '+',    label: 'Profit earned by pilot restaurants' },
  { target: 42,     format: (n) => Math.round(n) + '%',    label: 'Tables priced via Peak' },
  { target: 15.25,  format: (n) => '$' + n.toFixed(2),     label: 'Average price per priced table' },
];

const ResultsMetric = ({ target, format, label }) => {
  const [ref, p] = useScrollProgress(0.30, 0.62);
  return (
    <div
      ref={ref}
      className="mk-results-cell"
      style={{ opacity: 0.35 + 0.65 * p }}
    >
      <div className="mk-results-num">{format(target * p)}</div>
      <div className="mk-results-label">{label}</div>
    </div>
  );
};

const SectionResults = () => {
  const [ref, p] = useScrollProgress(0.10, 0.55);
  return (
    <section ref={ref} className="mk-sec mk-sec-results" style={{ '--p': p }}>
      <div className="mk-sec-head">
        <div className="pk-eyebrow mk-sec-eyebrow">Real results</div>
        <h2 className="mk-sec-h mk-sec-h-display">The numbers behind the room.</h2>
        <p className="mk-sec-sub">
          Two pilot restaurants. Six months. The pattern repeated every weekend.
        </p>
      </div>

      {/* Bear peeks out from behind the metrics row, brass-tinted to match
          the same hairline language as the grid below it. */}
      <Bear src={`${import.meta.env.BASE_URL}assets/bears/bear-01.svg`} side="left" size={440} />

      <div className="mk-results-grid">
        {RESULTS.map((r, i) => <ResultsMetric key={i} {...r} />)}
      </div>

      <div className="mk-results-quote-wrap">
        <blockquote className="mk-results-quote">
          &ldquo;Peak completely changed how we think about reservations. It made
          our guests feel known before they even walked in the door.&rdquo;
        </blockquote>
        <div className="mk-results-attr">— Owner, pilot restaurant</div>
      </div>
    </section>
  );
};

// ── Bear (peeking behind a table) ─────────────────────────────────
// A line-art bear rendered in the same brass tint as the page-grid
// hairlines. Sits in a 0-height anchor div placed BETWEEN the headline
// and the data grid, with its bottom edge aligned exactly to the grid's
// top hairline. The bear is clipped to its top half (no bottom fade) so
// the cut reads as the bear sitting on top of the table — almost
// connected, like part of the same line system.
const Bear = ({ src, side = 'left', size = 420, anchor = 'flow' }) => {
  // anchor='flow' → bear-anchor sits in document flow (between section head
  // and the data grid). anchor='chart' → absolutely positioned at the
  // chart's first grid line (25% from top of .mk-growth-chart).
  return (
    <div className={`bear-anchor bear-anchor--${anchor}`} aria-hidden="true">
      <div
        className={`bear-peek side-${side}`}
        style={{
          '--bear-size': `${size}px`,
          '--bear-clip': `${Math.round(size * 0.5)}px`,
        }}
      >
        <div
          className="bear-shape"
          style={{
            maskImage: `url("${src}")`,
            WebkitMaskImage: `url("${src}")`,
          }}
        />
      </div>
    </div>
  );
};

// ── 2) Growth — scroll-driven trend line + grid ──────────────────
// Section's --p custom property is set from scroll progress; CSS then
// stretches grid lines (stroke-dashoffset), grows the data line, and
// fades dots/labels as the user scrolls through the section.
// Range is wide (5%→90%) so the line's full draw spans most of the
// section's scroll — slower per-wheel-unit so the user can watch it.
const SectionGrowth = () => {
  const [ref, p] = useScrollProgress(0.05, 0.90);
  return (
    <section ref={ref} className="mk-sec mk-sec-growth" style={{ '--p': p }}>
      <div className="mk-sec-head">
        <div className="pk-eyebrow mk-sec-eyebrow">Second course</div>
        <h2 className="mk-sec-h mk-sec-h-display">Small potatoes? Think again.</h2>
        <p className="mk-sec-sub">
          Two pilot restaurants, six months. The numbers compound faster than the
          skeptics priced them in.
        </p>
      </div>

      <div className="mk-growth-chart">
        {/* Salad bear sits behind the chart, its bottom edge meeting the
            chart's first horizontal grid line (25% down). */}
        <Bear src={`${import.meta.env.BASE_URL}assets/bears/bear-03.svg`} side="left" size={440} anchor="chart" />
        <svg
          className="mk-growth-svg"
          viewBox="0 0 1000 400"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Grid lines — solid faint hairlines that draw in left-to-right.
              Stagger via per-line classes so they grow organically. */}
          <line className="g-grid g-grid-1" x1="0" y1="100" x2="1000" y2="100" stroke="rgba(201,166,113,0.10)" strokeWidth="1" />
          <line className="g-grid g-grid-2" x1="0" y1="200" x2="1000" y2="200" stroke="rgba(201,166,113,0.10)" strokeWidth="1" />
          <line className="g-grid g-grid-3" x1="0" y1="300" x2="1000" y2="300" stroke="rgba(201,166,113,0.13)" strokeWidth="1" />
          <line className="g-grid g-grid-4" x1="0" y1="380" x2="1000" y2="380" stroke="rgba(201,166,113,0.22)" strokeWidth="1" />

          {/* Data line — grows out of the baseline, threads through the points. */}
          <path
            className="mk-growth-path"
            d="M 0 378 L 80 378 Q 160 378 200 360 C 280 340, 360 280, 500 200 C 640 120, 720 80, 800 70 L 1000 70"
            stroke="var(--gold)"
            strokeWidth="1.25"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle className="mk-growth-dot dot-1" cx="200" cy="360" r="5" fill="var(--peak-dark)" stroke="var(--gold)" strokeWidth="1.25" />
          <circle className="mk-growth-dot dot-2" cx="500" cy="200" r="5" fill="var(--peak-dark)" stroke="var(--gold)" strokeWidth="1.25" />
          <circle className="mk-growth-dot dot-3" cx="800" cy="70"  r="5" fill="var(--peak-dark)" stroke="var(--gold)" strokeWidth="1.25" />
        </svg>

        <div className="mk-growth-labels">
          <div className="growth-pt growth-pt-1" style={{ left: '20%', top: '90%' }}>
            <span className="growth-pt-num">$16</span>
            <span className="growth-pt-label">Average table price</span>
          </div>
          <div className="growth-pt growth-pt-2" style={{ left: '50%', top: '50%' }}>
            <span className="growth-pt-num">11k</span>
            <span className="growth-pt-label">Tables sold</span>
          </div>
          <div className="growth-pt growth-pt-3" style={{ left: '80%', top: '17.5%' }}>
            <span className="growth-pt-num">$223k</span>
            <span className="growth-pt-label">Projected new revenue</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── 3) Stay in control ────────────────────────────────────────────
const FeatureIcon = ({ name }) => {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'x':       return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>;
    case 'shop':    return <svg {...props}><path d="M3 9h18l-1 11H4L3 9z"/><path d="M7 9V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3"/></svg>;
    case 'data':    return <svg {...props}><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>;
    case 'sliders': return <svg {...props}><line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2.2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2.2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2.2"/></svg>;
    case 'shield':  return <svg {...props}><path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z"/></svg>;
    case 'trend':   return <svg {...props}><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>;
    default: return null;
  }
};

const FEATURES = [
  { i: 'x',       t: 'No competing ads',       d: 'Guests complete bookings inside your brand. No rival restaurants bidding for attention.' },
  { i: 'shop',    t: 'No diluted marketplace', d: 'Your restaurant isn’t listed alongside others. The experience is yours, start to finish.' },
  { i: 'data',    t: 'Guest ownership',        d: 'Every booking builds your data, not a platform’s. You own the relationship.' },
  { i: 'sliders', t: 'Full control',           d: 'VIPs, waitlists, and events fully controlled. Define who gets access, when, and how.' },
  { i: 'shield',  t: 'Scalping protection',    d: 'Built-in safeguards prevent third parties from profiting off your demand and reselling bookings.' },
  { i: 'trend',   t: 'Capture value',          d: 'Convert existing guest demand into revenue on your terms.' },
];

const SectionControl = () => {
  const [ref, p] = useScrollProgress(0.10, 0.55);
  return (
    <section ref={ref} className="mk-sec mk-sec-control" style={{ '--p': p }}>
      <div className="mk-sec-head">
        <div className="pk-eyebrow mk-sec-eyebrow">Stay in control</div>
        <h2 className="mk-sec-h mk-sec-h-display">Brand protection, by default.</h2>
      </div>

      <div className="mk-feature-grid">
        {FEATURES.map((f) => (
          <div className="mk-feature" key={f.t}>
            <FeatureIcon name={f.i}/>
            <h3 className="mk-feature-title">{f.t}</h3>
            <p className="mk-feature-desc">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── 4) Peak vs. the rest ──────────────────────────────────────────
const COMPARE = [
  {
    label: 'Restaurant economics',
    cells: [
      { mark: '✓', note: 'Full revenue kept by the restaurant', kind: 'yes' },
      { mark: '✕', note: 'Platform takes a cut of overall revenue', kind: 'no' },
      { mark: '~', note: 'Partial, fees apply', kind: 'partial' },
      { mark: '✕', note: 'Not applicable', kind: 'no' },
    ],
  },
  {
    label: 'Guest data ownership',
    cells: [
      { mark: '✓', note: 'First-party, always', kind: 'yes' },
      { mark: '✕', note: 'Platform owns the data', kind: 'no' },
      { mark: '~', note: 'Shared or limited', kind: 'partial' },
      { mark: '✕', note: 'No guest profiles', kind: 'no' },
    ],
  },
  {
    label: 'Integrated events',
    cells: [
      { mark: '✓', note: 'Built in, no add-on', kind: 'yes' },
      { mark: '✕', note: 'Not supported', kind: 'no' },
      { mark: '✕', note: 'Not supported', kind: 'no' },
      { mark: '✓', note: 'Ticketing only', kind: 'yes' },
    ],
  },
  {
    label: 'AI seating intelligence',
    cells: [
      { mark: '✓', note: 'Peak exclusive', kind: 'yes' },
      { mark: '✕', note: 'Not available', kind: 'no' },
      { mark: '✕', note: 'Not available', kind: 'no' },
      { mark: '✕', note: 'Not available', kind: 'no' },
    ],
  },
];

const COL_LABELS = ['Peak', 'Marketplace platform', 'VIP platform', 'Ticketing tool'];

const SectionCompare = () => (
  <section className="mk-sec mk-sec-compare">
    <div className="mk-sec-head">
      <div className="pk-eyebrow mk-sec-eyebrow">The category</div>
      <h2 className="mk-sec-h mk-sec-h-display">Peak vs. the rest.</h2>
      <p className="mk-sec-sub">
        Legacy platforms were built around traffic aggregation. Peak is built
        around helping great restaurants capture more value from the demand
        they already have.
      </p>
    </div>

    {/* Dessert bear peeks out from behind the comparison table on the
        right — flips the side to balance the row of three bears. */}
    <Bear src={`${import.meta.env.BASE_URL}assets/bears/bear-cake.svg`} side="right" size={440} />

    <div className="mk-compare" role="table">
      <div className="mk-compare-row mk-compare-head-row" role="row">
        <div className="mk-compare-feature">Feature</div>
        {COL_LABELS.map((c, i) => (
          <div key={c} className={`mk-compare-cell mk-compare-h ${i === 0 ? 'is-peak' : ''}`} role="columnheader">{c}</div>
        ))}
      </div>
      {COMPARE.map((row) => (
        <div className="mk-compare-row" role="row" key={row.label}>
          <div className="mk-compare-feature" role="rowheader">{row.label}</div>
          {row.cells.map((c, i) => (
            <div key={i} className={`mk-compare-cell ${i === 0 ? 'is-peak' : ''}`} role="cell">
              <span className={`mk-compare-mark mark-${c.kind}`}>{c.mark}</span>
              <span className="mk-compare-note">{c.note}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </section>
);

const Sections = () => (
  <>
    <SectionResults/>
    <SectionGrowth/>
    <SectionControl/>
    <SectionCompare/>
  </>
);

export default Sections;
