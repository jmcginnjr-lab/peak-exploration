// Sample restaurant data + preset scenarios.
// PEAK_DATA is what loads on first render and on "Reset sample".
// PRESETS map to the suggestion chips in the controls column — each entry
// is a partial update applied on top of current state.

export const FIELDS = [
  'totalTables',
  'totalSeats',
  'priceableTables',
  'avgSpend',
  'daysOpen',
  'turnsPerDay',
  'daysClosed',
];

export const SAMPLE_DATA = {
  restaurant:      'Halls Chophouse, Charleston SC',
  totalTables:     40,
  totalSeats:      160,
  priceableTables: 28,
  avgSpend:        140,
  daysOpen:        7,
  turnsPerDay:     2,
  daysClosed:      8,
  badges: {
    daysOpen: 'auto',
    totalTables: 'est',
    totalSeats: 'est',
    turnsPerDay: 'est',
    daysClosed: 'est',
    priceableTables: 'est',
    avgSpend: 'est',
  },
};

// Each preset value is either a literal or a fn(currentState) → number.
// Function form lets a preset reference other current fields (e.g.
// "55% of totalTables" for primeOnly).
export const PRESETS = {
  busyNight:    { label: 'Busy night service', glyph: '+', apply: { turnsPerDay: 3, daysOpen: 7, daysClosed: 5 } },
  primeOnly:    { label: 'Prime tables only',  glyph: '~', apply: { priceableTables: (d) => Math.round(d.totalTables * 0.55) } },
  weekendCrush: { label: 'Weekend crush',      glyph: '↑', apply: { turnsPerDay: 3.5, priceableTables: (d) => Math.round(d.totalTables * 0.7) } },
  tastingRoom:  { label: 'Tasting menu',       glyph: '$', apply: { avgSpend: 225, turnsPerDay: 1.5 } },
  sixDay:       { label: 'Closed Mondays',     glyph: '−', apply: { daysOpen: 6, daysClosed: 12 } },
};

// Slider min/max/step per field. Keeps the input ranges declarative —
// the React control reads from here instead of duplicating them.
export const FIELD_RANGES = {
  totalTables:     { min: 0, max: 120, step: 1, numMax: 200 },
  totalSeats:      { min: 0, max: 500, step: 5, numMax: 800 },
  priceableTables: { min: 0, max: 120, step: 1, numMax: 200 },
  avgSpend:        { min: 0, max: 350, step: 5, numMax: 500, currency: true },
  daysOpen:        { min: 1, max:   7, step: 1, numMax: 7 },
  turnsPerDay:     { min: 0, max:   6, step: 0.5, numMax: 6 },
  daysClosed:      { min: 0, max:  60, step: 1, numMax: 120 },
};

// Grouping for the controls panel — eyebrows + which fields go together.
export const FIELD_GROUPS = [
  { eyebrow: 'Capacity', fields: ['totalTables', 'totalSeats', 'priceableTables'] },
  { eyebrow: 'Service',  fields: ['daysOpen', 'turnsPerDay', 'daysClosed'] },
  { eyebrow: 'Spend',    fields: ['avgSpend'] },
];

// Display labels per field. Match the prototype exactly so screenshots
// stay valid for sales handouts.
export const FIELD_LABELS = {
  totalTables:     'Total tables',
  totalSeats:      'Total seats',
  priceableTables: 'Priceable tables',
  avgSpend:        'Avg spend / person',
  daysOpen:        'Days open / wk',
  turnsPerDay:     'Turns / day',
  daysClosed:      'Days closed / yr',
};

// ────────────────────────────────────────────────────────────────────────
// Restaurant library — what the headline's fuzzy search resolves against.
// Each entry mirrors the shape of SAMPLE_DATA but with values that make
// each pitch land differently. In production this gets replaced with a
// Google Places query; the shape stays the same.
// ────────────────────────────────────────────────────────────────────────
export const RESTAURANT_LIBRARY = [
  {
    id: 'halls', name: 'Halls Chophouse', location: 'Charleston, SC',
    totalTables: 40, totalSeats: 160, priceableTables: 28,
    avgSpend: 140, daysOpen: 7, turnsPerDay: 2, daysClosed: 8,
  },
  {
    id: 'normas', name: "Norma's", location: 'Palm Springs, CA',
    totalTables: 32, totalSeats: 120, priceableTables: 18,
    avgSpend: 85,  daysOpen: 7, turnsPerDay: 2.5, daysClosed: 14,
  },
  {
    id: 'aurelia', name: 'Aurelia', location: 'New York, NY',
    totalTables: 26, totalSeats: 96,  priceableTables: 26,
    avgSpend: 280, daysOpen: 6, turnsPerDay: 1.5, daysClosed: 4,
  },
  {
    id: 'pin', name: 'Pin', location: 'San Francisco, CA',
    totalTables: 22, totalSeats: 78,  priceableTables: 16,
    avgSpend: 165, daysOpen: 6, turnsPerDay: 2,   daysClosed: 12,
  },
  {
    id: 'fiola', name: 'Fiola', location: 'Washington, DC',
    totalTables: 38, totalSeats: 140, priceableTables: 30,
    avgSpend: 195, daysOpen: 6, turnsPerDay: 2,   daysClosed: 8,
  },
  {
    id: 'oriole', name: 'Oriole', location: 'Chicago, IL',
    totalTables: 18, totalSeats: 60,  priceableTables: 18,
    avgSpend: 325, daysOpen: 5, turnsPerDay: 1.5, daysClosed: 16,
  },
  {
    id: 'gjelina', name: 'Gjelina', location: 'Venice, CA',
    totalTables: 48, totalSeats: 180, priceableTables: 24,
    avgSpend: 75,  daysOpen: 7, turnsPerDay: 3,   daysClosed: 6,
  },
  {
    id: 'state', name: 'The State Bird Provisions', location: 'San Francisco, CA',
    totalTables: 28, totalSeats: 100, priceableTables: 22,
    avgSpend: 110, daysOpen: 6, turnsPerDay: 2.5, daysClosed: 10,
  },
];

// Simple substring matcher — case-insensitive, returns top N matches.
// `query` is matched against both name and location so a rep can type
// "charleston" and land Halls. Returns the library order for empty
// queries (so the dropdown still feels useful before they type).
export function matchRestaurants(query, limit = 5) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return RESTAURANT_LIBRARY.slice(0, limit);
  return RESTAURANT_LIBRARY.filter((r) => {
    const hay = `${r.name} ${r.location}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}
