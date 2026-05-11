# Handoff: Peak — Earnings Calculator

## Overview

An internal sales tool used by Peak's sales team during in-person pitches to restaurant operators. Salespeople enter (or auto-populate) basic restaurant facts — table count, service hours, average spend — and the calculator shows what the restaurant is currently leaving on the table by not dynamically pricing tables, plus 3-year and 10-year projection comparisons against doing nothing and against indexing to the S&P at 10% reinvestment.

Audience: Peak sales reps (operating the tool) and restaurant operators (viewing it over the rep's shoulder during pitches). Tone is confident, hospitality-native, never aggressive.

## About the Design Files

The HTML/CSS/JS files in this bundle are **design references** — a working prototype showing intended look, behavior, and math. They are not production code to lift directly. The task is to **recreate this design in Peak's existing codebase** using its established stack, component library, and conventions. If no codebase exists yet, choose an appropriate framework (e.g. React + TypeScript + Tailwind, or Next.js with CSS modules) and re-implement there.

The math, sample data shape, animation timing, and interaction model in the prototype are intentional and should be preserved. Visual structure should be matched closely but adapted to the target codebase's primitives (buttons, sliders, inputs) where those already exist.

## Fidelity

**High-fidelity.** Pixel-perfect mockup with final colors, typography, spacing, and interactions. Implement to match using the codebase's libraries and patterns. Treat exact spacing values, hex codes, and animation timings as the spec.

## Single-Page Layout

One screen, no routing. Structure top-to-bottom:

1. **Topbar** — Peak lockup (left), "Internal · sales" pill + live timestamp (right). Padding: 18px 24px. Hairline border-bottom.
2. **Title block** — eyebrow "Earnings calculator", H1 "What this restaurant is leaving on the table.", supporting paragraph (right side on desktop, below on mobile). Two-column on desktop (1fr / 1fr with a gap), single column under 1080px.
3. **Canvas** — the working surface. Single rounded card (border-radius 16px, 1px border) split into two columns:
   - **Controls column** (left, ~400px wide): restaurant lookup + grouped numeric inputs with paired sliders + suggestion chips.
   - **Results column** (right, fills remaining): annual stats + range bar + 3yr and 10yr projection charts and projection cards.
   The two columns share one continuous bordered surface with a 1px vertical divider between them. The controls column has its own background tone, slightly lighter than the page bg, slightly darker than the results area.

Max page width: 1320px. Page padding: 32px 40px 64px (desktop), 20px 16px 48px (≤1080px).

## Components

### Topbar
- Logo: `assets/logos/peak-lockup-new.svg`, height ~28px, displayed in brass.
- Status pill: 6px dot in brass + "Internal · sales" + 12px mono live time. Pill border 1px var(--border), border-radius 999px, padding 5px 12px.

### Title row
- Eyebrow: 11px uppercase mono, brass, with a leading 24px brass rule.
- H1: Schibsted Grotesk 600, ~52px desktop / 36px mobile, line-height 1.05, letter-spacing -0.02em. Accent words wrapped in `<em>` are rendered **upright** (not italic) in brass.
- Sub: Inter 400, 15px, var(--fg-muted), max-width ~46ch.

### Restaurant lookup
- Eyebrow "RESTAURANT" + horizontal flex row: text input (flex 1) + "Look up" button (brass background, ink text, 600 weight).
- Helper line below input: 12px mono, var(--fg-subtle), describes what "Look up" does. After population it briefly shows source ("from Google Places · 2.3s").

### Control row (one per input)
Grid: `1fr auto` × 2 rows.
- Row 1: label (with optional badge — "EST" amber / "AUTO" green) on the left, big editable number value on the right.
- Row 2: full-width slider that spans both columns.
- Hover/focus reveals a 2px brass rail on the left at `left: -28px`.
- Number input typography: Schibsted Grotesk 600, 22px, tabular-nums. Currency prefix in mono.
- Badge styles:
  - `.est`: color var(--peak-warning), bg rgba(194,146,68,0.10), border rgba(194,146,68,0.22), 9px uppercase mono, padding 1px 5px, radius 3px.
  - `.auto`: color var(--peak-success), bg rgba(107,142,90,0.12), border rgba(107,142,90,0.25).

### Slider (paired with each number input)
- Custom range input, track 3px tall, border-radius 2px.
- Fill: brass from 0% to current value; rest: var(--bg-inset).
- Thumb: 14px circle, var(--fg) fill, 2px brass ring, no shadow.
- Updates the paired number live; flashes the number value on change.

### Suggestion chips
A row of 5 pill buttons above the inputs, eyebrow "Quick scenarios". Clicking a chip applies a preset that mutates multiple controls at once.

Chip style: 11px Inter 500, transparent bg, var(--border) 1px, var(--fg-muted) text, leading mono glyph in subtle gray. Hover: brass text + brass border + faint brass-tinted bg. Padding 5px 11px, border-radius 999px.

Presets (see `Earnings Calculator.html` `PRESETS` const for canonical implementation):

| Chip | Effect |
|---|---|
| Busy night service | turnsPerDay → 3, daysOpen → 7, daysClosed → 5 |
| Prime tables only | priceableTables → round(totalTables × 0.55) |
| Weekend crush | turnsPerDay → 3.5, priceableTables → round(totalTables × 0.7) |
| Tasting menu | avgSpend → 225, turnsPerDay → 1.5 |
| Closed Mondays | daysOpen → 6, daysClosed → 12 |

Applying a preset triggers the same flash animation as a manual edit so the user sees what changed.

### Annual results block
Two-column on desktop (1.4fr / 1fr), single column under 1080px. Eyebrow "Annual earnings".
- **Range bar** (left): 8px tall pill bar, var(--bg-inset) base. Brass fill from Lo to Hi position. Two labeled tick markers ("LO $X" / "HI $Y") at the ends. Midpoint dot. Caption below shows the fee-band explanation and midpoint.
- **Stats column** (right): three rows — `% priced`, `$ per cover at 22.5% pricing`, `operating days/yr`. Each row has a small mono label + big number.

### Projection sections (3-year and 10-year)
Same internal layout, called twice with `years=3` and `years=10`.
- Section head: "3-YEAR PROJECTION" eyebrow + H3 "Three years compounded" (or "Ten years compounded"). Legend on the right with three swatches: Flat (slate), Peak growth (brass), S&P reinvest (info blue).
- Chart (SVG, 400×240 viewBox, fills width, fixed 240px height):
  - Y-axis: 3 tick gridlines at 0 / max/2 / max. Stroke `rgba(201,166,113,0.05)` (very faint). Labels in 9px mono, var(--fg-subtle), left-padded 42px.
  - X-axis: tick labels Y1…Y3 (3yr chart) or Y1, Y(mid), Y10 (10yr chart). 9px mono.
  - Flat series: solid 1.5px slate line.
  - Growth series: brass 2px line + area fill under it (linearGradient `growthFill-*` from `rgba(201,166,113,0.22)` to transparent).
  - Index series: dashed 1.5px info-blue line, `stroke-dasharray="3 3"`.
  - End-of-series dots (cx at last x, cy at last y): 3px slate, 3px info, 4px brass (drawn last so it's on top). Each dot has a 1.5px var(--bg-inset) stroke for separation.
  - No-data state: centered "AWAITING INPUTS" text in 10px mono, var(--fg-subtle).
- Projection cards (below chart, 3 stacked):
  - Each card is a 2px left border + 14px padded inner block. Borders: flat = slate-500, growth = brass-400, index = info.
  - Eyebrow label + big tabular-nums value + small mono caption underneath.

## Interactions & Behavior

### Input wiring
- Each numeric input has a paired slider (id suffix `_slider`). Editing either updates the other and recalculates everything immediately.
- Slider range/step values are defined per field on the `<input type="range">` element in the prototype.
- On any input change, the calculator recomputes, updates all derived values in the results column, flashes changed numbers, and re-animates the charts.

### Calculation (must be preserved exactly)
Variables: `tt` totalTables, `pt` priceableTables, `sp` avgSpend, `dw` daysOpen, `tp` turnsPerDay, `dc` daysClosed.

```
tablePrice = sp × 0.225           // per-table priced amount (22.5% of avg spend)
opDays     = max(0, dw × 52 − dc) // operating days per year
gross      = pt × tp × opDays × tablePrice
netLo      = gross × 0.70         // 30% Peak fee
netHi      = gross × 0.95         // 5% Peak fee
netMid     = gross × 0.825        // 17.5% midpoint
```

3yr and 10yr projection series (`project(netMid, years)`):
- **Flat**: `netMid × years` (no growth).
- **Growth**: year 1 = netMid × 1.15; subsequent years multiply by a decelerating growth rate (15% → 11% → 8% → … floor 5%). Cumulative sum.
- **Index**: each year's netMid reinvested at 10% annual return, cumulative. Same yearly cashflow as flat but compounded.

Preserve these numbers exactly — the sales narrative depends on them.

### Number flash animation
On value change, the result element gets a CSS class `flash` toggled (remove → reflow → add). The flash is a brass color pulse fading back to default over ~600ms. Don't flash placeholder "—".

### Chart animation
On every input change, the chart tweens between its previous values and new values over 480ms with `easeOutCubic`. Implement via requestAnimationFrame: store last-rendered series per chart, interpolate per-frame, re-draw SVG paths each frame. Cancel any in-flight rAF when a new update lands. See `renderChart` + `drawChart` in the prototype.

### No-data state
Until the four required inputs (priceableTables, avgSpend, daysOpen, turnsPerDay) are all > 0, results show "—" placeholders and charts show centered "AWAITING INPUTS" text. Range bar collapses to its empty state.

### Lookup button
In the prototype this is a stubbed action that populates the sample restaurant (Halls Chophouse, Charleston). In production it should call the Google Places API (or whatever data source Peak is using) and:
1. Set restaurant name.
2. Populate `daysOpen` from hours (and mark badge as `auto`).
3. Optionally estimate seats/tables from photos or POI category (badge stays `est`).
4. Show the source/latency in the helper line.

### Live timestamp in topbar
Updates every 30s. Format `4:14 PM` (12-hour, locale-dependent). Purely decorative — it's there so the screen feels alive during a pitch.

## Responsive Behavior

- **≥1081px**: two-column canvas, controls sticky to top of viewport.
- **≤1080px**: canvas stacks to single column. Controls column becomes a static block with its own background tone (no gradient trickery needed since columns no longer sit side-by-side). Annual block stacks. Projection cards stack below charts.
- **≤560px**: tighter horizontal padding on both columns (18px). Lookup row wraps if needed. Topbar wraps into a stacked left-aligned layout.

## State Management

State is intentionally simple — there's no persistence and no server round-trip beyond the (currently stubbed) restaurant lookup.

Required state (per-session, in-memory):
- `restaurant` (string) — current restaurant identifier.
- 7 numeric inputs — `totalTables`, `totalSeats`, `priceableTables`, `avgSpend`, `daysOpen`, `turnsPerDay`, `daysClosed`.
- `badges` map (per-field) — `'est' | 'auto' | undefined`, used to label which inputs came from a lookup vs. an estimate vs. user entry.
- Derived: everything in the results column is computed from inputs; no separate state.
- Chart animation: last-rendered series per chart (used as the "from" for the next tween).

The prototype exposes a `peakIngest({ restaurant, totalTables, totalSeats, priceableTables, avgSpend, daysOpen, turnsPerDay, daysClosed, badges })` function on `window` for programmatic data load — production code should keep an equivalent entry point so the lookup pipeline can drive the form.

## Design Tokens

All tokens come from Peak's master `colors_and_type.css` (included in this bundle). Use these in the target codebase's theme system instead of redefining them.

### Color — primitives

| Token | Hex | Notes |
|---|---|---|
| `--peak-ink-900` | `#0E1A16` | Page bg (deep forest near-black) |
| `--peak-ink-800` | `#12221D` | Elevated surface (results column bg) |
| `--peak-ink-700` | `#1A2E28` | Card / panel |
| `--peak-ink-600` | `#243830` | Hairline fills |
| `--peak-ink-500` | `#2F4A3F` | Subtle accent on dark |
| `--peak-brass-400` | (brass — see colors_and_type.css) | Primary accent |
| `--peak-success` | green |
| `--peak-warning` | amber |
| `--peak-info` | blue |
| `--peak-slate-500` | mid-slate | Used for "flat" chart series |

Additional canvas-specific tone (defined inline in the prototype):
- `--controls-bg: #0F1C18` — controls column background. Sits between `--bg` (`#0E1A16`) and `--bg-elev` (`#12221D`).

### Color — semantic (dark theme, default)

| Token | Maps to |
|---|---|
| `--bg` | `--peak-ink-900` |
| `--bg-elev` | `--peak-ink-800` |
| `--bg-card` | `--peak-ink-700` |
| `--bg-inset` | `#0A1512` |
| `--fg` | `#F2EDE3` (warm bone) |
| `--fg-muted` | `#A9B0AB` |
| `--fg-subtle` | `#6F7872` |
| `--accent` | `--peak-brass-400` |
| `--fg-on-brass` | `--peak-ink-900` |
| `--border` | (see colors_and_type.css) |
| `--divider` | (see colors_and_type.css) |

### Typography

| Token | Family | Usage |
|---|---|---|
| `--font-sans` | Inter | Body, UI |
| `--font-display` | Schibsted Grotesk | H1, big numbers |
| `--font-mono` | (see colors_and_type.css) | Labels, eyebrows, tick labels, captions |

Type sizes used:
- H1: 52px / 36px (desktop / mobile), Schibsted Grotesk 600, line-height 1.05, letter-spacing -0.02em.
- H3 (section heads): 22px, Schibsted Grotesk 600, letter-spacing -0.01em.
- Big number value (inputs + results): 22–28px depending on context, Schibsted Grotesk 600, tabular-nums.
- Body: 15px, Inter 400.
- Eyebrow: 11px Inter 500, uppercase, letter-spacing ~0.16em.
- Caption / sub: 12–13px Inter 400, var(--fg-muted).
- Tick labels / mono helpers: 9–10px mono, var(--fg-subtle), letter-spacing 0.04–0.08em.

**No italics anywhere.** Where `<em>` is used inside H1 for accent, it renders upright in brass — not slanted.

### Spacing scale
The prototype uses ad-hoc spacing rather than a strict scale. Common values:
- 4 / 6 / 8 / 10 / 12 / 14 / 18 / 22 / 28 / 32 / 40 / 44 / 64 px.

### Radii
- `--radius-sm`: 6px (small chips, inputs)
- `--radius-md`: 8–10px (number inputs, pills)
- `--radius-lg`: 16px (canvas card)
- 999px (full-pill chips, range bar, dot indicators)

### Other
- Hairline border: 1px solid `var(--border)`.
- Dashed dividers between fact rows: `1px dashed var(--divider)`.
- Chart gridline stroke: `rgba(201,166,113,0.05)` (very faint brass).
- Chart growth area fill: linearGradient `rgba(201,166,113,0.22)` → `rgba(201,166,113,0)` top to bottom.

## Assets

- `assets/logos/peak-lockup-new.svg` — the Peak wordmark + summit glyph. Already in brass. Displayed at ~28px height in the topbar.
- No other imagery; everything else is rendered with CSS / inline SVG.

## Files in This Bundle

- `Earnings Calculator.html` — the working prototype, all-in-one. Contains styles, markup, sample data, math, slider/number linkage, preset definitions, flash + chart animations.
- `colors_and_type.css` — Peak's brand tokens (colors, typography, semantic variables). Lift the tokens into the target codebase's theme.
- `assets/logos/peak-lockup-new.svg` — logo.

## Implementation Checklist

1. Set up brand tokens (colors + typography) from `colors_and_type.css` in the target codebase's theme system.
2. Build the canvas shell with two-column grid + responsive collapse.
3. Build the reusable Control row (label + badge + number input + slider) — paired-input wiring.
4. Build the SuggestionChip component + preset application.
5. Implement the calc + projection functions exactly as specified.
6. Build the range bar component.
7. Build the chart component (SVG, multi-series, with no-data state).
8. Add chart tweening (480ms easeOutCubic, per-chart in-flight rAF).
9. Add the flash animation on number changes.
10. Wire up the (stubbed) lookup button and `peakIngest` programmatic entry point.
11. Test responsive breakpoints at 1080px and 560px.
