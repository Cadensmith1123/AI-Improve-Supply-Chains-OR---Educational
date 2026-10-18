# Oregon Supply Chain Optimization — Project Context for IDE Copilot

> Paste this file into the root of the React project as `PROJECT_CONTEXT.md`, and ask your IDE Copilot to use it as the source of truth for future work.

## 1. Project overview

- **Working project name:** Oregon Supply Chain Optimization / AI Supply Chains Small Farms.
- **Purpose:** An interactive, portfolio-quality web application for exploring Oregon agricultural transportation routes, operational costs, and route profitability.
- **Audience:** Recruiters, developers, and people interested in agricultural logistics. Visitors should be able to use the app without registering.
- **Data:** Entirely **synthetic / fictional** farms, customers, routes, prices, costs, and analytics. No production dataset or account service is required.
- **UX goal:** A polished, responsive analytics tool combining a *rustic, vintage, retro-modern Pacific Northwest visual identity* with clear, contemporary SaaS usability.
- **Current approach:** Frontend-only React app; no paid backend or database. Calculations run in the browser. Optional scenario saves use `localStorage`.
- **AI positioning:** Optimization recommendations can be produced by clearly described deterministic logic, or displayed as **simulated recommendations**. Do not imply a live ML model exists unless one is actually implemented.

## 2. Technology and environment

| Area | Decision |
|---|---|
| Framework | React + Vite |
| Language | TypeScript |
| Styling | Plain CSS with design tokens initially; Tailwind is optional, not yet installed |
| Charts | Recharts, when we reach chart development |
| Maps | React Leaflet / Leaflet, when needed; observe tile-provider usage terms |
| Icons | Lucide React, when installed |
| Demo data | Local TypeScript modules / JSON |
| Persistence | Browser `localStorage` for optional saved scenarios |
| Hosting target | Vercel (eligible personal deployments may use free Hobby tier) |
| OS / terminal | Windows / VS Code PowerShell |
| Workspace | `C:\Users\caden\AI Supply Chains Small Farms` |
| Node tested | `v24.18.0` |
| npm tested | `11.16.0` |

Do **not** assume optional packages (Recharts, Leaflet, Lucide React, Tailwind) have been installed yet. Verify `package.json` before importing them.

## 3. Branding — Heritage Timber (selected and final default)

Brand direction: **Oregon timber-and-agriculture heritage meets modern logistics intelligence**. Warm, grounded, refined; not cowboy kitsch, not a generic blue corporate dashboard.

### Official core palette

| Name | Hex | Intended usage |
|---|---|---|
| Dark Walnut | `#30251E` | Primary dark navigation, text, strong surfaces |
| Timber Brown | `#624737` | Primary actions, supporting headings |
| Aged Leather | `#AD805B` | Highlights, accent graphics, secondary chart series |
| Warm Sand | `#D7C5AC` | Borders, dividers, subtle controls |
| Ivory | `#F3EADF` | Main page background |

### Supporting colors

| Name/role | Hex |
|---|---|
| Soft Cream / card surface | `#FFFAF3` |
| Muted body copy | `#756251` |
| Primary button hover | `#483226` |
| Positive / Forest Sage | `#546B50` |
| Warning / Burnt Sienna | `#9B572F` |
| Error / Rustic Red | `#A04439` |
| Fuel / Mustard | `#C39149` |
| Other chart series | `#8B8174` |

### Typography

- **Fraunces** — display text, page headers, hero messages, large feature headings. Use sparingly.
- **DM Sans** — navigation, body copy, buttons, forms, tables. Main UI font.
- **IBM Plex Mono** — monetary values, route IDs, distances, numeric KPIs.

Font source currently used in CSS: Google Fonts CSS `@import`.

### Style conventions

