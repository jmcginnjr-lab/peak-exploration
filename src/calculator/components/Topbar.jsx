import { useEffect, useState } from 'react';

// Live 12-hour clock — updates every 30s. Purely decorative per the
// README; the screen feels alive during a pitch.
const formatTime = (d) => {
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ap}`;
};

const Topbar = () => {
  const [ts, setTs] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTs(formatTime(new Date())), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="cal-topbar">
      <div className="cal-lockup">
        <img src="/assets/logos/peak-lockup-new.svg" alt="peak"/>
      </div>
      <div className="cal-topbar-right">
        <span className="cal-pill">
          <span className="cal-pill-dot" aria-hidden="true"/>
          Internal · sales
        </span>
        <span className="cal-ts">{ts}</span>
      </div>
    </div>
  );
};

export default Topbar;
