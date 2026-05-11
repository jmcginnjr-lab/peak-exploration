import { PRESETS } from '../data.js';

// Quick-scenario chips. Click → resolve the preset against current state
// (some preset values are fn(state) for "55% of total tables" style) and
// hand a partial update to the parent. The flash animation on number
// fields fires automatically because parent state updates → ControlRow
// renders with new value → the flash class is toggled by useFlash().

const SuggestionChips = ({ inputs, onApply }) => {
  const handleClick = (key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    const next = {};
    for (const [field, val] of Object.entries(preset.apply)) {
      next[field] = typeof val === 'function' ? val(inputs) : val;
    }
    onApply(next);
  };

  return (
    <div className="cal-suggest-wrap">
      <div className="cal-group-eyebrow">Quick scenarios</div>
      <div className="cal-suggest-row">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            type="button"
            className="cal-suggest-chip"
            onClick={() => handleClick(key)}
          >
            <span className="cal-suggest-glyph">{p.glyph}</span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;