- Light ivory canvas; warm-cream cards; dark-walnut sidebar/header.
- Minimal borders in warm sand; subtle shadows rather than heavy elevation.
- Use `14px` card radius and `8px` form/button radius by default.
- Consistent card padding and spacing; generous whitespace.
- Prefer readable, clearly labeled charts. Color meanings: sage = good/positive, sienna = caution, rustic red = negative.
- Ensure readable color contrast, visible focus states, keyboard support and mobile responsiveness.
- Brand copy: practical, assured, regionally rooted. Keep calculator labels specific; do not overdecorate data-heavy screens.
- No user login required for the portfolio demo.

### Design token CSS (current baseline)

The initial setup placed these in `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  --color-walnut: #30251E;
  --color-timber: #624737;
  --color-leather: #AD805B;
  --color-sand: #D7C5AC;
  --color-ivory: #F3EADF;

  --bg-page: #F3EADF;
  --bg-card: #FFFAF3;
  --bg-sidebar: #30251E;
  --bg-input: #FFFAF3;

  --text-primary: #30251E;
  --text-secondary: #624737;
  --text-muted: #756251;
  --text-inverse: #F3EADF;

  --button-primary: #624737;
  --button-primary-hover: #483226;
  --button-text: #FFFFFF;
  --border-default: #D7C5AC;
  --focus-ring: #624737;

  --chart-revenue: #546B50;
  --chart-cost: #AD805B;
  --chart-labor: #624737;
  --chart-fuel: #C39149;
  --chart-other: #8B8174;

  --color-success: #546B50;
  --color-warning: #9B572F;
  --color-danger: #A04439;

  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'DM Sans', Arial, sans-serif;
  --font-data: 'IBM Plex Mono', monospace;

  --radius-card: 14px;
  --radius-control: 8px;
  --shadow-card: 0 4px 18px rgba(48, 37, 30, 0.06);
}
```

Global styles also set border-box sizing, body margin `0`, `min-width: 320px`, a warm page background, inherited form fonts, and visible `:focus-visible` outlines. Current `src/App.css` is intended to contain:

```css
#root {
  width: 100%;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  background: var(--bg-page);
}
```

## 4. Core user experience

**Default landing page: Route Calculator, not an authentication page.** Portfolio visitors should be able to calculate a route in seconds.

Suggested first-run experience:

1. Open the web app and see a branded application shell (nav/sidebar, page heading, clear tool description).
2. See a **prepopulated fictional example route**, with a prominent **Calculate Route** action; provide a clear **Reset Demo** action.
3. Edit values such as origin, destination, mileage, fuel economy, fuel price, labor time/rate, payload, delivery revenue, and other expenses.
4. Calculate estimated fuel costs, labor costs, other expenses, total transportation cost, revenue, profit, margin, and cost per mile.
5. See the resulting cost breakdown in summary cards and charts, plus optional map visualization when mapping is integrated.
6. Optionally save and compare fictional scenarios in browser storage. Make it explicit that saves belong to the current browser only.

No signup wall, no fabricated user profiles or login flows. A simple `Demo Workspace` header label can communicate the environment.

### Suggested primary navigation

- **Route Calculator** (homepage / primary workflow)
- **Route Map** (optional mapping screen)
- **Analytics** (aggregated synthetic scenarios and charts)
- **Saved Scenarios** (local browser storage)
- **About / Methodology** (explain assumptions and fictional data)

Keep initial implementation lean. Prioritize a working calculator before adding decorative pages.

## 5. Proposed file structure

The folders were created during the initial setup instructions. **Confirm they actually exist** before assuming completion.

