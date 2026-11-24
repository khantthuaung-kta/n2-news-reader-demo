# N2 News Reader Demo

A mobile-first Burmese editorial reader built with semantic HTML, CSS and a small amount of JavaScript. This public portfolio demo contains **only fictional editions, organizations and events**. It is not a live news feed.

- Browse the newest fictional edition or open an older date from the archive.
- Filter by topic or **N2 ရွေးပေးတာ** (N2 Picks), and search across either one edition or the entire demo archive.
- Read full stories with a summary, context, practical next step and clearly labelled fictional source metadata. Core navigation and articles work without JavaScript.
- Burmese typography uses a self-hosted Noto Sans Myanmar font. The demo does not need a database, account, API, tracking script or external runtime request.

## Run locally

Requires Node.js 20 or later. No dependency installation is needed.

```sh
npm run build
npm run preview
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The preview server serves only generated files from `dist/` and binds to localhost by default. The build is portable to a static host, including a project subdirectory. Publishing a live site is optional.

```sh
npm test
```

Tests cover fixture validation, HTML escaping, topic/N2 Picks and query behavior, all generated relative links, and read-only HTTP preview behavior. Roadmap ideas are welcome, but this demo intentionally has no publishing endpoint or live integrations.

## Source layout

- `src/fixtures/editions.mjs` – original fictional sample content.
- `src/reader.mjs` – shared page templates and fixture validation.
- `src/assets/` – styles, font, icons and client-side filters.
- `scripts/` – deterministic generator and local read-only preview server.
- `tests/` – automated tests using Node's built-in test runner.

The bundled Noto Sans Myanmar font is distributed under the [SIL Open Font License 1.1](src/assets/OFL-Noto-Sans-Myanmar.txt).
