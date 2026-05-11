// Calculator math — ported verbatim from the prototype. Numbers and the
// sales narrative depend on these exact values, so don't tweak the
// constants without coordinating with sales. See calculator/README.md.

// ── Formatting ──────────────────────────────────────────────────────────
export function fmt(n) {
  if (!isFinite(n) || n === 0) return '$0';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function fmtShort(n) {
  if (!isFinite(n)) return '—';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + Math.round(n);
}

// ── Growth model ────────────────────────────────────────────────────────
// Decelerating growth: starts at 15% in Y1, multiplies by 0.75 each
// subsequent year, floored at 3%. (Y1 15% → Y2 11.25% → Y3 8.4% → ...)
export function growthRate(y) {
  return Math.max(0.03, 0.15 * Math.pow(0.75, y));
}

// Project totals over `years` years given `base` annual midpoint earnings.
// Returns flat total, decelerating-growth cumulative, and S&P-reinvest
// cumulative — plus Y1 / YN amounts for caption strings.
export function project(base, years) {
  const flat = base * years;
  let growth = 0;
  let yr = base;
  const yVals = [];
  for (let i = 0; i < years; i++) {
    growth += yr;
    yVals.push(yr);
    yr *= 1 + growthRate(i);
  }
  let idx = 0;
  for (let j = 0; j < years; j++) {
    idx = (idx + yVals[j]) * (j < years - 1 ? 1.10 : 1);
  }
  return { flat, growth, index: idx, yr1: base, yrN: yVals[years - 1], yVals };
}

// Per-year cumulative series for charting.
export function projectionSeries(base, years) {
  const flatS = [], growthS = [], indexS = [];
  let yr = base, growthAccum = 0, idxAccum = 0;
  for (let i = 0; i < years; i++) {
    flatS.push(base * (i + 1));
    growthAccum += yr;
    growthS.push(growthAccum);
    idxAccum = (idxAccum + yr) * (i < years - 1 ? 1.10 : 1);
    indexS.push(idxAccum);
    yr *= 1 + growthRate(i);
  }
  return { flat: flatS, growth: growthS, index: indexS };
}

// Round up to a nice axis-friendly ceiling (1, 2, 2.5, 5, 10 × 10^N).
export function niceCeil(n) {
  if (n <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const norm = n / mag;
  let nice;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 2.5) nice = 2.5;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

// ── Annual derived block ────────────────────────────────────────────────
// Centralizes the calc the README pins down:
//   tablePrice = avgSpend × 0.225
//   opDays     = max(0, daysOpen × 52 − daysClosed)
//   gross      = priceableTables × turnsPerDay × opDays × tablePrice
//   netLo/Hi   = gross × 0.70 / 0.95   (30% / 5% Peak fee)
//   netMid     = gross × 0.825         (17.5% midpoint)
export function deriveAnnual(inputs) {
  const { totalTables: tt, priceableTables: pt, avgSpend: sp,
          daysOpen: dw, turnsPerDay: tp, daysClosed: dc } = inputs;

  const tablePrice = sp * 0.225;
  const opDays     = Math.max(0, Math.round(dw * 52) - dc);
  const gross      = pt * tp * opDays * tablePrice;

  const netLo  = gross * 0.70;
  const netHi  = gross * 0.95;
  const netMid = gross * 0.825;

  const pricedPct = (tt > 0 && pt > 0) ? Math.round((pt / tt) * 100) : null;
  const hasData   = sp > 0 && pt > 0 && dw > 0 && tp > 0;

  return { tablePrice, opDays, gross, netLo, netHi, netMid, pricedPct, hasData };
}
