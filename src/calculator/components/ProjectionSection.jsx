import { fmt, project, projectionSeries } from '../calc.js';
import ProjectionChart from './ProjectionChart.jsx';
import useFlash from '../useFlash.js';

// One projection section — head + chart + three cards. Rendered twice
// (3yr and 10yr) with the same internal layout. Series and totals come
// from a single project() call so the chart and cards stay in sync.

const ProjectionCard = ({ kind, label, value, sub, hasData }) => {
  const flash = useFlash(value);
  return (
    <div className={`cal-proj-card cal-proj-card--${kind}`}>
      <span className="cal-pc-label">{label}</span>
      <span className={`cal-pc-val ${hasData ? '' : 'cal-placeholder'} ${flash}`}>{value}</span>
      <span className="cal-pc-sub">{sub}</span>
    </div>
  );
};

const ProjectionSection = ({ netMid, years, hasData, eyebrow, heading, note, chartId, growthSubBaseline }) => {
  const series = hasData
    ? projectionSeries(netMid, years)
    : { flat: Array(years).fill(0), growth: Array(years).fill(0), index: Array(years).fill(0) };
  const totals = hasData
    ? project(netMid, years)
    : { flat: 0, growth: 0, index: 0, yr1: 0, yrN: 0 };

  return (
    <section className="cal-res-section">
      <div className="cal-res-section-head">
        <h3>{heading}</h3>
        <div className="cal-note">{note}</div>
      </div>

      <div className="cal-proj-grid">
        <div className="cal-proj-chart-wrap">
          <div className="cal-proj-chart-legend">
            <span className="cal-legend-item"><span className="cal-legend-swatch cal-legend-swatch--flat"/>No growth</span>
            <span className="cal-legend-item"><span className="cal-legend-swatch cal-legend-swatch--growth"/>Decelerating growth</span>
            <span className="cal-legend-item"><span className="cal-legend-swatch cal-legend-swatch--index"/>S&amp;P reinvest</span>
          </div>
          <ProjectionChart series={series} years={years} chartId={chartId}/>
        </div>

        <div className="cal-proj-cards">
          <ProjectionCard
            kind="flat"
            label="No growth"
            value={hasData ? fmt(totals.flat) : '—'}
            sub={hasData ? `${fmt(netMid)} × ${years} years` : `Restaurant earnings × ${years}`}
            hasData={hasData}
          />
          <ProjectionCard
            kind="growth"
            label="Decelerating growth"
            value={hasData ? fmt(totals.growth) : '—'}
            sub={hasData ? `Y1 ${fmt(totals.yr1)} → Y${years} ${fmt(totals.yrN)}` : growthSubBaseline}
            hasData={hasData}
          />
          <ProjectionCard
            kind="index"
            label="If invested in S&P 500 · 10% / yr"
            value={hasData ? fmt(totals.index) : '—'}
            sub="Each year reinvested at 10%"
            hasData={hasData}
          />
        </div>
      </div>
    </section>
  );
};

export default ProjectionSection;
