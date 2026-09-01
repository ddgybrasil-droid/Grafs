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

## Windows EXE

Build a self-contained Windows x64 portable executable:

```bash
npm install
npm run build:exe
```

The result is written to:

```text
release/Relation-Canvas-1.0.0-Windows-x64.exe
```

Copy that single file to a Windows 10/11 x64 PC and launch it normally. Node.js and a local web
server are not required on the target PC. The executable is not code-signed, so Windows SmartScreen
may show a warning on first launch.

Projects are saved in browser `localStorage`. Use **Import JSON** and **Export JSON** in the left
toolbar to move a project between browsers. Project files contain top-level `nodes` and `edges`
arrays.
