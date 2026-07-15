# TheSlot — project notes for Claude Code

## What this is
A single-page static website: a free beginner→intermediate map of West Coast Swing.
Everything lives in **`index.html`** — all HTML, CSS, and JavaScript are inline. There is
**no build step, no framework, and no dependencies**. You run it by opening the file in a browser.

## Files
- `index.html` — the entire site (styles + script inline)
- `favicon.svg` — the site icon
- `vercel.json` — minimal Vercel config (static, clean URLs, cache header)
- `README.md` — human-facing overview and deploy steps
- `DEPLOY.md` — copy-paste prompts + commands for GitHub and Vercel
- `.gitignore`, `LICENSE` (MIT)

## How the content is structured (inside index.html)
- `const MOVES = [...]` — the move data. Each move: `{id, name, aka?, count?, diff (1-4), builds?, lever?, q?|video?, blurb}`.
  - `builds` is the parent move's `name`; `lever` is one of: `hand change`, `add a turn`, `reverse it`, `new entry`, `new exit`.
  - `video` is a specific YouTube URL; if absent, a `q` (or the move name) builds a YouTube search link.
- `const FAMS = [...]` — the families (foundation, push, pass, whip, turn) and their headers.
- Progress is saved per-browser via `localStorage` under the key `wcs-progress-v1`.
- The family-tree SVG near the bottom is static markup; if `MOVES` changes a lot, that diagram
  won't auto-update (it was generated separately) — flag this rather than silently letting it drift.

## Common tasks
- **Add a move:** append an object to `MOVES` with the fields above. Keep `diff` honest for ordering.
- **Swap a search link for a real video:** set the move's `video` to a verified YouTube URL.
- **Run locally:** just open `index.html` (or `npx serve .`).
- **Deploy:** see `DEPLOY.md`. Static site — no build command, output is the repo root.

## Conventions
- Keep it dependency-free and single-file. Don't introduce a build system or framework.
- Preserve the visual system (ink/brass/bone palette, the five-lever color coding).
- Don't invent YouTube video IDs — use a search link (`q`) unless a real URL is verified.
