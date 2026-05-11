// Peak marketing — v3
// - Dark hero + footer (#162F27), gold-based light theme (#EFE8DB) for inner sections
// - Schibsted Grotesk display (lighter weights, tighter tracking, smaller sizes)
// - Inner content blocks STACK as you scroll (sticky-card effect)
// - Generous padding everywhere — "less is more"
// - Footer collapsed to copyright + brand + inquiry input

import React from 'react';
import Lenis from 'lenis';
import {
  SceneMarketplace,
  SceneBooking,
  SceneGuestbook,
  SceneEvent,
  SceneInsight,
} from './ScrollScenes.jsx';
import Seats from './Seats.jsx';
import Sections, { LoopVideo, useScrollProgress } from './Sections.jsx';

// Lenis smooth scroll — slows the wheel to 1.4s easing for the elegant feel.
// Initialized once on mount; ref'd RAF tick keeps it in sync with the browser.
const useSmoothScroll = () => {
  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    let raf;
    const tick = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
};

// Curtain stage — pins Hero+Seats together for ~200vh of scroll. The hero
// translates upward to reveal the seats section behind it. A 12vh strip of
// seats peeks below the hero from the start, so it reads as a curtain edge.
const CurtainStage = () => {
  const stageRef = React.useRef(null);
  const pinRef = React.useRef(null);
  const [seatsStage, setSeatsStage] = React.useState(0);
  const [showRestaurant, setShowRestaurant] = React.useState(false);

  React.useEffect(() => {
    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!stage || !pin) return;

    let raf;
    let curCurtain = 0,    tgtCurtain = 0;
    let curSeatProg = 0,   tgtSeatProg = 0;
    let mounted = true;

    const compute = () => {
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = rect.height - vh;
      const t = Math.max(0, Math.min(1, -rect.top / total));
      // Curtain rises through first 30% of stage scroll.
      tgtCurtain = Math.max(0, Math.min(1, t / 0.3));
      // Seat-matrix renders alongside the curtain rise and finishes a beat
      // later (60% of stage) so the floorplan eases up to full color.
      tgtSeatProg = Math.max(0, Math.min(1, t / 0.6));
      // Restaurant slot reveals once the curtain has fully cleared and the
      // viewer has had a beat to register the four other archetypes.
      setShowRestaurant((s) => s || t > 0.42);
      let nextStage = 0;
      if (t > 0.6)  nextStage = 1;
      if (t > 0.75) nextStage = 2;
      if (t > 0.9)  nextStage = 3;
      setSeatsStage((prev) => (prev === nextStage ? prev : nextStage));
    };

    const tick = () => {
      if (!mounted) return;
      compute();
      curCurtain  += (tgtCurtain  - curCurtain)  * 0.085;
      curSeatProg += (tgtSeatProg - curSeatProg) * 0.085;
      if (Math.abs(tgtCurtain  - curCurtain)  < 0.0008) curCurtain  = tgtCurtain;
      if (Math.abs(tgtSeatProg - curSeatProg) < 0.0008) curSeatProg = tgtSeatProg;
      pin.style.setProperty('--curtain',       curCurtain.toFixed(4));
      pin.style.setProperty('--seat-progress', curSeatProg.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { mounted = false; if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="mk-curtain-stage" ref={stageRef}>
      <div className="mk-curtain-pin" ref={pinRef}>
        <Seats stage={seatsStage} showRestaurant={showRestaurant} />
        <div className="mk-scroll-cue" aria-hidden="true">
          <span className="mk-scroll-cue-label">Scroll</span>
          <span className="mk-scroll-cue-arrow">↓</span>
        </div>
        <div className="mk-curtain-hero">
          <Hero/>
        </div>
      </div>
    </div>
  );
};

const useScrolledPast = (threshold = 560) => {
  const [past, setPast] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return past;
};

// Inquire CTA — single-element pill that morphs in place.
//   resting     : pill button labelled "Inquire →"
//   tapped      : an email field slides out to the LEFT of the button under
//                 a single gold hairline; button label flips to "Send →"
//   submitted   : the input collapses; the pill shows "Thank you" and stays
//                 settled. Tap-away with empty input also collapses cleanly.
const InquireCTA = ({ size = 'md', tone = 'dark' }) => {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@') || sent) return;
    setSent(true);
    setOpen(false);
  };

  const handleClick = (e) => {
    if (sent) { e.preventDefault(); return; }
    if (!open) {
      e.preventDefault();
      setOpen(true);
    }
    // when open, the button is type="submit" — default behaviour submits
  };

  const handleBlur = (e) => {
    // keep the form open if focus moves onto the submit button itself
    if (e.relatedTarget && e.relatedTarget.closest('.inquire')) return;
    // any other tap-away collapses the form (email value is preserved)
    setOpen(false);
  };

  const label = sent ? 'Thank you' : open ? 'Send' : 'Inquire';
  const cls = [
    'inquire',
    `size-${size}`,
    `tone-${tone}`,
    open && 'is-open',
    sent && 'is-sent',
  ].filter(Boolean).join(' ');

  return (
    <form className={cls} onSubmit={handleSubmit}>
      <div className="inquire-input-wrap">
        <input
          ref={inputRef}
          className="inquire-input"
          type="email"
          placeholder="your@email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleBlur}
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
          disabled={sent}
        />
      </div>
      <button
        type={open ? 'submit' : 'button'}
        className="inquire-btn"
        onClick={handleClick}
        disabled={sent}
      >
        <span className="inquire-label">{label}</span>
        {!sent && <span className="inquire-arrow">→</span>}
      </button>
    </form>
  );
};

const Nav = () => {
  // Header stays dark-green / glass across all scroll positions — except
  // when the user has scrolled into the footer area. The footer carries
  // its own larger Inquire CTA, so the nav redundantly competing for the
  // top of the screen would be visual noise. We fade it out once the
  // footer-spacer is meaningfully in view.
  const [inFooter, setInFooter] = React.useState(false);
  React.useEffect(() => {
    const spacer = document.querySelector('.mk-footer-spacer');
    if (!spacer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInFooter(entry.isIntersecting && entry.intersectionRatio > 0.4),
      { threshold: [0, 0.4, 0.8] }
    );
    observer.observe(spacer);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={`mk-nav on-dark${inFooter ? ' is-hidden' : ''}`}>
      <div className="mk-nav-inner">
        <a href="#top" className="mk-brand">
          <img
            src={`${import.meta.env.BASE_URL}assets/logos/peak-logotype-new.svg`}
            alt="Peak"
            className="mk-logo"
          />
        </a>
        <div className="mk-nav-cta">
          <a href="#login" className="mk-nav-login">Login</a>
          <InquireCTA size="sm" tone="dark" />
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <header className="mk-hero" id="top">
    <LoopVideo src={`${import.meta.env.BASE_URL}assets/videos/video-2.mp4`} className="mk-hero-bg"/>
    <div className="mk-hero-scrim"/>
    <div className="mk-hero-inner">
      <div className="pk-eyebrow">A platform for restaurants that demand excellence</div>
      <h1 className="mk-h1">
        You earned your guests.<br/>Now for the easy part.
      </h1>
      <p className="mk-lede">
        Reservations and guest-intelligence built for the world's best restaurants —
        ones whose tables don't need a marketplace to fill.
      </p>
      <div className="mk-hero-meta">
        <span>By invitation</span>
        <span className="dot">·</span>
        <span>Limited cohorts</span>
        <span className="dot">·</span>
        <span>North America</span>
      </div>
    </div>
  </header>
);

// ─── StackCard ─────────────────────────────────────────────────────────────
// Each card sits absolutely inside the sticky stage with a 32px inset, so
// it reads as a true card — rounded, shadowed, breathing. Earlier cards
// cover later ones via z-index. Each card has a long REST window (card sits
// fully in the viewport while its scene autonomously demonstrates itself)
// and a short PEEL window (card translates up out of the stage, revealing
// the next card beneath). Scenes do NOT scrub on scroll — once a card is
// fully in view, its progress ramps from 0→1 over a fixed time, so a fast-
// scrolling reader still sees the demo play out gracefully.
const CARD_TRAVEL = 2.2;          // viewports of scroll per card (must match CSS)
const REST_RATIO = 0.70;          // first 70% of travel = rest, last 30% = peel
const SCENE_DURATION_MS = 4200;   // time floor — scene completes within this
const SCENE_START_DELAY_MS = 220; // brief beat after card lands before UI fires
const LERP = 0.085;                // peel/reveal smoothing (~1.2s ease feel)

const StackCard = ({ eyebrow, title, lead, index, total, tone = 'light', scene: SceneComp }) => {
  const ref = React.useRef(null);
  const [active, setActive] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // RAF loop drives:
  //  • target peel/reveal computed from scroll position
  //  • current peel/reveal LERPed toward target (gives the "delayed" feel)
  //  • scene progress = max(time-driven, scroll-driven), so the scene always
  //    completes before the card peels — no half-rendered UI.
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf;
    let curPeel = 0, tgtPeel = 0;
    let curReveal = (index === 0 ? 1 : 0), tgtReveal = (index === 0 ? 1 : 0);
    let restEnteredAt = null; // performance.now() when card first became fully at rest
    let mounted = true;

    const compute = () => {
      const stage = el.parentElement; if (!stage) return;
      const region = stage.parentElement; if (!region) return;
      const rr = region.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const t = (-rr.top / vh) - index * CARD_TRAVEL; // viewports past this card's start
      const isLast = index === total - 1;

      // Peel target: 0 during rest, -1 fully peeled. The LAST card peels too
      // (was held at 0) — without this, the user hits a dead zone at the end
      // of the sticky region: card is fully shown, they keep scrolling, and
      // nothing animates until the region releases and the next section
      // pops in. Letting it peel makes the handoff continuous.
      if (t <= CARD_TRAVEL * REST_RATIO) tgtPeel = 0;
      else if (t < CARD_TRAVEL) {
        const k = (t - CARD_TRAVEL * REST_RATIO) / (CARD_TRAVEL * (1 - REST_RATIO));
        tgtPeel = -k;
      } else tgtPeel = -1;

      // Reveal target: how visible THIS card is.
      // - Card 0 is always at full brightness while resting.
      // - For i>0, reveal ramps up as card (i-1) peels — i.e. as our t crosses
      //   from -(1-REST)*TRAVEL up to 0.
      if (index === 0) {
        tgtReveal = t < CARD_TRAVEL ? 1 : 1; // always lit while pinned
      } else {
        const peelWindow = (1 - REST_RATIO) * CARD_TRAVEL;
        // u: -1 = card above hasn't started peeling, 0 = card above fully peeled
        const u = (t + peelWindow) / peelWindow;
        tgtReveal = Math.max(0, Math.min(1, u));
      }

      // Active when card is the focal one (resting) — gates time-driven scene.
      const isResting = t > 0 && t < CARD_TRAVEL * REST_RATIO;
      const isActiveNow = isResting;
      if (isActiveNow && restEnteredAt === null) restEnteredAt = performance.now();
      if (!isActiveNow && t > CARD_TRAVEL) restEnteredAt = null; // reset for replay
      setActive(isActiveNow);

      // Scene progress — max of time-driven and scroll-driven inside the rest
      // window. Either one alone reaches 1 by the time peel begins.
      let scrollProg = 0;
      if (t > 0) {
        const restLen = CARD_TRAVEL * REST_RATIO;
        scrollProg = Math.min(1, t / restLen);
      }
      let timeProg = 0;
      if (restEnteredAt !== null) {
        const elapsed = performance.now() - restEnteredAt - SCENE_START_DELAY_MS;
        timeProg = elapsed > 0 ? Math.min(1, elapsed / SCENE_DURATION_MS) : 0;
      }
      // During peel and after, hold at 1 so the scene shows its end state.
      let p;
      if (t <= 0) p = 0;
      else if (t >= CARD_TRAVEL * REST_RATIO) p = 1;
      else p = Math.max(scrollProg, timeProg);
      setProgress(p);
    };

    const tick = () => {
      if (!mounted) return;
      compute();
      curPeel += (tgtPeel - curPeel) * LERP;
      curReveal += (tgtReveal - curReveal) * LERP;
      // Snap when essentially there, to avoid endless tiny updates.
      if (Math.abs(tgtPeel - curPeel) < 0.0008) curPeel = tgtPeel;
      if (Math.abs(tgtReveal - curReveal) < 0.0008) curReveal = tgtReveal;
      el.style.setProperty('--mk-peel', curPeel.toFixed(4));
      el.style.setProperty('--mk-reveal', curReveal.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { mounted = false; if (raf) cancelAnimationFrame(raf); };
  }, [index, total]);

  const slug = eyebrow.replace(/\s+/g,'-').toLowerCase();

  return (
    <section
      ref={ref}
      className={`mk-stack-card tone-${tone} ${active ? 'is-active' : ''}`}
      data-idx={index}
      id={slug}
    >
      <div className="mk-stack-inner mk-card-split">
        <div className="mk-card-copy">
          <div className="pk-eyebrow">
            <span className="mk-card-idx">{String(index + 1).padStart(2,'0')}</span>
            <span>{eyebrow}</span>
          </div>
          <h2 className="mk-h2">{title}</h2>
          {lead && <p className="mk-lead-para">{lead}</p>}
        </div>
        <div className="mk-card-scene">
          <div className="mk-scene-frame">
            {SceneComp ? <SceneComp progress={progress} active={active} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── The five cards — tells a guest → operator story through UI ──────────
const TOTAL_CARDS = 5;

const Problem = () => (
  <StackCard
    index={0} total={TOTAL_CARDS}
    eyebrow="The problem"
    tone="light"
    scene={SceneMarketplace}
    title={<>Your tables, listed <em>between</em> theirs.</>}
    lead={<>Discovery platforms put your kitchen next to last-minute discounts and a competitor's promoted spot. Their engine grows; your brand erodes.</>}
  />
);

const Platform = () => (
  <StackCard
    index={1} total={TOTAL_CARDS}
    eyebrow="A direct booking"
    tone="light"
    scene={SceneBooking}
    title={<>The guest comes <em>to you</em> — and stays yours.</>}
    lead={<>One field at a time, the guest reserves directly on your surface. No marketplace, no upsells, no fees you didn't choose. Just a reservation, made simply.</>}
  />
);

const Approach = () => (
  <StackCard
    index={2} total={TOTAL_CARDS}
    eyebrow="The host already knows"
    tone="light"
    scene={SceneGuestbook}
    title={<>By the time she walks in, you've <em>met before</em>.</>}
    lead={<>Preferences, allergies, the table by the window, the night they got engaged. Surfaced for the host stand the moment a guest is on the book.</>}
  />
);

const Results = () => (
  <StackCard
    index={3} total={TOTAL_CARDS}
    eyebrow="Events, monetized"
    tone="light"
    scene={SceneEvent}
    title={<>A chef's series. <em>Sold out</em> in ten minutes.</>}
    lead={<>Spin up a tasting, a private dinner, or a pop-up. Peak ticketed it, capped it, and reconciled it — without a third-party event tool taking a cut.</>}
  />
);

const Inquire = () => (
  <StackCard
    index={4} total={TOTAL_CARDS}
    eyebrow="The numbers are yours"
    tone="light"
    scene={SceneInsight}
    title={<>Forecast Friday. Price Saturday. <em>Own</em> the data.</>}
    lead={<>Cover forecasts, table-by-table demand, guest LTV — visible in a single grid that's yours alone. The marketplaces never saw it. Now you do.</>}
  />
);

const StackRegion = () => (
  <div className="mk-stack-region" style={{ '--mk-card-count': TOTAL_CARDS }}>
    <div className="mk-stack-stage">
      <Problem/>
      <Platform/>
      <Approach/>
      <Results/>
      <Inquire/>
    </div>
  </div>
);

const Footer = () => {
  // Track scroll into the footer-spacer area to drive a subtle Ken-Burns
  // zoom on the skyline photo as the footer is revealed.
  // Footer "reveal" finishes around t≈0.5 of the spacer's pass (when the
   // spacer top hits the viewport top and the dark .mk-main has fully
   // cleared). Map progress to that window so the zoom rides the reveal,
   // not the dead scroll afterwards.
  const [spacerRef, p] = useScrollProgress(0.00, 0.50);
  return (
    <>
      <div className="mk-footer-spacer" aria-hidden="true" ref={spacerRef}/>
      <footer className="mk-footer" style={{ '--reveal-p': p }}>
        <img src={`${import.meta.env.BASE_URL}assets/photos/skyline.jpeg`} alt="" className="mk-footer-bg"/>
        <div className="mk-footer-scrim" aria-hidden="true"/>
        {/* Three direct children — logo at top, pill auto-margined to the
            vertical center between the logo bottom and the fineprint top,
            fineprint anchored to the bottom of the viewport. No tagline. */}
        <img
          src={`${import.meta.env.BASE_URL}assets/logos/peak-logotype-new.svg`}
          alt="Peak"
          className="mk-footer-logo"
        />
        <div className="mk-footer-cta">
          <InquireCTA size="lg" tone="dark" />
        </div>
        <div className="mk-footer-fineprint">
          © 2026 Peak Hospitality Systems · North America
        </div>
      </footer>
    </>
  );
};

const MarketingSite = () => {
  useSmoothScroll();
  return (
    <>
      <Nav/>
      <main className="mk-main">
        <CurtainStage/>
        <StackRegion/>
        <Sections/>
      </main>
      {/* Footer owns its own spacer (the one whose scroll progress drives
         the photo zoom). No outer spacer here — that doubled the buffer
         and pushed the zoom out of the reveal window. */}
      <Footer/>
    </>
  );
};

export default MarketingSite;
