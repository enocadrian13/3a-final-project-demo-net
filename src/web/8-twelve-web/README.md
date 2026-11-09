# React + TypeScript + Vite

## 8-Twelve frontend prototype

Run `npm run dev` in this directory and open the URL printed by Vite. The
dashboard is the default view; use the sidebar for analytics, transactions,
products, inventory, users, and settings. The profile menu opens the simulated
login page, which also links to registration. The original Vite starter screen
is available at `#/starter` (or from Settings).

All records are mock data and every action is frontend-only. Login does not
authenticate, registration does not create an account, and the password reset
does not send an email. Changes to users, products, and settings last only until
the page is refreshed. Sales charts and summaries use the included mock
transactions; product and user edits do not change that transaction history.

Run `npm run build` and `npm run lint` to check the frontend.

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
