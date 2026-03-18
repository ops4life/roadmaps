# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ops4life Roadmaps** — a static site with interactive roadmaps for DevOps, DevSecOps, and MLOps. No build step, no dependencies, no framework. Pure HTML/CSS/JS served statically.

Live site: [roadmap.ops4life.com](https://roadmap.ops4life.com)

## Development

Open any HTML file directly in a browser — no server required. For local development with a simple server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

There are no tests, no linting config, and no build process.

## Architecture

### File Structure

- `index.html` — landing page with cards linking to each roadmap
- `devops/index.html`, `devsecops/index.html`, `mlops/index.html` — individual roadmap pages
- `shared/roadmap.css` — all shared styles (tokens, components, layout, responsive)
- `shared/roadmap.js` — all shared behavior (rendering, progress, panels, connectors)
- `favicon.svg` — shared favicon

### How Roadmap Pages Work

Each roadmap page (`devops/`, `devsecops/`, `mlops/`) defines a global `ROADMAP` array in an inline `<script>` at the bottom of the page. `shared/roadmap.js` reads this array to dynamically render the UI via `render()`.

**ROADMAP data shape:**
```js
const ROADMAP = [
  {
    id: "section-id",
    label: "Section Title",
    color: "purple",          // purple | teal | orange | green
    items: [
      {
        id: "unique-item-id",
        label: "Item Label",
        type: "recommended",  // recommended | alt | (omit for default)
        description: "...",
        concepts: ["..."],
        tools: ["..."],
        resources: [{ label: "...", url: "..." }],
        tip: "..."            // optional callout
      }
    ]
  }
]
```

### Key JS Functions (`shared/roadmap.js`)

- `render()` — builds columns/nodes from `ROADMAP`, attaches event handlers
- `drawConnectors()` — draws SVG Bezier paths between column headers; uses `ResizeObserver` to redraw on resize
- `openPanel(item)` / `closePanel()` — manages the right-side detail panel
- `markStatus(status)` — sets `"learning"` | `"done"` | `null` per item ID in localStorage
- `loadProgress()` / `saveProgress()` — persists progress under a per-page `STORAGE_KEY`
- `handleSearch(q)` — fades non-matching nodes (opacity 0.2)
- `toggleView()` — switches between grid (column) and list view

### Design System

- **Colors:** Purple `#6d28d9`, Teal `#0d9488`, Orange `#f97316`, Green `#16a34a`
- **Fonts:** Space Mono (body/code), Bebas Neue (headings)
- **Border:** 2px solid black throughout (`--border`)
- **Hover effect:** `translate(-2px, -2px)` + `box-shadow: 4px 4px 0 #000`
- **Breakpoints:** `<768px` auto-switches to list view; `<640px` panel becomes bottom sheet

### Progress Persistence

User progress (learning/done status per item) is stored in `localStorage` with a key defined by each page's `STORAGE_KEY` constant (e.g., `devops-progress`).

## Adding a New Roadmap

1. Create a new directory (e.g., `platform/`) with an `index.html`
2. Copy an existing roadmap page as a template
3. Replace the `ROADMAP` array with new content
4. Set a unique `STORAGE_KEY`
5. Add a card to the root `index.html`
