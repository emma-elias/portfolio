# Elias Portfolio CMS — No-code GitHub Pages edition

This folder contains the public portfolio and its browser-based content manager.

- `index.html` — public portfolio (keep its design intact)
- `admin.html` — content manager; use this to change the site without editing code
- `content.json` — published site content, updated by the CMS
- `assets/` — bundled portrait, starter CV, and local fonts
- `uploads/` — created automatically by the CMS on GitHub when you publish images or videos

## First publish on GitHub Pages

1. Create a **public** GitHub repository, for example `elias-portfolio`.
2. Extract the ZIP and upload the *contents* of this folder to the repository root. `index.html` must sit at the top level.
3. In the repository, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main`, choose `/(root)`, and save.
5. Your site address will be:
   `https://YOUR-USERNAME.github.io/elias-portfolio/`
6. Open the CMS at:
   `https://YOUR-USERNAME.github.io/elias-portfolio/admin.html`

## Edit without code

1. Open `admin.html` on the published site.
2. Change text, add/reorder/delete projects, add skills and experience, and attach project or experience images/videos.
3. Use **Save local draft** to protect work on the same device. Use **Download JSON backup** before major changes.
4. Open **Publish to GitHub** in the CMS.
5. Enter your GitHub username, repository name, branch (`main`), and leave the directory blank when the files are in the repository root.
6. Enter a **fine-grained personal access token** that is limited to this single repository and has **Contents: Read and write** permission. Give it an expiry date.
7. Click **Publish to GitHub Pages**. The CMS uploads new media to `uploads/`, updates `content.json`, and GitHub Pages publishes the change (usually within 1–3 minutes).

### Token safety

The token is only held in the browser tab while you publish. It is not saved in `content.json`, included in the public portfolio, or written into the site code. Never share it. Revoke it from GitHub when it is no longer needed.

## Media guidance

- For strong performance, use compressed WebP/JPEG images where possible.
- Keep uploaded videos short and compressed. The CMS blocks media over 90 MB because GitHub's Contents API has a 100 MB per-file limit.
- Publishing a replacement does not automatically delete old media from the repository; it simply stops referencing it. Delete unused files from GitHub's web interface occasionally if needed.

## Important

GitHub Pages is a static host. The CMS publishes changes by securely committing content through your own GitHub token. That is why all visitors see the updated content after publishing; this is not limited to one browser's local storage.
