import { useState } from 'react';

// Restaurant lookup. In the prototype this is stubbed; production
// integrates with Google Places (see calculator/README.md §"Lookup
// button"). The status line below the field tells the rep what
// happened — current request, found data + source, or instructions to
// drop the query into chat in standalone mode.

const STATUS_DEFAULT = { tone: '', text: 'Press look up to populate hours & capacity.' };

const Lookup = ({ query, onQueryChange, onLookup, status }) => {
  const [busy, setBusy] = useState(false);

  const trigger = async () => {
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    try {
      await onLookup(q);
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); trigger(); }
  };

  const resolved = status || STATUS_DEFAULT;

  return (
    <div>
      <div className="cal-lookup-eyebrow">Restaurant</div>
      <div className="cal-lookup-field">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. Norma's Palm Springs"
        />
        <button type="button" onClick={trigger} disabled={busy}>Look up</button>
      </div>
      <div className={`cal-lookup-status${resolved.tone ? ' cal-lookup-status--' + resolved.tone : ''}`}>
        {resolved.text}
      </div>
    </div>
  );
};

export default Lookup;
