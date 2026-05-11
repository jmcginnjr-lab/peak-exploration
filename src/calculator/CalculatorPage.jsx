import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Topbar from './components/Topbar.jsx';
import HeadlineRestaurant from './components/HeadlineRestaurant.jsx';
import SimpleView from './components/SimpleView.jsx';
import ControlRow from './components/ControlRow.jsx';
import SuggestionChips from './components/SuggestionChips.jsx';
import ProjectionSection from './components/ProjectionSection.jsx';
import { deriveAnnual } from './calc.js';
import {
  SAMPLE_DATA,
  FIELDS,
  FIELD_GROUPS,
  FIELD_LABELS,
  FIELD_RANGES,
} from './data.js';

// CalculatorPage — orchestrator + state.
//
// Layout (single card):
//   • Headline (with editable restaurant slot)
//   • SimpleView card contains:
//       - earnings block (lighter bg)
//       - scenarios + collapsible advanced canvas (darker controls-bg)
//       - "Show the math" pill straddling the card's bottom border
//
// On boot the form is empty — no preset Halls data. The rep types into
// the headline; selecting a library match populates inputs and bumps
// `celebrationKey`, which causes the big number to pour in and (when it
// lands) `confettiTrigger` to bump for a brass particle burst.
const emptyInputs = () => {
  const seed = {};
  FIELDS.forEach((f) => { seed[f] = 0; });
  return seed;
};

