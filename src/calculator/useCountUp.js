import { useEffect, useRef, useState } from 'react';

// useCountUp(value, { version, duration }) → animated display value.
//
// Two modes — controlled by `version`:
//   • version changes → animate from current display to new value (ease-out
//     cubic). This is the celebration mode used for lookup + scenarios.
//   • version stays the same but value changes → snap immediately. This is
//     the "live drag" mode used by sliders, where animating every frame
//     would be jankier than just following the drag.
//
// onComplete fires on the trailing edge of an animated transition; pass it
// to chain something like a confetti burst at the punch.
export default function useCountUp(value, { version = 0, duration = 1200, onComplete } = {}) {
  const [display, setDisplay] = useState(value);
  const displayRef  = useRef(value);
  const versionRef  = useRef(version);
  const rafRef      = useRef(null);

  // Mirror display into a ref so the effect can read the latest without
  // adding it as a dep (which would re-fire the effect every frame).
  displayRef.current = display;

  useEffect(() => {
    const versionChanged = version !== versionRef.current;
    versionRef.current = version;

    // Snap path: target moved but no celebration was requested.
    if (!versionChanged) {
      if (displayRef.current !== value) setDisplay(value);
      return undefined;
    }

    // Animate from wherever the display is to the new target.
    const from = displayRef.current;
    const to   = value;
    if (from === to) { onComplete?.(); return undefined; }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        rafRef.current = null;
        onComplete?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, version, duration, onComplete]);

  return display;
}
