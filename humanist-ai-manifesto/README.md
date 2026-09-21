# A Humanist AI Manifesto

A responsive, accessible static reading site for the draft manifesto. The site uses plain HTML, CSS, and JavaScript, with no build step or third-party dependencies.

## Edit the manifesto

All document wording lives in [`manifesto.md`](manifesto.md). Edit that file using ordinary Markdown headings, paragraphs, emphasis, and lists. The page formats it and rebuilds the section navigation automatically.

To preview locally, serve this folder with any static web server. For example:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`. Opening `index.html` directly from the filesystem will not load `manifesto.md`, because browsers restrict local file requests.

## Published site

This folder is published through the existing `several-dozen-lizards/pages`
GitHub Pages site:

<https://several-dozen-lizards.github.io/pages/humanist-ai-manifesto/>

Updates pushed to the `main` branch are deployed automatically. Because this
is a static site, no package installation or build workflow is required.

## Files

- `index.html` — page structure and metadata
- `styles.css` — responsive layout, typography, navigation, and print styles
- `script.js` — Markdown rendering, section navigation, and reading progress
- `manifesto.md` — the living source document
- `.nojekyll` — tells GitHub Pages to serve the files as-is
