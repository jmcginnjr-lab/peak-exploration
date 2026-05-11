// Lazy entry for the calculator. Owns calculator-only CSS imports so
// the marketing bundle doesn't pull them in. See src/main.jsx for the
// path-based dispatch — this module is only fetched when the URL is
// /calculator.
import './tokens.css';
import './calculator.css';
import CalculatorPage from './CalculatorPage.jsx';

export default CalculatorPage;
