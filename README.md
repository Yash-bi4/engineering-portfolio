# Portfolio site

Plain HTML, CSS and JavaScript. No build step, no npm, no frameworks.

```
index.html          Landing page (photo, name, key facts, project image strip)
projects.html       Projects tab (card grid + project modal)
about.html          About tab (bio, timeline, skills, contact)
resume.html         Resume tab (embedded PDF + download button)
style.css           All styling
main.js             Renders every page from data/content.json
data/content.json   ALL site content lives here
images/profile.svg  Your photo (placeholder)
images/projects/<project-id>/   Images for each project
resume.pdf          Your resume (placeholder)
```

You should only ever need to edit `data/content.json`, drop images into `images/`, and replace `resume.pdf`.

Anything that contains the text `TODO` shows up on the site with a yellow highlight, so you can see what is still missing. Search the JSON for `TODO` to find them all.

---

## Preview locally

Browsers will not let a page opened straight from disk (`file://...`) read `data/content.json`, so double-clicking `index.html` shows an error box instead of your projects. Run a tiny local server instead. In this folder:

```powershell
python -m http.server 8000
```

Then open http://localhost:8000. Stop it with Ctrl+C. On GitHub Pages none of this is needed.

---

## Add a project

1. Pick a short id with lowercase letters and dashes, e.g. `wind-tunnel-rig`. It becomes the link: `https://<your-site>/projects.html#wind-tunnel-rig`.
2. Make a folder `images/projects/wind-tunnel-rig/` and put your images in it, e.g. `cover.jpg`, `1.jpg`, `2.jpg`. Use a 3:2 shape (e.g. 1500 x 1000 px) for the cover so it crops cleanly. Keep each image under about 500 KB.
3. Open `data/content.json`, find the `"projects"` list, and copy one of the `"Project Title TODO"` blocks (everything from `{` to the matching `},`). Paste it where you want the card to appear. Order in the file is order on the page.
4. Fill in the fields:

```json
{
  "id": "wind-tunnel-rig",
  "featured": false,
  "title": "Wind Tunnel Test Rig",
  "summary": "One line shown on the card.",
  "tags": ["Aerodynamics", "Test"],
  "cover": "images/projects/wind-tunnel-rig/cover.jpg",
  "coverAlt": "Describe the cover image for screen readers",
  "role": "Design and testing",
  "timeframe": "Jan 2026 – Apr 2026",
  "team": "Team of 4",
  "status": "",
  "goal": "One short paragraph on what the project set out to do.",
  "did": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "results": ["Numbers if you have them"],
  "gallery": [
    { "src": "images/projects/wind-tunnel-rig/cover.jpg", "alt": "Rig on the bench" },
    { "src": "images/projects/wind-tunnel-rig/1.jpg", "alt": "Load cell mount" }
  ],
  "links": [
    { "label": "Repo", "url": "https://github.com/..." },
    { "label": "Drawings (PDF)", "url": "images/projects/wind-tunnel-rig/drawings.pdf" }
  ]
}
```

Notes:
- `"featured": true` puts the card in the Featured section at the top of Projects (the landing page uses `"home.strip"` instead; it falls back to featured projects if the list is empty).
- `"status"`: leave as `""` for finished projects, or write `"In progress"` / `"Proposal stage"`. It shows on the card and in the detail view.
- Cards show the first 3 tags only.
- Empty fields are hidden. An empty `"links": []` hides the Links section.
- JSON is strict: every item except the last in a list needs a comma after it, and all text goes in double quotes. If the page shows "Could not load data/content.json", paste the file into https://jsonlint.com to find the typo.

To delete a project, delete its block (and its image folder).

## Edit the timeline, skills, bio

All in `data/content.json`:
- `"home"`: the landing page. `"headline"` is the line under your name, `"highlights"` are the labeled key facts, and `"strip"` lists the project ids shown as images under "Selected work" (in that order).
- `"about"`: bio paragraphs and photo path.
- `"timeline"`: one block per job or school. `"type"` is `"work"` or `"education"` (this drives the filter). Entries show in the order listed, so keep newest first.
- `"skills"`: groups with a list of items each.
- `"site"`: name, email, LinkedIn URL.

## Replace placeholders

- **Project images:** drop real photos in `images/projects/<id>/`, then update `cover` and `gallery[].src` in the JSON to the new file names (e.g. `cover.svg` becomes `cover.jpg`). Update the `alt` text too. Delete the old `.svg` placeholders.
- **Your photo:** add `images/profile.jpg` (square works best) and change `"photo"` and `"photoAlt"` under `"about"`.
- **Resume:** replace `resume.pdf` with your real resume. Keep the exact name `resume.pdf`.

---

## Deploy to GitHub Pages

**Current setup:** this site lives in the public repo `Yash-bi4/engineering-portfolio` and is served at https://yash-bi4.github.io/engineering-portfolio/ from the root of `main`. To edit it on a new computer:

```powershell
gh repo clone Yash-bi4/engineering-portfolio
```

Then edit, and use the "Every later update" commands below.

**Setting it up from scratch** (only if you ever start over):

1. Sign in to GitHub. Create a new **public** repository. A repo named `<your-username>.github.io` is served at `https://<your-username>.github.io`; any other name (e.g. `engineering-portfolio`) is served at `https://<your-username>.github.io/<repo-name>/`. Do not add a README or license, since this folder already has a README.
2. Install Git if needed: https://git-scm.com/downloads
3. In this folder, run:

```powershell
git init -b main
```

```powershell
git add .
```

```powershell
git commit -m "First version of portfolio"
```

```powershell
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

```powershell
git push -u origin main
```

4. On GitHub, open the repo, go to **Settings > Pages**. Under **Build and deployment**, set **Source** to "Deploy from a branch", **Branch** to `main`, folder `/ (root)`, and click **Save**.
5. Wait one or two minutes, then open the address from step 1.

Every later update:

```powershell
git add .
```

```powershell
git commit -m "Update projects"
```

```powershell
git push
```

The live site updates within a minute or two. If you do not see the change, hard-refresh (Ctrl+Shift+R).

The empty `.nojekyll` file tells GitHub Pages to serve the files as they are, without running Jekyll. Leave it in place.