```text
AI Supply Chains Small Farms/
├── public/
│   └── images/
├── src/
│   ├── assets/                  # Vite default, if still present
│   ├── components/
│   │   ├── layout/              # App shell, sidebar, header
│   │   ├── ui/                  # Buttons, cards, inputs
│   │   ├── calculator/          # Inputs and cost breakdown
│   │   ├── charts/              # Recharts components later
│   │   └── maps/                # Leaflet components later
│   ├── pages/                   # Calculator, Analytics, Routes, etc.
│   ├── data/                    # Synthetic sample data
│   ├── utils/                   # Pure calculation functions
│   ├── styles/                  # Shared styles as needed
│   ├── types/                   # Data types / interfaces
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # Shared state, only if needed
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Empty directories are not committed by Git until they have tracked files.

## 6. Status at handoff

Previous setup walkthrough covered:

1. **Node/npm verification** — successful (`node -v` / `npm -v`).
2. **Create React/Vite app** in current directory with `npm create vite@latest . -- --template react-ts`.
3. **Install and start** with `npm install` and `npm run dev` (default `http://localhost:5173/`).
4. **Create source folders** using a PowerShell script.
5. **Apply Heritage Timber CSS** to `src/index.css`, and remove starter constraints from `src/App.css`.

The user replied "next" after steps 2–4 and has been given step 5 instructions; **whether step 5 was saved has not been independently verified**. Copilot should inspect the actual repository before making further edits.

**The default Vite starter `App.tsx` may still be present.** The next intended development task is to create the branded app shell and route calculator landing layout, then build the working calculator.

## 7. Recommended feature implementation order

1. Verify current files (`package.json`, `src/index.css`, `src/App.css`, `src/App.tsx`).
2. Replace the starter page with a branded, responsive **app shell** including sidebar/header, `Demo Workspace` marker, and the Route Calculator homepage.
3. Define clear TypeScript types for route inputs and calculated results.
4. Implement a standalone pure cost-calculation utility with validation; make assumptions explicit.
5. Build form inputs, calculation action, computed KPI cards, and cost-breakdown display.
6. Add sample fictional Oregon routes/farms/customers and reset-to-demo behavior.
7. Add charts with Recharts; use the Heritage Timber chart palette.
8. Add optional browser-local scenario persistence and comparison.
9. Add mapping with Leaflet and a permitted tile source if useful.
10. QA responsive/mobile layout, accessibility, calculation accuracy, and deploy to Vercel.

### Calculation conventions (proposal; verify with user before treating as requirements)

Potential formulas for a **one-way route**:

- `fuelGallons = distanceMiles / mpg`
- `fuelCost = fuelGallons * fuelPricePerGallon`
- `laborCost = routeHours * hourlyLaborRate`
- `totalCost = fuelCost + laborCost + additionalExpenses`
- `profit = routeRevenue - totalCost`
- `marginPercent = routeRevenue > 0 ? (profit / routeRevenue) * 100 : null`
- `costPerMile = distanceMiles > 0 ? totalCost / distanceMiles : null`

Clarify whether the user's route uses one-way or round-trip mileage and whether overhead/vehicle wear is included. Validate that user inputs are finite, nonnegative where relevant, and that MPG is strictly positive. Label cost projections as estimates, not audited figures.

## 8. Engineering expectations for Copilot

- Treat this document as the product/design brief, **not** proof of the current filesystem state.
- Use **React function components and TypeScript**, clear component names, and small reusable files.
- Avoid adding backend services or login/authentication unless requirements change.
- Use synthetic data for all example records and explain that clearly on the site.
- Reuse CSS design tokens; don't scatter hard-coded color hex values throughout components.
- Separate domain calculations from presentational UI and test calculations where practical.
- Preserve working features when implementing new screens; favor incremental commits.
- Avoid adding new dependencies without stating why and checking whether they're installed.
- Aim for polished desktop presentation and strong mobile responsiveness.
- Do not represent simulated AI suggestions as genuine model outputs.

## 9. Suggested initial Copilot prompt

> Read `PROJECT_CONTEXT.md` fully and inspect the current React/Vite project. Confirm which setup steps are actually complete. Then implement the next milestone: a responsive Heritage Timber application shell with a dark-walnut sidebar/navigation and a Route Calculator landing page. Use the existing CSS variables and fonts, do not add login or a backend, and use only clearly fictional sample data. Keep the work incremental and show me the files you plan to change before modifying them.
