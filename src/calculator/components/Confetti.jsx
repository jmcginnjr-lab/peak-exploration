import { useEffect, useState } from 'react';

// Confetti — three sequential pulse bursts, dense brass particles.
// Mount is anchored inside the Hi-number's span via the parent's CSS
// (.cal-confetti is position:absolute inside .cal-simple-hi-wrap), so
// every particle's percentage-based origin lands somewhere over that
// span's width — the burst appears to emanate from the big dollar
// amount itself.
//
// Pulse cadence: bursts at t=0, t=180ms, t=380ms. Each burst spawns
// ~32 particles in three brass tones + three sizes. Bursts overlap
// briefly so the peak particle count is closer to ~70 on screen —
// dense without being chaotic.
const PARTICLES_PER_BURST = 32;
const BURST_LIFE_MS = 1000;
const PULSE_DELAYS = [0, 180, 380];

const makeParticles = (burstIndex) =>
  Array.from({ length: PARTICLES_PER_BURST }, (_, i) => ({
    i,
    // Origin: anywhere along the Hi-number's full width (-50%..50%).
    ox: (Math.random() - 0.5) * 100,
    // Lateral drift; later bursts push particles a bit wider so the
    // overall plume reads as growing.
    dx: (Math.random() - 0.5) * (60 + burstIndex * 30),
    // Rise distance.
    dy: -60 - Math.random() * 70 - burstIndex * 10,
    rot: (Math.random() - 0.5) * 320,
    delay: Math.random() * 90,
    duration: BURST_LIFE_MS - 180 + Math.random() * 240,
    hue: i % 3,
  }));

const Confetti = ({ trigger = 0 }) => {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!trigger) return undefined;

    const timers = [];

    PULSE_DELAYS.forEach((delay, burstIndex) => {
      timers.push(setTimeout(() => {
        const id = `${trigger}-${burstIndex}`;
        setBursts((prev) => [...prev, { id, particles: makeParticles(burstIndex) }]);
        timers.push(setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== id));
        }, BURST_LIFE_MS + 250));
      }, delay));
    });

    return () => { timers.forEach(clearTimeout); };
  }, [trigger]);

  if (bursts.length === 0) return null;

  return (
    <div className="cal-confetti" aria-hidden="true">
      {bursts.flatMap((burst) =>
        burst.particles.map((p) => (
          <span
            key={`${burst.id}-${p.i}`}
            className={`cal-confetti-bit cal-confetti-bit--${p.hue}`}
            style={{
              left: `calc(50% + ${p.ox}%)`,
              '--dx':       `${p.dx}px`,
              '--dy':       `${p.dy}px`,
              '--rot':      `${p.rot}deg`,
              '--delay':    `${p.delay}ms`,
              '--duration': `${p.duration}ms`,
            }}
          />
        ))
      )}
    </div>
  );
};

export default Confetti;
