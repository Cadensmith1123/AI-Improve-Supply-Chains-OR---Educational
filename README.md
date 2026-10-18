# React + TypeScript + Vite

## Mapbox route maps

Copy `.env.example` to `.env.local` and set `VITE_MAPBOX_ACCESS_TOKEN` to a Mapbox public access token. Restart the Vite server after changing the token. The map uses Mapbox Search for address lookup and the Directions API for driving routes. Since Vite exposes `VITE_` variables in browser code, use a public token with appropriate URL restrictions, never a secret token.

User-created routes are stored in the current browser's `localStorage`.

## Oregon product catalog

Product category groupings are informed by [OSU Extension crop production topics](https://extension.oregonstate.edu/crop-production) and the [USDA NASS Oregon Agriculture Overview](https://www.nass.usda.gov/Quick_Stats/Ag_Overview/stateOverview.php?state=OREGON). The category and product names are illustrative frontend coverage, not an exhaustive official taxonomy. Suggested unit costs, packaging, and handling profiles in `src/data/oregonProductCatalog.ts` are synthetic planning defaults; users should replace them with shipment-specific information and verify handling requirements for their commodity.

## OpenAI route summaries

Set `OPENAI_API_KEY` in the root `.env.local` file for local development. Do not prefix it with `VITE_`; the key is read only by the local Vite API middleware and the Vercel serverless function at `/api/summarize-route`. For deployment, add `OPENAI_API_KEY` to the Vercel project's server environment variables. Summary requests are limited to six per minute per client in each running function instance.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
