# GitHub Pages deployment

PieniPlan Build 1 is a static site. No build command is required.

## Recommended repository root

Upload these files/folders directly to the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `drawing-studio.js`
- `workers/`
- `manifest.webmanifest`
- `robots.txt`
- project documentation files

## Enable Pages

In the GitHub repository:

1. Open **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing `index.html` (normally `main`).
5. Select `/ (root)`.
6. Save.

After deployment, open the HTTPS Pages URL and test DXF Worker loading there.

## Important

Do not test by double-clicking `index.html` with a `file://` URL. Web Worker behavior is most reliable when served through HTTP/HTTPS.
