// Lazy entry for the marketing site. Owns marketing-only CSS imports so
// the calculator bundle doesn't pull them in. See src/main.jsx for the
// path-based dispatch.
import '../styles/_shared.css';
import './marketing.css';
import './scenes.css';
import MarketingSite from './MarketingSite.jsx';

export default MarketingSite;
