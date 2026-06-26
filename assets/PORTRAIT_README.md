# Your hero portrait — the cursor "reveal" effect

The hero now has a **shader spotlight reveal** (like the Spider-Man portfolio you
shared): the base layer shows a cyberpunk/holographic version of your photo, and
as the cursor moves, a soft glowing circle **reveals the real you** underneath.

Right now it's using a **placeholder** (`assets/portrait.png`). Replace it with
your real photo to make it yours.

## How to add your photo

1. Take/choose a **headshot** — head and shoulders, looking at the camera.
2. Best results: **plain or removed background** (use remove.bg or any tool).
   A portrait aspect ratio (e.g. 900×1100) works best.
3. Name it **`portrait.png`** (or `.jpg` / `.webp`) and put it in `assets/`,
   replacing the placeholder.
4. Commit & push. The effect updates automatically.

## Notes

- The cyberpunk styling (indigo/cyan duotone, scanlines, posterize) is applied
  **live in the shader** — you do NOT need to pre-edit the photo. Just give a
  clean headshot and the effect does the rest.
- No build step, no React — it runs on the current static site and deploys
  straight to GitHub Pages.
- If you remove the portrait file, the hero falls back to the anime character.
