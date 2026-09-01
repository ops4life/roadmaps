# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ops4life Roadmaps** — a single-page React app with interactive roadmaps for DevOps, DevSecOps, MLOps, DevOps→MLOps, and two certification tracks (AWS SAP-C02, Azure AZ-104). No build step: React 18 + Babel Standalone are loaded from CDN. Each track's data lives in its own plain (non-Babel) `<script>` file under `tracks/`; the React components live inline in `index.html` as a `<script type="text/babel">` block, transpiled in-browser.

Live site: [roadmap.ops4life.com](https://roadmap.ops4life.com)

## Development

`index.html` must be served over HTTP (not opened as a `file://` URL) because it fetches Babel/React from CDN and calls `/api/subscribe`:

```bash
python3 -m http.server 8080
# or
npx serve .
```

There are no tests, no linting config, and no build process. Since everything is one file, syntax-check the inline JSX after editing before deploying:

```bash
python3 - <<'PY'
import re
content = open('index.html').read()
m = re.search(r'<script type="text/babel">(.*?)</script>', content, re.S)
open('/tmp/roadmap.jsx', 'w').write(m.group(1))
PY
node -e "require('@babel/core').transformSync(require('fs').readFileSync('/tmp/roadmap.jsx','utf8'), {presets:['@babel/preset-react']}); console.log('OK')"
```
(requires `@babel/core` + `@babel/preset-react` installed somewhere reachable by `node -e`, e.g. `npm i` them into a scratch dir first.)

## Architecture

### File Structure

- `index.html` — app shell: meta/SEO tags, inline CSS (design tokens + component styles), `<script>` tags loading each `tracks/*.js` file (in `TRACKS` order), then one `<script type="text/babel">` with `const TRACKS = [TRACK_DEVOPS, ...]` assembled from those globals + all React components, then `ReactDOM.createRoot(...).render(<App />)`.
- `tracks/*.js` — one file per track (`devops.js`, `devsecops.js`, `mlops.js`, `devops-to-mlops.js`, `aws-cert.js`, `az-cert.js`), each a plain (non-Babel) classic `<script>` defining a single top-level `const TRACK_<NAME> = { ... }` object literal (the same shape documented below). Plain top-level `const`/`let` declared in one classic script are visible to scripts loaded after it on the same page — no bundler or ES modules needed, keeping the no-build-step architecture.
- `favicon.svg` / `favicon.png` — shared favicon.
- `robots.txt`, `sitemap.xml` — only `/` is listed; there are no other crawlable routes (see Routing below).

Earlier in this project's history there was a different multi-page split (`devops/`, `devsecops/`, `mlops/`, `devops-to-mlops/`, `shared/roadmap.js`, `shared/roadmap.css` — separate pages/routes per track) that was deleted in favor of a single inline `TRACKS` array. The current `tracks/*.js` split is not that pattern: it's still one SPA behind one URL (`/`), just with each track's *data* factored into its own file for editability. Don't recreate the old multi-page/routed version.

### Routing

nginx serves static files with `try_files $uri $uri/ =404` (see `../nginx.conf`) — there is no server-side or client-side router. Every track lives behind a single URL, `/`; track selection is in-memory React state (`trackId`, persisted to `localStorage["ops4life:active-track"]`), not a URL path. Do not add new top-level directories expecting them to become "pages" — add tracks to the `TRACKS` array instead.

### `TRACKS` Data Shape

```js
const TRACKS = [
  {
    id: "devops", code: "DEVOPS", title: "DevOps",
    tagline: "...", blurb: "...",
    storageKey: "ops4life:devops",   // localStorage key for this track's progress
    accent: "var(--c-teal)",
    sections: [
      { id: "section-id", title: "01 · Section Title", color: "var(--c-purple)", items: [
        { id: "unique-item-id", label: "Item Label", type: "recommended", // or "alt"
          concepts: ["..."], tools: ["..."],
          description: "...",
          resources: [{ kind: "read|docs|interactive", label: "...", url: "..." }],
          tip: "...",          // optional callout
          content: "<p>...</p>" // optional: pre-rendered HTML guide body (cert tracks only), rendered via dangerouslySetInnerHTML
        },
      ]},
    ],
  },
];
```

### Key Components (all in the `<script type="text/babel">` block)

- `App()` — top-level state: active track, view (grid/list), search query, open drawer item, notes (see below). Computes per-track progress/percent and renders `Header`, `TrackPicker` (when no track chosen) or `Hero`+`Board`/`ListView`, `Drawer`, `NotesPanel`, `Feedback`, `Footer`.
- `TrackPicker` — the "no track selected" landing view (cards for all six tracks).
- `Board` / `ListView` / `SectionColumn` / `NodeCard` — grid (columns + SVG bezier connectors) vs. mobile list rendering of a track's sections/items.
- `Drawer` — right-side (bottom-sheet on mobile) detail panel for a clicked item: description, concepts/tools (chips linking to `google.com/search?...&udm=50`, Google's AI-mode search), optional `content` guide embed, resources, tip, mark-as-learning/done buttons. `wide` prop (`75vw` instead of `440px`) is set for the two cert tracks, which have much longer guide content.
- `HighlightableText` — renders `item.description` with text-selection support: selecting text shows a floating tooltip (Highlight / Note / AI Search). Highlight and Note both persist to the shared notes store; AI Search opens the same `udm=50` Google AI-mode popup as the concept/tool chips, prefixed with the track title.
- `NotesPanel` / `NoteItem` — slide-in panel (toggled from the `Notes` header button) listing saved highlights/notes, with "This Track" / "All Tracks" tabs and a delete action. Clicking a note's quote jumps to that item's drawer (switching tracks first if needed).
- `useStored(key, init)` — the shared `localStorage`-backed `useState` hook; used for per-track progress, the active track id, and the notes array.
- `Feedback` — floating feedback button + modal (GitHub issue/discussion links), hidden while the drawer or notes panel is open.
- `Newsletter` — email subscribe form, posts to `/api/subscribe` (see `../docker-compose.yml` for the `roadmap-api` sidecar).

### Design System

- **Colors:** neo-brutalist palette defined as CSS custom properties at the top of `index.html` (`--bg`, `--ink`, `--c-purple`, `--c-teal`, `--c-orange`, `--c-pink`, `--c-yellow`, `--c-lime`, `--accent`).
- **Fonts:** Archivo (`display`/`display-mid` classes, headings), Space Mono (body/code).
- **Border/shadow utility classes:** `.brut`, `.brut-sm` (2px/1.5px border + offset box-shadow), `.brut-hover` (lift on hover), `.brut-press` (press-down on active).
- **Breakpoints:** `<768px` auto-switches Board to ListView; `<640px` the Drawer becomes a bottom sheet.

### Progress & Notes Persistence

- Per-track learning/done status: `localStorage[track.storageKey]` (e.g. `ops4life:devops`), shape `{ learning: {itemId: true}, done: {itemId: true} }`.
- Active track: `localStorage["ops4life:active-track"]`.
- Notes/highlights (shared across all tracks): `localStorage["roadmap_notes"]`, an array of `{ id, page (track id), pageLabel, itemId, itemLabel, text, note, createdAt }`.

## Commit Rules

- Never include AI attribution (`Co-Authored-By: Claude`) in commit messages.
- Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(appname): add new app
fix(kuma): update routing rule
chore: update dependencies
```

## Adding a New Track

1. Create `tracks/<id>.js` defining `const TRACK_<NAME> = { ... }` (copy an existing track file's shape).
2. Add a `<script src="tracks/<id>.js"></script>` tag in `index.html`, before the `<script type="text/babel">` block, and add `TRACK_<NAME>` to the `const TRACKS = [...]` list inside that block.
3. Add a `useStored(TRACKS[n].storageKey, ...)` line in `App()` and wire it into `progressByTrack`/`setProgressByTrack` (the array is indexed positionally — keep all in sync).
4. If the track has long-form guide content (like the cert tracks), populate `item.content` with pre-rendered HTML and add the track's `id` to the `wide` check in the `<Drawer>` call in `App()`.
5. No sitemap/robots changes needed — there's only one crawlable URL (`/`).
