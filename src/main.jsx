import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

// Route dispatch based on URL path. Two entry points:
//   /            → marketing site
//   /calculator  → internal sales tool (URL-only, no link from marketing)
// Each entry lazily imports its own bundle + CSS so marketing visitors
// never download the calculator code and vice versa.
//
// BASE_URL respects Vite's `base` config so /calculator works the same
// way under a project-page deploy (e.g. username.github.io/peak/) where
// the actual URL is /peak/calculator.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
const path = window.location.pathname.replace(/\/+$/, '');
const isCalculatorPath = path === `${BASE}/calculator`;

const MarketingApp  = lazy(() => import('./marketing/MarketingApp.jsx'));
const CalculatorApp = lazy(() => import('./calculator/CalculatorApp.jsx'));

const App = isCalculatorPath ? CalculatorApp : MarketingApp;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
)
