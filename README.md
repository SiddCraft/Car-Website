# ⚡ NOCTIS | Electric Scrollytelling Experience

A minimal, high-performance scrollytelling web experience for **NOCTIS**, a fictional electric car brand. Set in a city under total blackout at night, the car’s light is the only illumination in the world—crafted with zero external frameworks or libraries.

---

### 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Rendering:** HTML5 `<canvas>` API (60 FPS scroll-scrubbed sequences)
- **Local Server:** Node.js (Built-in HTTP server, zero dependencies)

---

### ✨ Key Features
- **Cinematic Scrollytelling:** Scroll-driven video playback scrubbed across high-definition WebP frames.
- **Exploded View (Dismantle):** Interactive teardown sequence revealing chassis, battery, and axial motors.
- **Interactive Lineup Accordion:** Smooth horizontal model slider with live color swatches and keyboard navigation.
- **Custom Headlight Cursor:** Contextual cursor that follows mouse movement and morphs over active elements.
- **Fully Responsive & Accessible:** Optimized layout for mobile devices with reduced-motion fallback.

---

### 📁 Project Structure
```text
├── assets/
│   ├── cars/          # Lineup product images
│   └── frames/        # Desktop & mobile WebP frame sequences
├── config.js          # Site configuration and sequence metadata
├── index.html         # Semantic HTML markup
├── main.js            # Scrollytelling engine, cursor & interactions
├── styles.css         # Flat solid styling & typography
└── server.js          # Lightweight Node.js local server
```

---

### 🚀 Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SiddCraft/Car-Website.git
   cd Car-Website
   ```

2. **Start the local server:**
   ```bash
   node server.js
   ```

3. **Open in browser:** Visit [http://localhost:3000](http://localhost:3000)

---

### 🔗 Repository
- **GitHub:** [https://github.com/SiddCraft/Car-Website](https://github.com/SiddCraft/Car-Website)
