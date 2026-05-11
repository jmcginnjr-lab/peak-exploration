import { useEffect, useRef } from 'react';
import { fmtShort, niceCeil } from '../calc.js';

// SVG multi-series projection chart with tweened transitions.
// On every series change we tween from the last-rendered values to the
// new ones over 480ms easeOutCubic via requestAnimationFrame, redrawing
// the paths each frame. An in-flight rAF is cancelled when a new update
// lands so we never queue stale frames.

const CHART_W = 400;
const CHART_H = 240;
const PAD_L = 42;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 26;
const INNER_W = CHART_W - PAD_L - PAD_R;
const INNER_H = CHART_H - PAD_T - PAD_B;
const ANIM_MS = 480;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const tween = (from, to, t) => ({
  flat:   to.flat.map((v, i)   => (from?.flat?.[i]   ?? 0) + (v - (from?.flat?.[i]   ?? 0)) * t),
  growth: to.growth.map((v, i) => (from?.growth?.[i] ?? 0) + (v - (from?.growth?.[i] ?? 0)) * t),
  index:  to.index.map((v, i)  => (from?.index?.[i]  ?? 0) + (v - (from?.index?.[i]  ?? 0)) * t),
});

const ProjectionChart = ({ series, years, chartId }) => {
  const svgRef = useRef(null);
  const stateRef = useRef({ current: null, raf: null });

  useEffect(() => {
    const state = stateRef.current;
    if (state.raf) cancelAnimationFrame(state.raf);

    const from = state.current ?? {
      flat:   series.flat.map(() => 0),
      growth: series.growth.map(() => 0),
      index:  series.index.map(() => 0),
    };
    const to = series;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const eased = easeOutCubic(t);
      const interp = tween(from, to, eased);
      state.current = interp;
      drawChart(svgRef.current, interp, years, chartId);
      if (t < 1) state.raf = requestAnimationFrame(step);
      else state.raf = null;
    };
    state.raf = requestAnimationFrame(step);

    return () => {
      if (state.raf) cancelAnimationFrame(state.raf);
    };
  }, [series, years, chartId]);

  return (
    <svg
      ref={svgRef}
      className="cal-chart-svg"
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
    />
  );
};

// drawChart imperatively builds innerHTML for the SVG. Imperative because
// rebuilding tens of nodes per frame through React reconciliation is
// considerably slower than a single innerHTML write.
function drawChart(svg, series, years, chartId) {
  if (!svg) return;

  const hasData = series.flat.some((v) => v > 0);
  if (!hasData) {
    svg.innerHTML =
      '<g font-family="var(--font-mono)" font-size="10" fill="var(--fg-subtle)" letter-spacing="0.08em">' +
      `<text x="${CHART_W / 2}" y="${CHART_H / 2}" text-anchor="middle">AWAITING INPUTS</text></g>`;
    return;
  }

  const lastIdx = years - 1;
  const maxVal = Math.max(
    series.flat[lastIdx],
    series.growth[lastIdx],
    series.index[lastIdx],
  );
  const niceMax = niceCeil(maxVal);

  const xFor = (i) => PAD_L + (years === 1 ? INNER_W / 2 : (i / (years - 1)) * INNER_W);
  const yFor = (v) => PAD_T + INNER_H - (v / niceMax) * INNER_H;

  const buildPath = (vals) =>
    vals.map((v, i) => (i === 0 ? 'M' : 'L') + xFor(i).toFixed(1) + ',' + yFor(v).toFixed(1)).join(' ');
  const buildArea = (vals) =>
    buildPath(vals) +
    ' L ' + xFor(years - 1).toFixed(1) + ',' + (PAD_T + INNER_H).toFixed(1) +
    ' L ' + xFor(0).toFixed(1) + ',' + (PAD_T + INNER_H).toFixed(1) + ' Z';

  // Y-axis grid + labels
  const yTicks = [0, niceMax / 2, niceMax];
  const yTickMarkup = yTicks.map((t) => {
    const y = yFor(t);
    return (
      `<line x1="${PAD_L}" x2="${CHART_W - PAD_R}" y1="${y}" y2="${y}" stroke="rgba(201,166,113,0.05)" stroke-width="1"/>` +
      `<text x="${PAD_L - 8}" y="${y + 3}" text-anchor="end" font-family="var(--font-mono)" font-size="9" fill="var(--fg-subtle)" letter-spacing="0.04em">${fmtShort(t)}</text>`
    );
  }).join('');

  // X-axis labels — every year for ≤3, otherwise start/mid/end.
  const xLabels = years <= 3
    ? Array.from({ length: years }, (_, i) => i)
    : [0, Math.floor(years / 2), years - 1];
  const xTickMarkup = xLabels.map((i) =>
    `<text x="${xFor(i)}" y="${CHART_H - 8}" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--fg-subtle)" letter-spacing="0.04em">Y${i + 1}</text>`
  ).join('');

  // End-of-series dots — growth drawn last so it lands on top.
  const dot = (vals, color, r) => {
    const i = vals.length - 1;
    return `<circle cx="${xFor(i)}" cy="${yFor(vals[i])}" r="${r}" fill="${color}" stroke="var(--bg-inset)" stroke-width="1.5"/>`;
  };

  const gradientId = `growthFill-${chartId}`;

  svg.innerHTML =
    '<defs>' +
      `<linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">` +
        '<stop offset="0%" stop-color="rgba(201,166,113,0.22)"/>' +
        '<stop offset="100%" stop-color="rgba(201,166,113,0)"/>' +
      '</linearGradient>' +
    '</defs>' +
    yTickMarkup +
    xTickMarkup +
    `<path d="${buildArea(series.growth)}" fill="url(#${gradientId})"/>` +
    `<path d="${buildPath(series.flat)}"   fill="none" stroke="var(--peak-slate-500)" stroke-width="1.5"/>` +
    `<path d="${buildPath(series.index)}"  fill="none" stroke="var(--peak-info)"      stroke-width="1.5" stroke-dasharray="3 3"/>` +
    `<path d="${buildPath(series.growth)}" fill="none" stroke="var(--peak-brass-400)" stroke-width="2"/>` +
    dot(series.flat,   'var(--peak-slate-500)', 3) +
    dot(series.index,  'var(--peak-info)',      3) +
    dot(series.growth, 'var(--peak-brass-400)', 4);
}

export default ProjectionChart;
