// ScrollScenes.jsx
// Five isolated, animated UI scenes used inside the marketing StackCards.
// Each receives `progress` (0..1, scroll-tied within the card) and `active` (bool).
// The scenes are NOT interactive — they perform themselves so the user
// can sit back and watch the product tour while scrolling.
//
// Convention:
//   progress 0.00–0.20  setup (idle)
//   progress 0.20–0.80  hero animation (scrubs)
//   progress 0.80–1.00  resolution (settled)
// Idle micro-motion (cursor pulse, badge tick) loops independently.

import React from 'react';
const { useState: useStateSC, useEffect: useEffectSC, useMemo: useMemoSC, useRef: useRefSC } = React;

// ─── Scene 1: The problem ──────────────────────────────────────────────────
// Marketplace listing — Peak's restaurant ("Aurelia") sits in a list with
// competitors. Discount badges flash, a guest's cursor hovers another spot.
// As scroll progresses, Aurelia's row dims and the cursor moves AWAY.
// ─── Scene 1: Marketplace (the problem) ────────────────────────────────────
// Aurelia's listing sinks down the algorithmic ranking as discount-paying
// competitors get promoted above it. A commission-stolen counter ticks up.
// At the end, the cursor clicks a competitor and a "booked elsewhere" pulse.
export function SceneMarketplace({ progress }) {
  // The story: Aurelia starts as the top match for tonight. Then sponsored
  // listings appear above it one by one, pushing it further down the list.
  // By the end, three paid placements sit on top of the actual best match.
  //
  // Each promoted row has an `appearAt` threshold. When progress crosses it,
  // the row's max-height transitions from 0 → full, smoothly pushing rows
  // below (including Aurelia) downward. No reordering, no JS layout math.

  const promoted = [
    { id: 'p1', name: 'Bistro Lumina',   cuisine: 'Italian',   rating: 4.6, deal: '20% off',    appearAt: 0.18 },
    { id: 'p2', name: 'House of Embers', cuisine: 'Steak',     rating: 4.5, deal: 'Last 2',     appearAt: 0.40 },
    { id: 'p3', name: 'Anomaly',         cuisine: 'Asian',     rating: 4.3, deal: '15% off',    appearAt: 0.62 },
  ];

  const aureliaDim   = progress > 0.84;
  const overlayShown = progress > 0.74;

  // Sort label flips from "Highly rated" → "Best deals" right before the
  // first sponsored result appears.
  const sortFlipped = progress > 0.10;

  return (
    <div className="sc sc-mkt2">
      {/* Skeleton chrome — just enough to read as "a marketplace listing UI" */}
      <div className="sc-mkt2-brand">
        <span className="sc-mkt2-brand-mark" aria-hidden="true"></span>
        <span className="sc-mkt2-skel sc-mkt2-skel-meta"></span>
      </div>
      <div className="sc-mkt2-bar-skel">
        <span className="sc-mkt2-skel sc-mkt2-skel-search"></span>
        <span className="sc-mkt2-skel sc-mkt2-skel-sort"></span>
      </div>

      <div className="sc-mkt2-list">
        {promoted.map(r => {
          const appeared = progress >= r.appearAt;
          return (
            <div key={r.id} className={`sc-mkt2-row sc-mkt2-promoted ${appeared ? 'is-in' : ''}`}>
              <div className="sc-mkt2-thumb" data-letter={r.name[0]}>{r.name[0]}</div>
              <div className="sc-mkt2-info">
                <div className="sc-mkt2-row-top">
                  <span className="sc-mkt2-name">{r.name}</span>
                  <span className="sc-mkt2-tag">Sponsored</span>
                </div>
                <div className="sc-mkt2-sub">
                  <span>★ {r.rating}</span>
                  <span className="sc-mkt2-dot">·</span>
                  <span>{r.cuisine}</span>
                  <span className="sc-mkt2-dot">·</span>
                  <span>$$$</span>
                </div>
              </div>
              <div className="sc-mkt2-deal">{r.deal}</div>
            </div>
          );
        })}

        {/* Aurelia — skeleton row with just a "Your listing" chip so the user
            understands their position is buried below the paid placements. */}
        <div className="sc-mkt2-row sc-mkt2-aurelia-skel">
          <div className="sc-mkt2-thumb is-aur">A</div>
          <div className="sc-mkt2-info">
            <div className="sc-mkt2-row-top">
              <span className="sc-mkt2-skel sc-mkt2-skel-name"></span>
              <span className="sc-mkt2-tag is-you">Your listing</span>
            </div>
            <span className="sc-mkt2-skel sc-mkt2-skel-sub"></span>
          </div>
        </div>

        {/* One quieter row to imply the list continues. */}
        <div className="sc-mkt2-row sc-mkt2-skel-row">
          <span className="sc-mkt2-skel sc-mkt2-skel-thumb"></span>
          <div className="sc-mkt2-info">
            <span className="sc-mkt2-skel sc-mkt2-skel-name"></span>
            <span className="sc-mkt2-skel sc-mkt2-skel-sub"></span>
          </div>
        </div>
      </div>

      {/* Diagnostic overlay — shows up at the end, the punchline. */}
      <div className={`sc-mkt2-overlay ${overlayShown ? 'is-in' : ''}`}>
        <div className="sc-mkt2-overlay-l">Paid placements above your listing</div>
        <div className="sc-mkt2-overlay-row">
          <span className="sc-mkt2-overlay-num">3</span>
          <span className="sc-mkt2-overlay-rule" />
          <span className="sc-mkt2-overlay-cost">$8.50<i>/cover</i> + 7% <i>gross</i></span>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 2: Booking ───────────────────────────────────────────────────────
// Direct booking on Peak — date chip animates, party-size stepper ticks,
// "name" field types itself in, a confirmation toast slides up.
export function SceneBooking({ progress }) {
  const dateLocked   = progress > 0.10;
  const partyLocked  = progress > 0.30;
  const nameLocked   = progress > 0.55;
  const confirmShown = progress > 0.78;

  // Party size 1 → 4 across 0.10..0.30
  const partyTarget = 4;
  const partyAnim = Math.max(1, Math.min(partyTarget, Math.round(1 + (progress - 0.10) / 0.20 * (partyTarget - 1))));

  // Name typing
  const fullName = 'Vivienne Park';
  const typeStart = 0.30, typeEnd = 0.55;
  const t = Math.max(0, Math.min(1, (progress - typeStart) / (typeEnd - typeStart)));
  const typedName = fullName.slice(0, Math.round(fullName.length * t));

  return (
    <div className="sc sc-book">
      <div className="sc-book-card">
        <div className="sc-book-eyebrow">— Reserve at Aurelia</div>
        <div className="sc-book-h">Friday · April 26</div>

        {/* Date chip row */}
        <div className="sc-book-row">
          <div className="sc-book-label">Date</div>
          <div className={`sc-book-chip ${dateLocked ? 'is-set' : ''}`}>
            <span className="sc-book-chip-glyph">▾</span>
            <span>Fri Apr 26</span>
            {dateLocked && <span className="sc-book-check">✓</span>}
          </div>
        </div>

        {/* Party stepper */}
        <div className="sc-book-row">
          <div className="sc-book-label">Party</div>
          <div className={`sc-book-stepper ${partyLocked ? 'is-set' : ''}`}>
            <button className="sc-book-step" tabIndex="-1">−</button>
            <span className="sc-book-num">{partyAnim}</span>
            <button className="sc-book-step" tabIndex="-1">+</button>
            {partyLocked && <span className="sc-book-check">✓</span>}
          </div>
        </div>

        {/* Time slot grid */}
        <div className="sc-book-row sc-book-row-slots">
          <div className="sc-book-label">Time</div>
          <div className="sc-book-slots">
            {['6:30','6:45','7:00','7:15','7:30','7:45','8:00','8:15'].map((s,i) => (
              <div
                key={s}
                className={`sc-book-slot ${s === '7:30' && progress > 0.18 ? 'is-pick' : ''} ${s === '7:30' && progress > 0.22 ? 'is-locked' : ''}`}
              >{s}</div>
            ))}
          </div>
        </div>

        {/* Name field */}
        <div className="sc-book-row">
          <div className="sc-book-label">Name</div>
          <div className={`sc-book-input ${nameLocked ? 'is-set' : ''}`}>
            <span>{typedName}</span>
            {!nameLocked && t > 0 && t < 1 && <span className="sc-book-caret" />}
            {nameLocked && <span className="sc-book-check">✓</span>}
          </div>
        </div>

        {/* Confirm */}
        <button className={`sc-book-confirm ${confirmShown ? 'is-pulled' : ''}`}>
          Confirm reservation
          <span className="sc-book-arrow">→</span>
        </button>
      </div>

      {/* Confirmation toast */}
      <div
        className="sc-book-toast"
        style={{
          opacity: confirmShown ? 1 : 0,
          transform: `translateY(${confirmShown ? 0 : 16}px)`,
        }}
      >
        <span className="sc-book-toast-check">✓</span>
        <div>
          <div className="sc-book-toast-h">You're on the book.</div>
          <div className="sc-book-toast-s">Confirmation sent to vivienne@…</div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 3: Guestbook (the host knows you) ───────────────────────────────
// VIP profile card assembles itself in stages as the user scrolls — avatar,
// tags, dietary, notes, recent visits, favorite team, and a tonight banner.
export function SceneGuestbook({ progress }) {
  const avatarShown  = progress > 0.04;
  const flagShown    = progress > 0.10;
  const tagsShown    = progress > 0.18;
  const statsShown   = progress > 0.28;
  const dietShown    = progress > 0.45;
  const notesShown   = progress > 0.52;
  const visitsShown  = progress > 0.68;
  const tonightShown = progress > 0.84;

  // Counter helper — eased countup over a progress window. Ends at the
  // target value once progress passes `hi`; reverses cleanly on scroll up.
  const counter = (target, decimals = 0, lo = 0.30, hi = 0.44) => {
    const t = Math.max(0, Math.min(1, (progress - lo) / (hi - lo)));
    const eased = 1 - Math.pow(1 - t, 3);
    const v = target * eased;
    return decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
  };

  // Typewriter — reveals one character at a time across a progress window.
  const typewriter = (str, lo, hi) => {
    const t = Math.max(0, Math.min(1, (progress - lo) / (hi - lo)));
    return str.slice(0, Math.round(str.length * t));
  };

  // Pills are limited to three so they don't wrap inside the card.
  const tags = [
    { t: 'VIP',         tone: 'gold' },
    { t: 'Anniversary', tone: 'rose' },
    { t: 'Window pref', tone: 'sage' },
  ];
  const diet = [
    { k: 'No allium',   d: 'garlic, onion, leek' },
    { k: 'Pescatarian', d: 'no land meat' },
  ];
  const noteFull = 'Husband Daniel proposed at table 14 — favorite.';
  const noteTyped = typewriter(noteFull, 0.54, 0.66);
  const noteTyping = noteTyped.length > 0 && noteTyped.length < noteFull.length;

  const visits = [
    { d: 'Mar 02', n: 'Birthday · 6 covers · private room',  sp: '$1,180' },
    { d: 'Apr 26', n: 'Tonight · 2 covers · anniversary',    sp: '—', live: true },
  ];

  return (
    <div className="sc sc-guest">
      <div className="sc-guest-card">
        <div className="sc-guest-head">
          <div className={`sc-guest-avatar ${avatarShown ? 'is-in' : ''}`}>VP</div>
          <div className="sc-guest-name-block">
            <div className="sc-guest-name">Vivienne Park</div>
            <div className="sc-guest-meta">
              <span>14 visits</span>
              <span className="sc-guest-dot">·</span>
              <span>$3,840 lifetime</span>
              <span className="sc-guest-dot">·</span>
              <span>since '22</span>
            </div>
          </div>
          <div className={`sc-guest-flag ${flagShown ? 'is-in' : ''}`}>
            <span className="sc-guest-flag-dot" />
            Arriving 7:30
          </div>
        </div>

        <div className="sc-guest-tags">
          {tags.map((tag, i) => (
            <span
              key={tag.t}
              className={`sc-guest-tag tone-${tag.tone} ${tagsShown ? 'is-in' : ''}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >{tag.t}</span>
          ))}
        </div>

        {/* Quick stats row — counters tick up as the section reveals. */}
        <div className={`sc-guest-stats ${statsShown ? 'is-in' : ''}`}>
          <div className="sc-guest-stat">
            <div className="sc-guest-stat-v">${counter(274)}</div>
            <div className="sc-guest-stat-l">Avg check</div>
          </div>
          <div className="sc-guest-stat">
            <div className="sc-guest-stat-v">{counter(2.3, 1)} mo</div>
            <div className="sc-guest-stat-l">Cadence</div>
          </div>
          <div className="sc-guest-stat">
            <div className="sc-guest-stat-v">{counter(100)}%</div>
            <div className="sc-guest-stat-l">Show rate</div>
          </div>
          <div className="sc-guest-stat">
            <div className="sc-guest-stat-v">{counter(5.0, 1)}</div>
            <div className="sc-guest-stat-l">NPS</div>
          </div>
        </div>

        {/* Dietary */}
        <div className={`sc-guest-section ${dietShown ? 'is-in' : ''}`}>
          <div className="sc-guest-section-h">Dietary &amp; allergens</div>
          <div className="sc-guest-diet">
            {diet.map((d, i) => (
              <div key={d.k} className="sc-guest-diet-row" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="sc-guest-diet-k">{d.k}</span>
                <span className="sc-guest-diet-d">{d.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* A single floor note — types out letter by letter, with caret. */}
        <div className={`sc-guest-section ${notesShown ? 'is-in' : ''}`}>
          <div className="sc-guest-section-h">Notes from the floor</div>
          <div className="sc-guest-note">
            <span className="sc-guest-note-bul" />
            <span>
              {noteTyped}
              {noteTyping && <span className="sc-guest-caret" aria-hidden="true">|</span>}
            </span>
          </div>
        </div>

        {/* Recent visits w/ sparkline */}
        <div className={`sc-guest-section ${visitsShown ? 'is-in' : ''}`}>
          <div className="sc-guest-section-h">Recent visits</div>
          {visits.map((v, i) => (
            <div
              key={i}
              className={`sc-guest-visit ${v.live ? 'is-live' : ''}`}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <span className="sc-guest-visit-d">{v.d}</span>
              <span className="sc-guest-visit-n">{v.n}</span>
              <span className="sc-guest-visit-sp">{v.sp}</span>
              {v.live && <span className="sc-guest-visit-live">Tonight</span>}
            </div>
          ))}
        </div>

        {/* Tonight banner — pulls everything together */}
        <div className={`sc-guest-tonight ${tonightShown ? 'is-in' : ''}`}>
          <div className="sc-guest-tonight-h">For tonight</div>
          <div className="sc-guest-tonight-grid">
            <div><span>Table</span><strong>14 · window</strong></div>
            <div><span>Server</span><strong>Amelia</strong></div>
            <div><span>Pre-pour</span><strong>'18 Cornas</strong></div>
            <div><span>Comp</span><strong>Anniversary cake</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 4: Event ─────────────────────────────────────────────────────────
// Event card: cover photo, title, RSVP counter ticking up, status flips to LIVE.
export function SceneEvent({ progress }) {
  const sold = Math.round(8 + Math.min(progress * 1.05, 1) * 56); // 8 → 64
  const total = 64;
  const pct = Math.min(1, sold / total);
  const isSoldOut = sold >= total;
  const fillShown = progress > 0.10;

  return (
    <div className="sc sc-event">
      <div className="sc-event-card">
        <div className="sc-event-cover">
          <img src="/assets/photos/skyline.jpeg" alt="" className="sc-event-cover-photo" aria-hidden="true"/>
          <div className={`sc-event-status ${isSoldOut ? 'is-soldout' : ''}`}>
            <span className="sc-event-status-dot" />
            {isSoldOut ? 'Sold out' : 'On sale'}
          </div>
          <div className="sc-event-price">$185 / seat</div>
        </div>
        <div className="sc-event-body">
          <div className="sc-event-eyebrow">— Chef's table series</div>
          <div className="sc-event-title">A four-course evening, by candlelight.</div>
          <div className="sc-event-meta">
            <span>Sat · May 18</span>
            <span className="sc-event-dot">·</span>
            <span>7:00 – 10:30 PM</span>
            <span className="sc-event-dot">·</span>
            <span>Aurelia · Private room</span>
          </div>

          <div className="sc-event-rsvp">
            <div className="sc-event-rsvp-row">
              <span className="sc-event-rsvp-num">{sold}</span>
              <span className="sc-event-rsvp-of">of {total} seats sold</span>
            </div>
            <div className="sc-event-rsvp-bar">
              <div
                className="sc-event-rsvp-fill"
                style={{ width: fillShown ? `${pct * 100}%` : 0 }}
              />
            </div>
          </div>

          <div className="sc-event-foot">
            <div className="sc-event-avatars">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="sc-event-avatar" data-i={i} />
              ))}
              <div className="sc-event-avatar-more">+{Math.max(0, sold - 5)}</div>
            </div>
            <div className="sc-event-revenue">
              <span className="sc-event-revenue-label">Booked</span>
              <span className="sc-event-revenue-num">${(sold * 185).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scene 5: Insight (Busy hours mini grid) ───────────────────────────────
// Weekly busy-hours grid paints itself — a reveal sweep moves left→right
// across the days; bars rise to their values; covers number counts up.
export function SceneInsight({ progress }) {
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  // Curve from busy-hours prototype (4a-anchored 23 hours)
  const curve = useMemoSC(() => {
    // Dinner peak: indices 13..18 (5p..10p)
    const arr = new Array(23).fill(0);
    arr[13] = .35; arr[14] = .65; arr[15] = .9; arr[16] = .95; arr[17] = .75; arr[18] = .4;
    return arr;
  }, []);
  const dayMul = [0.6, 0.3, 0.4, 0.55, 0.7, 1.0, 0.95];

  // Reveal sweep — column-by-column reveal across the whole week
  const sweepCols = 7 * 23;
  const revealedCols = Math.round(progress * sweepCols);

  // Cover number ticks up
  const totalCovers = Math.round(progress * 1240);

  return (
    <div className="sc sc-insight">
      <div className="sc-ins-card">
        <div className="sc-ins-head">
          <div>
            <div className="sc-ins-eyebrow">— This week</div>
            <div className="sc-ins-title">Forecast covers</div>
          </div>
          <div className="sc-ins-num">{totalCovers.toLocaleString()}</div>
        </div>

        <div className="sc-ins-grid">
          {days.map((d, di) => (
            <div key={d} className="sc-ins-row">
              <div className="sc-ins-row-label">{d}</div>
              <div className="sc-ins-row-track">
                {curve.map((v, hi) => {
                  const colIdx = di * 23 + hi;
                  const visible = colIdx < revealedCols;
                  const intensity = Math.min(1, v * dayMul[di]);
                  const open = hi >= 7 && hi < 19;
                  return (
                    <div key={hi} className="sc-ins-cell">
                      {open && intensity > 0 && (
                        <div
                          className="sc-ins-cell-fill"
                          style={{
                            height: visible ? `${intensity * 100}%` : 0,
                            background: `rgba(193,163,110,${0.18 + intensity * 0.7})`,
                            borderTop: `1.5px solid rgba(201,166,113,${0.4 + intensity * 0.5})`,
                          }}
                        />
                      )}
                      {!open && <div className="sc-ins-cell-mask" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sc-ins-foot">
          <div className="sc-ins-legend">
            <span className="sc-ins-leg" style={{ background: 'rgba(193,163,110,0.30)' }} />
            <span className="sc-ins-leg" style={{ background: 'rgba(193,163,110,0.60)' }} />
            <span className="sc-ins-leg" style={{ background: 'rgba(193,163,110,0.90)' }} />
            <span className="sc-ins-leg-l">Quiet → Peak</span>
          </div>
          <div className="sc-ins-trend">
            <span className="sc-ins-trend-arrow">↗</span> 14% vs. last week
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  SceneMarketplace, SceneBooking, SceneGuestbook, SceneEvent, SceneInsight,
});
