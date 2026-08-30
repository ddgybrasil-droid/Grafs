# Relation Canvas

A desktop-first local workspace for visualizing relationships between user-provided entities. The
included Aurora project is entirely synthetic, and the application does not perform lookups,
enrichment, deanonymization, or collection of personal data.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run typecheck
npm run build
npm run preview
```

Projects are saved in browser `localStorage`. Use **Import JSON** and **Export JSON** in the left
toolbar to move a project between browsers. Project files contain top-level `nodes` and `edges`
arrays.
