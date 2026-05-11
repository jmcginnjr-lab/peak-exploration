# Peak — marketing site + earnings calculator

Single Vite + React app with two SPA routes:

| Route          | What it is                                     | Public? |
|----------------|------------------------------------------------|---------|
| `/`            | Marketing landing page                         | Yes     |
| `/calculator`  | Internal sales calculator (URL-only; not linked anywhere) | No  |

The two routes are code-split — visitors to `/` never download the calculator bundle and vice versa.

## Running locally

```bash
npm install
npm run dev
```

Serves at <http://localhost:5173/>. The calculator is at <http://localhost:5173/calculator>.

## Production build

```bash
npm run build
```

Output is in `dist/`. Preview the production build with `npm run preview`.

## Deploying to GitHub Pages

GitHub Pages doesn't natively do SPA path rewriting, so a `404.html` shim
is required for `/calculator` (and any other client-side route) to load
correctly when typed directly. The included `build:gh-pages` script
handles this by copying `dist/index.html` → `dist/404.html` after the
build. GH Pages then serves that copy for any unknown path, the SPA
boots, reads `window.location.pathname`, and renders the right route.

Three ways to ship it — pick whichever fits your workflow.

### Option A — Custom domain or user/org page

If the site will live at a **custom domain** (e.g. `peak.example.com`) or a **user / org page** (e.g. `peak-hospitality.github.io`), nothing else needs configuring — Vite's default `base: '/'` is correct.

**Deploy from your laptop (one command):**

```bash
npm install
npm run deploy
```

That runs `vite build`, writes the 404 shim, and pushes `dist/` to a
`gh-pages` branch via the `gh-pages` npm package. In GitHub repo
settings → Pages, set **Source = "Deploy from a branch"** and pick
`gh-pages` / `(root)`.

For a custom domain, add a `public/CNAME` file with the domain (e.g. `peak.example.com`) — Vite copies it into `dist/` on build.

**Deploy via GitHub Actions:**

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds + deploys automatically. Enable it once in **repo settings → Pages → Source = "GitHub Actions"**.

### Option B — Project page (`username.github.io/repo-name/`)

Vite needs the base so its own emitted asset URLs (the bundled JS/CSS in `index.html`) are correct:

```bash
BASE_PATH=/repo-name/ npm run deploy
```

**Caveat — JSX asset references.** The site uses plain string paths in JSX (`<img src="/assets/logos/peak-lockup-new.svg">`, video sources, etc.) — Vite **doesn't** rewrite those at build time. Under a project-page deploy they'd 404 because the actual URL becomes `/repo-name/assets/...`.

If a project page is the only option, you have two paths:

1. Search-and-replace `/assets/` → `${import.meta.env.BASE_URL}assets/` across `src/` (about a dozen call sites), or
2. Move them to `import` statements so Vite bundles them through its asset pipeline.

Option A (custom domain or user/org page) avoids all this — strongly recommended.

## Project layout

```
src/
  main.jsx                 entry + route dispatch (lazy)
  marketing/               landing page (Marketing bundle)
  calculator/              sales calculator (Calculator bundle)
  styles/                  shared resets
public/                    static assets served verbatim
calculator/                design reference (HTML prototype + tokens)
                           — not shipped; just docs for the React port
```

## Notes for the developer who picks this up

- Two routes, one Vite app. Both share `index.html` and `main.jsx` but pull entirely separate bundles.
- The calculator is intentionally not linked from anywhere on the marketing site. It's a sales tool reps share by URL.
- Smooth scroll on the landing page is handled by [Lenis](https://github.com/darkroomengineering/lenis); only mounted on the marketing route.
- Brand tokens for the calculator live in `src/calculator/tokens.css`. The marketing site has its own tokens scoped inside `src/styles/_shared.css` + `src/marketing/*.css`.
- Asset paths in JSX use plain absolute strings (`/assets/...`). Works out of the box under base `/` (Option A); needs the rewrites described in Option B otherwise.
