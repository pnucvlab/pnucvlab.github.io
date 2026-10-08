# PNU CVLab website

## Preview locally

From this repository, run:

```bash
docker compose up
```

Then open <http://localhost:4000/research/>. Jekyll rebuilds the site and
reloads the browser when HTML, CSS, or asset files change.

To keep the preview inside VS Code or Cursor, open the Command Palette
(`Ctrl+Shift+P`), choose **Simple Browser: Show**, and enter:

```text
http://localhost:4000/research/
```

When working over SSH, forward port `4000` from the editor's **Ports** panel
before opening the preview.

Press `Ctrl+C` to stop the preview. The first run may take a few minutes while
Docker downloads the Jekyll image.
