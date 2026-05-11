// Inline SVG icons for the scenario cards. Stroked, currentColor, sized
// to inherit the surrounding font cascade. Kept minimal — these are
// emblematic rather than illustrative.

const base = {
  width: 22, height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ClockIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </svg>
);

// A small mountain — echoes the Peak summit glyph. Used for "Weekend
// crush" where demand peaks.
export const PeakIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 20 L9 9 L13 14 L17 6 L21 20 Z"/>
  </svg>
);

// Four-point sparkle for the premium / tasting scenario.
export const SparkleIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3 L13.2 10.8 L21 12 L13.2 13.2 L12 21 L10.8 13.2 L3 12 L10.8 10.8 Z"/>
  </svg>
);