const CalculatorPage = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'peak · earnings calculator';
    return () => { document.title = prev; };
  }, []);

  const [restaurant, setRestaurant] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [inputs, setInputs]         = useState(emptyInputs);
  const [badges, setBadges]         = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [celebrationKey, setCelebrationKey] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const celebrate = useCallback(() => setCelebrationKey((k) => k + 1), []);
  const onCountComplete = useCallback(() => setConfettiTrigger((c) => c + 1), []);

  const simpleRef   = useRef(null);
  const advancedRef = useRef(null);

  const setField = useCallback((field, val) => {
    setInputs((prev) => (prev[field] === val ? prev : { ...prev, [field]: val }));
  }, []);

  const applyPartialCelebrating = useCallback((partial) => {
    setInputs((prev) => ({ ...prev, ...partial }));
    celebrate();
  }, [celebrate]);

  const resetSample = useCallback(() => {
    setRestaurant('');
    setDraftQuery('');
    setInputs(emptyInputs());
    setBadges({});
    celebrate();
  }, [celebrate]);

  // Selecting a fuzzy-match restaurant from the headline dropdown: load
  // its full input set, badge everything as "auto" (we're pretending it
  // came from a real lookup), set the displayed name to the entry's
  // "Name · Location", celebrate so the count-up and confetti fire.
  const onSelectMatch = useCallback((entry) => {
    const next = {};
    FIELDS.forEach((f) => { next[f] = entry[f] ?? 0; });
    setInputs(next);
    const autoBadges = {};
    FIELDS.forEach((f) => { autoBadges[f] = 'auto'; });
    setBadges(autoBadges);
    // Drop city/state from the headline — the location can run long
     // ("The State Bird Provisions, San Francisco, CA") and force the H1
     // to wrap. Name only keeps the layout tight; the location is still
     // surfaced in the headline dropdown and the advanced footer.
    setRestaurant(entry.name);
    setDraftQuery(entry.name);
    celebrate();
  }, [celebrate]);

  // Enter on a no-match query — still gives the rep a usable demo by
  // falling back to the Halls sample but keeps the typed name.
  const onSubmitFreeText = useCallback((q) => {
    if (!q) return;
    const next = {};
    FIELDS.forEach((f) => { next[f] = SAMPLE_DATA[f]; });
    setInputs(next);
    setBadges({ ...SAMPLE_DATA.badges });
    setRestaurant(q);
    celebrate();
  }, [celebrate]);

  const ingest = useCallback((data) => {
    if (!data || typeof data !== 'object') return;
    setInputs((prev) => {
      const next = { ...prev };
      FIELDS.forEach((f) => {
        if (typeof data[f] === 'number') next[f] = data[f];
      });
      return next;
    });
    if (typeof data.restaurant === 'string') {
      setRestaurant(data.restaurant);
      setDraftQuery(data.restaurant);
    }
    if (data.badges) setBadges((prev) => ({ ...prev, ...data.badges }));
    celebrate();
  }, [celebrate]);

  useEffect(() => {
    window.peakIngest = ingest;
    window.populateLookup = (d) => {
      if (!d) return;
      const autoBadges = {};
      Object.keys(d).forEach((k) => {
        if (k !== 'badges' && k !== 'restaurant') autoBadges[k] = 'auto';
      });
      ingest({ ...d, badges: { ...autoBadges, ...(d.badges || {}) } });
    };
    return () => {
      delete window.peakIngest;
      delete window.populateLookup;
    };
  }, [ingest]);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced((prev) => {
      const next = !prev;
      requestAnimationFrame(() => {
        if (next) {
          advancedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      return next;
    });
  }, []);

  const derived = useMemo(() => deriveAnnual(inputs), [inputs]);

  // Advanced block rendered INSIDE SimpleView via children, so the pill
  // can attach to the simple card's bottom border and the height-collapse
  // animation keeps everything inside one parent.
  const advancedPanel = (
    <div className="cal-advanced" ref={advancedRef}>
      <div className="cal-canvas">
        <aside className="cal-controls">
          <div>
            <div className="cal-group-eyebrow">Restaurant</div>
            <div className="cal-controls-restaurant">
              {restaurant || 'Empty — search above to populate'}
            </div>
          </div>

          {FIELD_GROUPS.map((group) => (
            <div key={group.eyebrow}>
              <div className="cal-group-eyebrow">{group.eyebrow}</div>
              {group.fields.map((field) => (
                <ControlRow
                  key={field}
                  field={field}
                  label={FIELD_LABELS[field]}
                  badge={badges[field]}
                  value={inputs[field]}
                  onChange={(v) => setField(field, v)}
                  currency={FIELD_RANGES[field].currency}
                  min={FIELD_RANGES[field].min}
                  max={FIELD_RANGES[field].max}
                  step={FIELD_RANGES[field].step}
                  numMax={FIELD_RANGES[field].numMax}
                />
              ))}
            </div>
          ))}

          <SuggestionChips inputs={inputs} onApply={applyPartialCelebrating}/>

          <div className="cal-controls-foot">
            <span>Live · updates as you drag</span>
            <button type="button" className="cal-btn-ghost" onClick={resetSample}>
              Reset
            </button>
          </div>
        </aside>

        <div className="cal-canvas-divider" aria-hidden="true"/>

        <main className="cal-results">
          <ProjectionSection
            netMid={derived.netMid}
            years={3}
            hasData={derived.hasData}
            heading={<>3-year view</>}
            note="OpenTable & Resy minimum contract"
            chartId="chart3"
            growthSubBaseline="15% → 11% → 8%"
          />

          <ProjectionSection
            netMid={derived.netMid}
            years={10}
            hasData={derived.hasData}
            heading={<>10-year view</>}
            note="Long-term compounding"
            chartId="chart10"
            growthSubBaseline="15% tapering to 3%"
          />

          <div className="cal-foot-note">
            <span>Modeled at 17.5% Peak midpoint fee</span>
            <span>{restaurant || 'No restaurant'}</span>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="cal-shell">
      <Topbar/>

      <div className="cal-page-title-row">
        <div>
          <div className="cal-page-eyebrow">
            <span className="cal-rule" aria-hidden="true"/>
            <span>Earnings calculator</span>
          </div>
          <HeadlineRestaurant
            restaurant={restaurant}
            draftQuery={draftQuery}
            onDraftChange={setDraftQuery}
            onSelectMatch={onSelectMatch}
            onSubmit={onSubmitFreeText}
          />
        </div>
        <div className="cal-page-sub">
          See what your tables would earn — once Peak prices the demand you already have,
          instead of the marketplaces taking their cut.
        </div>
      </div>

      <SimpleView
        inputs={inputs}
        derived={derived}
        onApplyPreset={applyPartialCelebrating}
        celebrationKey={celebrationKey}
        onCountComplete={onCountComplete}
        confettiTrigger={confettiTrigger}
        showAdvanced={showAdvanced}
        onToggleAdvanced={toggleAdvanced}
        simpleRef={simpleRef}
        advancedPanel={advancedPanel}
      />
    </div>
  );
};

export default CalculatorPage;
