# NOCTIS — Electric Scrollytelling Experience

[![Standard - Vanilla JS](https://img.shields.io/badge/Stack-Vanilla%20HTML%2FCSS%2FJS-black?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Rendering - HTML5 Canvas](https://img.shields.io/badge/Rendering-HTML5%20Canvas%20Scrubber-CFE3FF?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Performance - 60 FPS Target](https://img.shields.io/badge/Performance-60%20FPS%20RAF-07080A?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
[![Zero - Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Runtime%20Packages-success?style=for-the-badge)](#tech-stack--architecture)

> **Mood:** A metropolis engulfed in total nocturnal blackout, where the vehicle's beam is the solitary illumination in the world. Quiet, expensive, and razor-sharp: expansive void, measured language, and frictionless motion.

NOCTIS is a single-page interactive scrollytelling web experience crafted for a fictional ultra-luxury electric car brand. The site leverages zero runtime libraries or CSS frameworks, driving synchronized multi-clip canvas scrubbers directly through scroll position and raw browser APIs.

---

## Live Repository

- **GitHub Repository:** [https://github.com/SiddCraft/Car-Website](https://github.com/SiddCraft/Car-Website)
- **Branch:** `main`

---

## Core Philosophy & Design Rules

The design system adheres to an uncompromising, reductive aesthetic:
- **Zero Gradients:** No linear, radial, or conic gradients. Solid flat color tokens only.
- **Zero Glassmorphism:** No `backdrop-filter`, no blurred cards, no translucent or frosted containers.
- **Zero Glows & Shadows:** No `box-shadow`, no `text-shadow`, no artificial bloom.
- **Pure Architectural Geometry:** Strict 1px hairlines, photography, and high-precision typographic hierarchy.
- **Canvas-Only Motion:** Frame scrubbing executes on `<canvas>` elements scaled by `devicePixelRatio`. No `<img>` tag swapping, no `<video>` playback hacks.

---

## Tech Stack & Architecture

| Layer | Implementation | Details |
| :--- | :--- | :--- |
| **Markup** | Semantic HTML5 | Clean landmark structure (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`) |
| **Styling** | Vanilla CSS3 | Custom Properties, CSS clamp typography, CSS transitions, CSS `@media (pointer: fine)` |
| **Scripting** | Vanilla JavaScript (ES6+) | Single RAF loop, linear interpolation (LERP), stream loader, IntersectionObserver |
| **Fonts** | Google Fonts | **Display:** Archivo (`wdth` 125%, 300/400) · **Body:** Inter 400 · **HUD:** JetBrains Mono 400 |
| **Media** | Modern WebP | Responsive desktop (1600px, Q78) and mobile (960px, Q72) frame sets |
| **Server** | Node.js HTTP | Built-in non-blocking static file server with MIME mapping and CORS support |

### Design Tokens

```css
:root {
  --asphalt:   #07080A;                     /* Primary background */
  --graphite:  #121418;                     /* Secondary solid tone */
  --fog:       #8A8F98;                     /* Subtle technical metadata */
  --bone:      #EDEAE4;                     /* High-contrast typography */
  --xenon:     #CFE3FF;                     /* Headlight signature accent */
  --taillight: #E1251B;                     /* Microstatus red indicator */
  --hairline:  rgba(237, 234, 228, 0.12);   /* 1px structural grid lines */
  --ease:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Sections & Interactive Features

### 1. Preloader Pipeline
- **Blackout Screen:** Features the centered `NOCTIS` display wordmark and a live mono counter (`000`–`100`).
- **Targeted Initial Batch:** Preloads only Hero frames 1–40 (the critical initial sequence) before revealing the site.
- **Background Streamer:** Asynchronously fetches remaining hero frames and subsequent dismantle frames sequentially in background workers without blocking scroll interactivity.
- **Exit Flash:** On completion, the centered xenon line flashes bright white and fades out smoothly to the hero canvas.

### 2. Navigation (`site-nav`)
- Fixed header utilizing `mix-blend-mode: difference` for optical contrast over bright light beams and dark asphalt.
- Left: `NOCTIS` brand signature.
- Right: Monospace navigation links (`Models`, `Technology`, `Reserve`).
- Scroll-direction observer: Automatically conceals on downward scroll and reveals instantly on upward scroll.

### 3. Hero Scrollytelling (`#hero` — 600vh)
- **Continuous 598-Frame Sequence:** Seamlessly stitched from 3 continuous video clips with join-stutter removal (skipping duplicate transition frames).
- **Responsive Canvas Scaling:**
  - **Landscape:** Cover-fit canvas scaling.
  - **Portrait:** Contain-fit centered on `--asphalt` ensuring the car silhouette is never cropped on mobile.
  - **Nearest-Loaded Fallback:** Binary proximity search renders the nearest loaded frame instantly if scroll advances faster than network transfer.
- **Sky-Positioned Chapters:**
  - `00%–12%`: NOCTIS wordmark + "The city is asleep." + animated 1px pulsing scroll indicator.
  - `22%–40%`: "It doesn't need the city's light."
  - `50%–68%`: "It brings its own."
  - `80%–100%`: "GT-E" grand tourer introduction, spec row, and link to lineup.
- **Telemetry HUD (Left Edge):** Live monospace readouts tracking active chapter (`01/04` with a taillight-red active tick), velocity (`000` → `118 KM/H`), and distance traveled (`0.0` → `4.2 KM`).
- **Terminal Blackout:** The canvas smoothly fades to solid black over the final 5% of scroll distance.

### 4. Statement Section (`#statement` — 100vh)
- Centered architectural quote: *"Every part was designed to disappear into one line of light."*
- Scroll-driven word-by-word reveal: Each word transitions from 15% opacity to 100% white based on viewport penetration.

### 5. Engineering Dismantle (`#dismantle` — 350vh)
- **Exploded View Canvas (200 frames):** Scrubbing down disassembles the vehicle down to its structural chassis; scrolling up reassembles it.
- **Interactive Callout Overlays:** At 70% scroll progress, four technical callouts emerge with responsive 1px SVG hairlines connecting vehicle components to mono badges:
  - **BODY:** Carbon composite monocoque
  - **BATTERY:** 110 kWh structural pack
  - **DRIVE:** Dual axial-flux motors, 680 kW
  - **LIGHT:** Single-line LED signature

### 6. Model Lineup Accordion (`#lineup` — 100vh)
- **Horizontal 5-Slide Accordion:** Side-by-side vertical slides separated by 1px hairlines:
  - `01 GT-E`: The grand tourer (Matte Graphite) — 640 km · 3.1 s · 680 kW
  - `02 S`: Four doors, no compromise (Satin Bone) — 600 km · 3.6 s · 520 kW
  - `03 X`: Higher, never heavier (Midnight Blue) — 560 km · 4.2 s · 480 kW
  - `04 R`: Built for the track (Satin Black) — 420 km · 2.4 s · 900 kW
  - `05 ONE`: Concept hypercar (Liquid Silver) — Quad Axial · Active Vortex
- **Interaction Model:**
  - Closed slides (~12vw) show vertical mono titles, numbers, and high-contrast light bar crops at 25% brightness.
  - Active slide expands to ~52vw via `flex-grow` with an 80ms hover debounce to eliminate cursor sweeping jitter.
  - Vehicle enters with a subtle 6% horizontal drive-in animation.
  - 4 interactive flat color swatches with active 1px bone borders.
  - Full keyboard accessibility: Arrow navigation (`Left`/`Right`/`Up`/`Down`) and `Enter`/`Space` activation.
  - Mobile (<768px): Stacks into 72px interactive rows with accordion drawers.

### 7. Allocation Reserve (`#reserve` — 100vh)
- Centered call to action: *"Drive the night."*
- Minimalist xenon hairline button: Hovering fills the button with solid xenon, inverts text to `--asphalt`, and reveals a 2px taillight-red accent tick.

### 8. Custom "Headlight" Cursor
- **Desktop Only (`(pointer: fine)`):** 6px solid xenon dot positioned within a 28px hairline ring, tracking the cursor with a `0.18` LERP factor.
- **Contextual Morphing:** Over interactive links, buttons, and lineup cards, morphs into a 44x2px horizontal light bar accompanied by micro monospace labels (`VIEW`, `RESERVE`, `OPEN`, `CONFIGURE`).
- **Mousedown Click Flash:** Produces a 120ms bright white pulse on click.

### 9. Dynamic Film Grain
- 160×160 offscreen noise tile generated programmatically via canvas `ImageData`.
- Rendered with `pointer-events: none` and translated randomly ~8 times per second (125ms intervals) at 3.5% opacity for cinematic optical texture without heavy overhead.

### 10. Accessibility & Reduced Motion
- Full `@media (prefers-reduced-motion: reduce)` support:
  - Sticky pin wrappers are disabled.
  - Shows static keyframe captures at key chapter intervals (0%, 35%, 65%, 100%).
  - Smooth native cursor behavior is maintained.

---

## Project Folder Structure

```
car-website/
├── assets/
│   ├── cars/
│   │   ├── gt-e.webp              # Hero GT-E side profile (1600x900)
│   │   ├── s.webp                 # S Sport Sedan side profile (1600x900)
│   │   ├── x.webp                 # X Coupe SUV side profile (1600x900)
│   │   ├── r.webp                 # R Track Coupe side profile (1600x900)
│   │   └── one.webp               # ONE Concept Hypercar side profile (1600x900)
│   └── frames/
│       ├── hero/                  # 598 WebP frames (1600px, quality 78) — 12.79 MB
│       ├── hero-mobile/           # 598 WebP frames (960px, quality 72) — 6.02 MB
│       ├── dismantle/             # 200 WebP frames (1600px, quality 78) — 10.37 MB
│       └── dismantle-mobile/      # 200 WebP frames (960px, quality 72) — 5.16 MB
├── config.js                      # Centralized configuration (thresholds, paths, coordinates)
├── index.html                     # Semantic markup & landmark structure
├── main.js                        # 60fps canvas scrubber, cursor, preloader & accordion logic
├── styles.css                     # Design tokens, hairlines, typography & layout
├── server.js                      # Local Node.js static file HTTP server (port 3000)
├── tools/
│   ├── package.json               # Frame optimization tooling dependencies (sharp)
│   └── process_frames.js          # One-off frame processing & WebP conversion pipeline
├── .gitignore                     # Git exclusions (node_modules, caches, OS files)
└── README.md                      # Project documentation
```

---

## Local Setup & Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer recommended) **OR** any static file server (e.g., VS Code *Live Server*, Python `http.server`).

### Method 1: Using the Built-In Node Server (Recommended)
Clone the repository and run the pre-configured local server:

```bash
# 1. Clone the repository
git clone https://github.com/SiddCraft/Car-Website.git

# 2. Navigate into the project directory
cd Car-Website

# 3. Start the server
node server.js
```

Open your browser and navigate to:
```
http://localhost:3000/
```

### Method 2: Using VS Code Live Server
1. Open the project folder in **VS Code**.
2. Right-click [`index.html`](file:///c:/Users/ellab/OneDrive/Desktop/car%20website/index.html) and select **Open with Live Server**.

### Method 3: Using Python HTTP Server
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000/`.

---

## Configuration Reference (`config.js`)

All critical dimensions, frame quantities, telemetry values, and callout coordinates can be tuned without modifying the application code:

```javascript
// Example snippet from config.js
CONFIG.sections.hero = {
  heightVh: 600,                   // Scroll distance for Hero sequence
  initialPreloadCount: 40,          // Frames required before site reveal
  fadeBlackRange: [0.95, 1.0],      // Last 5% of scroll transitions to black
  hud: {
    speedMax: 118,                  // 0 -> 118 KM/H
    distanceMax: 4.2                // 0.0 -> 4.2 KM
  }
};
```

---

## License & Credits

- **Brand:** NOCTIS is an original fictional electric vehicle design concept.
- **License:** MIT License. Feel free to explore, study, and adapt for creative scrollytelling implementations.
