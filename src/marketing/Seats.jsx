// Seats — five 12×12 floor-plan archetypes rendered as CSS-grid cells.
//
// Char legend:
//   .  empty / negative space (hallway, walkway, garden, stage, bar)
//   s  available seat / table — outline only, fades in on scroll
//   1  VIP h1 — outline appears on reveal, fills brass at stage 1+
//   2  VIP h2 — outline appears on reveal, fills brass at stage 2+
//   3  VIP h3 — outline appears on reveal, fills brass at stage 3
//
// Cell visibility is driven by --seat-progress on the parent (a 0→1 value
// scaled from scroll position). Each cell carries a per-cell --threshold
// (random 0..1); the cell is visible when progress >= threshold. This makes
// the dot-matrix render reverse cleanly when the user scrolls back up.

import React from 'react';

const PLANS = [
  {
    // Airplane — VIPs at the top (1st class). Tapered nose only — the cabin
    // continues straight to the bottom of the grid so the airplane reads as
    // a tube cut off rather than a fully-shaped fuselage.
    label: 'Airplane',
    shape: 'square',
    grid: [
      '.....ss.....',
      '....ssss....',
      '..ss.11.ss..',
      '..ss.11.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
      '..ss.ss.ss..',
    ],
  },
  {
    // Theater — VIPs in the front rows (closest to the implied stage above
    // the grid). Audience fans out toward the back.
    label: 'Theater',
    shape: 'square',
    grid: [
      '....2222....',
      '...222222...',
      '..ssssssss..',
      '.ssssssssss.',
      'ssssssssssss',
      'ssssssssssss',
      'ssssssssssss',
      'ssssssssssss',
      'ssssssssssss',
      'ssssssssssss',
      'ssssssssssss',
      'ssssssssssss',
    ],
  },
  {
    // Restaurant — VIP booths along the windows (top + bottom edges).
    // Interior tables in clusters of 2 and 4. Round glyphs.
    label: 'Restaurant',
    shape: 'circle',
    grid: [
      '1111....1111',
      '............',
      'oo.oo.oo.oo.',
      '............',
      'oooo.oooo...',
      'oooo.oooo...',
      '............',
      'oo.oo.oo.oo.',
      '............',
      'oooo.oooo...',
      'oooo.oooo...',
      '1111....1111',
    ],
  },
  {
    // Arena — VIPs in the rows directly adjacent to the stage (best view).
    // Stage is the small empty rectangle in the center.
    label: 'Arena',
    shape: 'square',
    grid: [
      '...ssssss...',
      '.ssssssssss.',
      'ssssssssssss',
      'ssssssssssss',
      'ssss3333ssss',
      'ssss....ssss',
      'ssss....ssss',
      'ssss....ssss',
      'ssss3333ssss',
      'ssssssssssss',
      '.ssssssssss.',
      '...ssssss...',
    ],
  },
  {
    // Hotel — VIPs along the outer edges (ocean / mountain view rooms).
    // Inner rooms wrap a small central courtyard for added density.
    label: 'Hotel',
    shape: 'square',
    grid: [
      '22ss.ss.ss22',
      '............',
      '.ss.ss.ss.ss',
      '.ss.ss.ss.ss',
      '............',
      '....ssss....',
      '....ssss....',
      '............',
      '.ss.ss.ss.ss',
      '.ss.ss.ss.ss',
      '............',
      '22ss.ss.ss22',
    ],
  },
];

const cellClass = (ch) => {
  if (ch === 's' || ch === 'o') return 'cell seat';
  if (ch === '1') return 'cell vip h1';
  if (ch === '2') return 'cell vip h2';
  if (ch === '3') return 'cell vip h3';
  return 'cell empty';
};

const Plan = ({ grid, shape }) => {
  // Stable per-cell reveal thresholds (0..1). Computed once so the dot-matrix
  // pattern doesn't reshuffle on re-render.
  const thresholds = React.useMemo(
    () => grid.flatMap((row) => [...row].map(() => Math.random())),
    [grid]
  );
  return (
    <div className={`plan-grid shape-${shape}`} aria-hidden="true">
      {grid.flatMap((row, ri) =>
        [...row].map((ch, ci) => {
          const idx = ri * 12 + ci;
          return (
            <span
              key={`${ri}-${ci}`}
              className={cellClass(ch)}
              style={{ '--threshold': thresholds[idx].toFixed(3) }}
            />
          );
        })
      )}
    </div>
  );
};

const Seats = ({ stage = 0, showRestaurant = false }) => (
  <section
    className="mk-seats"
    data-stage={stage}
    data-show-restaurant={showRestaurant ? 'true' : 'false'}
  >
    <div className="mk-seats-inner">
      <div className="mk-seats-mark" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}assets/logos/peak-mark-gold.svg`} alt="" />
      </div>
      <h2 className="mk-seats-h">Unlock the value of your seats.</h2>
      <p className="mk-seats-sub">
        Airlines, theaters, hotels, and venues price demand by time and
        location. Peak brings that same model to restaurants — simply and
        natively.
      </p>
      <div className="mk-seats-row">
        {PLANS.map(({ label, grid, shape }) => {
          const isRest = label === 'Restaurant';
          return (
            <figure
              className={`plan-figure ${isRest ? 'plan-figure--restaurant' : ''}`}
              key={label}
            >
              <Plan grid={grid} shape={shape} />
              <figcaption className="plan-label">{label}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  </section>
);

export default Seats;
