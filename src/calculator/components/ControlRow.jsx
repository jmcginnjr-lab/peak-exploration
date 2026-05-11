import { useEffect, useRef } from 'react';

// One control row = label (+ optional badge) + editable number + slider
// that share a single value. Number and slider stay in sync via the
// parent: editing either calls onChange(newValue) and the parent's state
// becomes the single source of truth.
//
// The slider's brass-fill is driven by a CSS custom property `--fill`
// (set inline) rather than by a colored gradient stop, so the same
// element handles both webkit and firefox track styling.

const ControlRow = ({
  field,
  label,
  badge,
  value,
  onChange,
  min, max, step, numMax,
  currency = false,
}) => {
  const numRef = useRef(null);

  // Slider expects a clamped value (its own min/max). Number input can
  // exceed slider max up to numMax — the slider visually pegs at its end.
  const clamped = Math.max(min, Math.min(max, Number(value) || 0));
  const fillPct = max === min ? 0 : ((clamped - min) / (max - min)) * 100;

  // Keep the number field's displayed value in sync with state when
  // state changes from outside (e.g. preset or lookup). We don't write to
  // the input on every render because that would clobber the user's
  // in-progress typing.
  useEffect(() => {
    if (!numRef.current) return;
    const current = numRef.current.value;
    if (String(value) !== current && document.activeElement !== numRef.current) {
      numRef.current.value = String(value);
    }
  }, [value]);

  const handleNum = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(0); return; }
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    onChange(n);
  };

  const handleSlider = (e) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="cal-control" data-field={field}>
      <div className="cal-control-label">
        <span className="cal-control-name">{label}</span>
        {badge && (
          <span className={`cal-badge cal-badge--${badge}`}>{badge}</span>
        )}
      </div>
      <div className="cal-control-value">
        {currency && <span className="cal-currency">$</span>}
        <input
          ref={numRef}
          type="number"
          defaultValue={value}
          min={0}
          max={numMax}
          step={step}
          onInput={handleNum}
          inputMode="decimal"
        />
      </div>
      <div className="cal-control-slider">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clamped}
          onChange={handleSlider}
          style={{ '--fill': `${fillPct}%` }}
          aria-label={label}
        />
      </div>
    </div>
  );
};

export default ControlRow;
