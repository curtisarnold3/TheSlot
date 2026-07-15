# Deploying TheSlot

This is a static site — one `index.html` with everything inline, no build step. You can ship it
by talking to Claude Code, or by running a few commands yourself. Both paths below.

---

## Option 1 — Let Claude Code do it

Download all the files into a folder named **`TheSlot`**, then open that folder in Claude Code
(Desktop → open the folder, or `cd` into it in the terminal). Paste these prompts one at a time.

### Prompt 1 — push to GitHub

```
This folder is a finished static website called TheSlot — a single index.html plus supporting
files, with no build step and no dependencies. Please get it onto GitHub:

1. Confirm these files are present: index.html, favicon.svg, README.md, CLAUDE.md, DEPLOY.md,
   vercel.json, .gitignore, LICENSE.
2. Initialize a git repository (if it isn't one already) and make an initial commit on a "main"
   branch with the message "The Slot: a free WCS pathway".
3. Create a new PUBLIC GitHub repository named TheSlot using the GitHub CLI (gh repo create).
   If gh isn't installed or isn't authenticated, stop and walk me through installing it and
   running "gh auth login" first.
4. Push main to the new repo and print the repository URL when done.

Do not change any of the site's content — only handle the git and GitHub setup.
```

### Prompt 2 — deploy to Vercel

```
Now publish this static site to Vercel:

1. Make sure the Vercel CLI is available (install it with "npm i -g vercel" if needed).
2. From this folder, run a production deployment with "vercel --prod". It's a static site:
   framework "Other", no build command, output directory is the project root. Accept sensible
   defaults for the project name (TheSlot).
3. If I'm not logged in, stop and walk me through "vercel login" first.
4. When it's live, print the production URL.

If connecting through the Vercel dashboard would be easier, instead tell me the exact settings
to choose.
```

### Prompt 3 (optional) — auto-deploy on every change

```
I'd like this to redeploy automatically whenever I push to GitHub. Explain how to link the
GitHub repo to Vercel through the dashboard so every push to main triggers a new deployment,
and confirm there's nothing else I need to configure for a static site.
```

---

## Option 2 — Do it yourself (manual commands)

From inside the `TheSlot` folder:

### Push to GitHub
```bash
git init
git add .
git commit -m "The Slot: a free WCS pathway"
git branch -M main

# with the GitHub CLI (creates the repo and pushes in one step):
gh repo create TheSlot --public --source=. --remote=origin --push

# ...or manually, if you created the empty repo on github.com first:
git remote add origin https://github.com/YOUR_USERNAME/TheSlot.git
git push -u origin main
```

### Deploy to Vercel
```bash
npm i -g vercel     # once
vercel              # first run: accept defaults, framework = Other, no build command
vercel --prod       # promote to a production URL
```

Or through the dashboard: **vercel.com → Add New… → Project → import TheSlot →
Framework Preset: Other → leave Build Command and Output Directory empty → Deploy.**

---

## Prerequisites
- A **GitHub** account, and the GitHub CLI (`gh`) authenticated (`gh auth login`).
- A **Vercel** account (free tier is plenty for a static site).
- Node.js installed (only needed for the Vercel CLI, not for the site itself).
