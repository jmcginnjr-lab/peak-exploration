import { useEffect, useRef, useState } from 'react';
import { matchRestaurants } from '../data.js';

// Inline editable restaurant name with fuzzy dropdown.
//
//   Idle:  "What [your restaurant] is leaving on the table."
//          ^^ dotted-underline placeholder, clickable to enter the input.
//
//   Set:   "What [Halls Chophouse] is leaving on the table."
//          ^^ solid brass underline; click to edit again.
//
//   Edit:  the slot becomes a transparent input that auto-fits the typed
//          string. A dropdown of fuzzy matches floats below; click a row
//          (or Arrow-Down + Enter) to select. Plain Enter on a no-match
//          query still submits the raw string so the rep can use a
//          restaurant name that isn't in the library.

const HeadlineRestaurant = ({
  restaurant,
  draftQuery,
  onDraftChange,
  onSelectMatch,            // (libraryEntry) — selecting a fuzzy hit
  onSubmit,                 // (rawQuery)     — Enter on no match
  defaultPlaceholder = 'your restaurant',
  inputPlaceholder   = 'search…',
}) => {
  const [editing, setEditing] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const sizerRef = useRef(null);
  const [inputWidth, setInputWidth] = useState('auto');

  // Re-query on every keystroke. Substring is fast enough for ~8 items.
  const matches = matchRestaurants(draftQuery, 5);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      setHighlighted(0);
    }
  }, [editing]);

  // Width tracks the typed text + a few px of breathing room. Hidden
  // sizer mirrors the input's typography for accurate measurement.
  useEffect(() => {
    if (!editing || !sizerRef.current) return;
    const w = sizerRef.current.offsetWidth + 12;
    setInputWidth(`${Math.max(140, Math.min(460, w))}px`);
  }, [editing, draftQuery]);

  // Reset highlight to 0 when match list shrinks below current pointer.
  useEffect(() => {
    if (highlighted >= matches.length) setHighlighted(0);
  }, [matches.length, highlighted]);

  // Click-away closes the dropdown without committing. Keeps the input
  // open if focus is still inside the wrapper.
  useEffect(() => {
    if (!editing) return undefined;
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) {
        commit(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  });

  const beginEdit = () => {
    onDraftChange(restaurant || '');
    setEditing(true);
  };

  const commit = (explicitMatch) => {
    if (explicitMatch) {
      onSelectMatch(explicitMatch);
      setEditing(false);
      return;
    }
    // Enter with no explicit match → take top result if there is one,
    // otherwise submit the raw query so the rep isn't blocked when the
    // library doesn't have their restaurant.
    if (matches[0] && (draftQuery || '').trim()) {
      onSelectMatch(matches[0]);
    } else if ((draftQuery || '').trim()) {
      onSubmit(draftQuery.trim());
    }
    setEditing(false);
  };

  const cancel = () => {
    onDraftChange(restaurant || '');
    setEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const pick = matches[highlighted];
      commit(pick || null);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'ArrowDown' && matches.length) {
      e.preventDefault();
      setHighlighted((h) => Math.min(matches.length - 1, h + 1));
    } else if (e.key === 'ArrowUp' && matches.length) {
      e.preventDefault();
      setHighlighted((h) => Math.max(0, h - 1));
    }
  };

  const labelText = restaurant || defaultPlaceholder;
  const isDefault = !restaurant;

  return (
    <h1 className="cal-page-h">
      What{' '}
      {editing ? (
        <span className="cal-headline-edit" ref={wrapRef}>
          <input
            ref={inputRef}
            className="cal-headline-input"
            value={draftQuery}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={inputPlaceholder}
            style={{ width: inputWidth }}
            aria-label="Restaurant name"
            spellCheck={false}
            autoComplete="off"
          />
          <span ref={sizerRef} className="cal-headline-input-sizer" aria-hidden="true">
            {draftQuery || inputPlaceholder}
          </span>

          {matches.length > 0 && (
            <ul className="cal-headline-dropdown" role="listbox">
              {matches.map((r, i) => (
                <li
                  key={r.id}
                  role="option"
                  aria-selected={i === highlighted}
                  className={`cal-headline-option ${i === highlighted ? 'is-highlighted' : ''}`}
                  // mousedown so we beat the input's blur → click race.
                  onMouseDown={(e) => { e.preventDefault(); commit(r); }}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  <span className="cal-headline-option-name">{r.name}</span>
                  <span className="cal-headline-option-loc">{r.location}</span>
                </li>
              ))}
            </ul>
          )}
        </span>
      ) : (
        <button
          type="button"
          className={`cal-headline-name ${isDefault ? 'is-default' : 'is-set'}`}
          onClick={beginEdit}
          aria-label={isDefault ? 'Choose a restaurant' : `Restaurant: ${restaurant}. Click to change.`}
        >
          {labelText}
        </button>
      )}{' '}
      is leaving <em>on the table.</em>
    </h1>
  );
};

export default HeadlineRestaurant;
