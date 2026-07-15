# The Slot — a free path through West Coast Swing

A single-page, scroll-down map of West Coast Swing from beginner to intermediate. Every move branches off one of the basics (push, pass, whip), ordered easiest to hardest, with a lever system that shows *how* each variation is built. Track what you've learned, flip to a repertoire view of just the moves you own, and open a tutorial for any move. No login, no cost, no thousand-dollar plan.

## What's here

It's one static file — `index.html` — with all styles and scripts inline. No build step, no dependencies, no framework. It runs by opening it in any browser.

- **60+ moves** across Foundations, Push, Pass, Whip, Turns, and Anchor & footwork
- **Five levers** (hand change, add a turn, reverse it, new entry, new exit) that explain the branching
- **Progress tracking** (Learning / Got it) saved in your browser via `localStorage`
- **Repertoire mode** — a leader's cheat-sheet of just the moves you own
- **A family-tree diagram** of the whole vocabulary at the end
- A **Watch** link on every card (curated video where available, otherwise a move-specific YouTube search that can't go dead)
- A **beginner practice plan** at the bottom: a 30-minute daily routine plus a 7-week focus progression, explained from scratch

## Run it locally

Just open the file:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it (optional):

```bash
npx serve .
```

## Deploy it (GitHub + Vercel)

The fastest path is to open this folder in **Claude Code** and paste the prompts in `DEPLOY.md` —
it will handle the git init, the GitHub repo, and the Vercel deploy for you. Prefer to do it by
hand? `DEPLOY.md` also has the raw commands. The short version is below.

## Deploy to Vercel

This is a static site, so there's no build command and no output directory to configure.

**Option A — GitHub + Vercel dashboard**
1. Push this folder to a GitHub repo (see below).
2. Go to vercel.com → **Add New… → Project** → import the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
4. **Deploy.** Vercel serves `index.html` at your project URL.

**Option B — Vercel CLI**
```bash
npm i -g vercel
vercel        # from this folder; accept the defaults
vercel --prod # promote to production
```

## Push to GitHub

```bash
git init
git add .
git commit -m "The Slot: a free WCS pathway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TheSlot.git
git push -u origin main
```

## Notes

- Progress is stored per-browser in `localStorage`, so it stays on each device and isn't shared between visitors.
- The move families follow the shared West Coast Swing vocabulary (push / pass / whip) that virtually every figure descends from. Naming varies from studio to studio — one person's "cinnamon roll" is another's "reverse tuck."
- It's a curated spine, not the entire dance. Grow it by editing the `MOVES` array in `index.html`.

## License

MIT — see `LICENSE`. Use it, fork it, hand it to a frustrated beginner.
