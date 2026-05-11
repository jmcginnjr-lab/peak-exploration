import { useEffect, useRef, useState } from 'react';

// useFlash(value) → className
// Returns 'cal-flash' for ~280ms after `value` changes (skipping the
// initial render and any change *to* the "—" placeholder). The component
// applies the returned className alongside its base classes and lets the
// CSS keyframe do the brass-color pulse.
//
// The remove → reflow → add pattern from the prototype is replaced here
// by a key suffix that bumps each change, so React naturally remounts
// the className and the animation re-fires every time.
export default function useFlash(value, { placeholder = '—' } = {}) {
  const [tick, setTick] = useState(0);
  const previous = useRef(value);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      previous.current = value;
      return;
    }
    if (value === previous.current) return;
    if (value === placeholder) {
      previous.current = value;
      return;
    }
    previous.current = value;
    setTick((t) => t + 1);
  }, [value, placeholder]);

  return tick > 0 ? `cal-flash cal-flash--${tick}` : '';
}
