# 🌐 Ganesh Kumar — GeoDE Lab Portfolio

> Personal portfolio website rebuilt from scratch in 2025 — originally launched as [dynamo-damm-boy](https://github.com/geodelab/dynamo-damm-boy.github.io) in 2019.

## ✨ Features
- **Cyberpunk AI/Coder aesthetic** with neon accents, matrix rain, and animated gradients
- Animated hero with live typewriter effect & rolling code preview
- Full **Experience timeline** with scroll-triggered animations
- **Skills section** with animated progress bars + tech pill cloud
- **Certifications showcase** with issuer-colored cards
- **Projects grid** with featured project highlight
- **Education** section
- Responsive design (mobile-friendly)
- GitHub Pages ready — zero dependencies, pure HTML/CSS/JS

## 🚀 Deploy to GitHub Pages

### Option 1: Direct Push
```bash
git clone https://github.com/geodelab/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
# Copy all files here
git add .
git commit -m "🚀 Launch new portfolio"
git push origin main
```
Then go to **Settings → Pages → Source: main branch / root**

### Option 2: Create New Repo
1. Create a new repo named `geodelab.github.io` for the canonical GitHub Pages URL
2. Upload all files
3. Enable GitHub Pages

## 📝 Customizing Your Data

Edit `index.html` and replace all `[placeholder]` values:

| Placeholder | Replace With |
|-------------|-------------|
| `[Company Name]` | Your actual company names |
| `[Issue Date]` | Certification dates |
| `[Credential ID]` | Your cert IDs |
| `[University Name]` | Your university |
| `your@email.com` | Your email |
| `YOUR-LINKEDIN` | Your LinkedIn username |

## 🎨 Customizing Colors
Edit `css/style.css` `:root` block:
```css
:root {
  --cyan: #00f5ff;   /* primary accent */
  --pink: #ff006e;   /* secondary accent */
  --yellow: #ffbe0b; /* tertiary accent */
  --purple: #8338ec; /* fourth accent */
}
```

## 📁 File Structure
```
portfolio/
├── index.html        ← Main page (all content here)
├── css/
│   └── style.css     ← All styles
├── js/
│   └── main.js       ← Animations & interactions
└── README.md
```
