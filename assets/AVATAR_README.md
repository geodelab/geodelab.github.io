# Adding your interactive anime engineer avatar

The site is wired to load an interactive **VRM** character in the hero. Until a
file is present, the hero shows the geometric 3D object as a fallback.

## How to add it

1. Go to **https://vroid.com/en/studio** (free) — or use any VRM you have rights to.
2. Create / customize an anime character (a professional, engineer-style look fits best).
3. Export as **VRM** (VRM 0.x or 1.0 both work).
4. Rename the file to **`avatar.vrm`** and place it here: `assets/avatar.vrm`.
5. Commit & push. The character appears automatically.

## What you get automatically

- 👀 **Eye + head tracking** — looks toward your cursor
- 😊 Slight **smile** that grows as the cursor nears
- 😌 **Breathing** idle motion + **blinking**
- 💡 **Neon rim lighting** (indigo / magenta / cyan) with gentle pulsing
- ⚡ Lazy-loaded: the 900 KB VRM runtime only downloads when `avatar.vrm` exists

## Notes

- Keep the file reasonably small (ideally < 15 MB) for fast loads.
- Facial expressions (`blink`, `happy`) use standard VRM expression names — VRoid
  exports include these by default.
- Tracking/breathing need a standard VRM humanoid rig (VRoid exports are fine).
