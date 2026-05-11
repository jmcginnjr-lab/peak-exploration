import { fmt } from '../calc.js';
import { PRESETS } from '../data.js';
import useCountUp from '../useCountUp.js';
import Confetti from './Confetti.jsx';
import { ClockIcon, PeakIcon, SparkleIcon } from './Icons.jsx';

// SimpleView — single card with three vertical zones plus a toggle pill
// straddling the bottom border.
//
//   .cal-simple-wrap (position:relative)
//   ├─ .cal-simple (overflow:hidden, rounded card)
//   │   ├─ .cal-simple-earnings (lighter bg = --bg-elev)
//   │   └─ .cal-simple-lower    (slightly darker = --lower-bg)
//   │       ├─ .cal-simple-scenarios
//   │       └─ .cal-advanced-wrap (collapsible)
//   └─ .cal-simple-toggle-wrap   (sibling of card, NOT clipped)
//
// The wrap exists so the pill can straddle the card's bottom border
// without being clipped by the card's overflow:hidden (which is needed
// for the inner background to respect the card's rounded corners).
//
// Confetti is anchored inside the Hi number's span so the burst fans out
// from that span's width only — not the whole numbers row.
const SIMPLE_SCENARIOS = [
  { key: 'busyNight',    icon: ClockIcon,   eyebrow: 'Busy night service', caption: '3 turns · open 7 days' },
  { key: 'weekendCrush', icon: PeakIcon,    eyebrow: 'Weekend crush',      caption: '3.5 turns · 70% priceable' },
  { key: 'tastingRoom',  icon: SparkleIcon, eyebrow: 'Tasting menu',       caption: '$225 check · 1.5 turns' },
];

const ScenarioCard = ({ scenario, onClick }) => {
  const Icon = scenario.icon;
  return (
    <button type="button" className="cal-scenario-card" onClick={onClick}>
      <span className="cal-scenario-icon"><Icon/></span>
      <span className="cal-scenario-text">
        <span className="cal-scenario-eyebrow">{scenario.eyebrow}</span>
        <span className="cal-scenario-caption">{scenario.caption}</span>
      </span>
    </button>
  );
};

const SimpleView = ({
  inputs,
  derived,
  onApplyPreset,
  celebrationKey,
  onCountComplete,
  confettiTrigger,
  showAdvanced,
  onToggleAdvanced,
  simpleRef,
  advancedPanel,
}) => {
  const { netLo, netHi, netMid, hasData } = derived;

  const animatedLo = useCountUp(hasData ? netLo : 0, { version: celebrationKey });
  const animatedHi = useCountUp(hasData ? netHi : 0, {
    version: celebrationKey,
    onComplete: onCountComplete,
  });

  const netLoStr = hasData ? fmt(animatedLo) : '—';
  const netHiStr = hasData ? fmt(animatedHi) : '—';
  const netMidStr = hasData ? fmt(netMid) : '—';

  const handleScenario = (key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    const next = {};
    for (const [field, val] of Object.entries(preset.apply)) {
      next[field] = typeof val === 'function' ? val(inputs) : val;
    }
    onApplyPreset(next);
  };

  // Keyed on celebrationKey so the CSS shimmer animation re-fires cleanly.
  const shimmerKey = celebrationKey;

  return (
    <section className="cal-simple-wrap" ref={simpleRef}>
      <div className="cal-simple">
        {/* ── Earnings (lighter bg) ───────────────────────────────── */}
        <div className="cal-simple-block cal-simple-earnings">
          <div className="cal-simple-eyebrow">Restaurant keeps · per year</div>

          <div
            key={`nums-${shimmerKey}`}
            className={`cal-simple-nums ${hasData && shimmerKey > 0 ? 'is-glistening' : ''}`}
          >
            <span className={`cal-simple-lo ${hasData ? '' : 'cal-placeholder'}`}>
              {netLoStr}
            </span>
            <span className="cal-simple-dash">→</span>
            {/* Hi number gets its own positioning context so the confetti
                burst is contained to its bounding box only — not the
                entire numbers row. */}
            <span className="cal-simple-hi-wrap">
              <span className={`cal-simple-hi ${hasData ? '' : 'cal-placeholder'}`}>
                {netHiStr}
              </span>
              <Confetti trigger={confettiTrigger}/>
            </span>
          </div>

          <div className="cal-simple-bar-ticks">
            <span>5% fee</span>
            <span>17.5% midpoint</span>
            <span>30% fee</span>
          </div>
          <div className={`cal-simple-bar ${hasData ? '' : 'cal-simple-bar--empty'}`}>
            <div className="cal-simple-bar-fill"/>
            <div className="cal-simple-bar-mid"/>
          </div>
          <div className="cal-simple-foot">
            {hasData
              ? <>Midpoint <strong>{netMidStr}/yr</strong>. The range reflects Peak's 5%–30% fee tiers.</>
              : <>Search a restaurant up top — we'll pull hours, capacity, and check size so the numbers can speak for themselves.</>}
          </div>

          {/* Disclaimer — set apart in a mono caption so customer + seller
              both clock it as informational and not a guarantee. */}
          <div className="cal-simple-disclaimer">
            Projections only · Actual results vary by operator, season, and guest mix
          </div>
        </div>

        {/* ── Lower half: scenarios + collapsible math (shared bg) ── */}
        <div className="cal-simple-lower">
          <div className={`cal-simple-block cal-simple-scenarios ${hasData ? '' : 'is-disabled'}`}>
            <div className="cal-simple-eyebrow">Try a scenario</div>
            <div className="cal-simple-scenarios-grid">
              {SIMPLE_SCENARIOS.map((sc) => (
                <ScenarioCard
                  key={sc.key}
                  scenario={sc}
                  onClick={hasData ? () => handleScenario(sc.key) : undefined}
                />
              ))}
            </div>
          </div>

          <div className={`cal-advanced-wrap ${showAdvanced ? 'is-open' : ''}`}>
            <div className="cal-advanced-clip">
              {advancedPanel}
            </div>
          </div>
        </div>
      </div>

      {/* Pill sibling of the card — straddles the card's bottom border
          without being clipped. */}
      <div className="cal-simple-toggle-wrap">
        <button
          type="button"
          className={`cal-advanced-toggle ${showAdvanced ? 'is-open' : ''}`}
          onClick={onToggleAdvanced}
          aria-expanded={showAdvanced}
        >
          <span>{showAdvanced ? 'Hide the math' : 'Show the math'}</span>
          <span className="cal-advanced-toggle-chev" aria-hidden="true">▾</span>
        </button>
      </div>
    </section>
  );
};

export default SimpleView;
