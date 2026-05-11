import { fmt } from '../calc.js';
import useFlash from '../useFlash.js';

// Annual block: range bar (left) + stats column (right).
// The range bar visualizes the fee-band: full-width fill from 5% (Hi)
// to 30% (Lo) Peak fee. The midpoint marker pins the 17.5% Peak fee.

const Stat = ({ label, value, sub }) => {
  const flash = useFlash(value);
  return (
    <div className="cal-ast">
      <span className="cal-ast-k">{label}</span>
      <span className={`cal-ast-v ${flash}`}>{value}</span>
      <span className="cal-ast-s">{sub}</span>
    </div>
  );
};

const AnnualSection = ({ inputs, derived }) => {
  const { tablePrice, opDays, netLo, netHi, netMid,
          pricedPct, hasData } = derived;

  const netLoStr = hasData ? fmt(netLo) : '—';
  const netHiStr = hasData ? fmt(netHi) : '—';
  const tablePriceStr = inputs.avgSpend > 0 ? fmt(tablePrice) : '—';
  const opDaysStr = inputs.daysOpen > 0 ? opDays.toLocaleString() : '—';
  const pricedPctStr = pricedPct !== null ? `${pricedPct}%` : '—';

  const flashLo = useFlash(netLoStr);
  const flashHi = useFlash(netHiStr);

  return (
    <section className="cal-res-section">
      <div className="cal-res-section-head">
        <h3>Annual <em>earnings on Peak</em></h3>
        <div className="cal-note">After Peak fee · 5%–30%</div>
      </div>

      <div className="cal-annual">
        <div className="cal-annual-range">
          <div className="cal-ar-eyebrow">Restaurant keeps · per year</div>
          <div className="cal-ar-nums">
            <span className={`cal-ar-num cal-ar-num--lo ${hasData ? '' : 'cal-placeholder'} ${flashLo}`}>
              {netLoStr}
            </span>
            <span className="cal-ar-dash">→</span>
            <span className={`cal-ar-num ${hasData ? '' : 'cal-placeholder'} ${flashHi}`}>
              {netHiStr}
            </span>
          </div>
          <div className="cal-ar-bar-ticks">
            <span>5% fee</span>
            <span>17.5% midpoint</span>
            <span>30% fee</span>
          </div>
          <div className="cal-ar-bar">
            <div className="cal-ar-bar-fill"/>
            <div className="cal-ar-bar-mid"/>
          </div>
          <div className="cal-ar-foot">
            {hasData ? (
              <>Range reflects Peak fee of 5%–30%. Midpoint <strong>{fmt(netMid)}/yr</strong> at 17.5% fee.</>
            ) : (
              <>Fill in priceable tables and avg spend to see results.</>
            )}
          </div>
        </div>

        <div className="cal-annual-stats">
          <Stat
            label="Avg table price"
            value={tablePriceStr}
            sub="22.5% of avg spend"
          />
          <Stat
            label="Operating days / yr"
            value={opDaysStr}
            sub={inputs.daysOpen > 0 ? `${inputs.daysOpen} days/wk · ${inputs.daysClosed} closed` : '—'}
          />
          <Stat
            label="Priceable share"
            value={pricedPctStr}
            sub={inputs.totalTables > 0 && inputs.priceableTables > 0
              ? `${inputs.priceableTables} of ${inputs.totalTables} tables`
              : 'of total tables'}
          />
        </div>
      </div>
    </section>
  );
};

export default AnnualSection;
