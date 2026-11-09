/**
 * NOCTIS Configuration
 * All section heights, chapter ranges, frame counts, frame paths, and callout coordinates.
 */
const CONFIG = {
  frames: {
    hero: {
      desktop: {
        count: 598,
        path: 'assets/frames/hero/frame_',
        ext: '.webp',
        digits: 4
      },
      mobile: {
        count: 598,
        path: 'assets/frames/hero-mobile/frame_',
        ext: '.webp',
        digits: 4
      }
    },
    dismantle: {
      desktop: {
        count: 200,
        path: 'assets/frames/dismantle/frame_',
        ext: '.webp',
        digits: 4
      },
      mobile: {
        count: 200,
        path: 'assets/frames/dismantle-mobile/frame_',
        ext: '.webp',
        digits: 4
      }
    }
  },

  sections: {
    hero: {
      heightVh: 600, // 600vh scroll wrapper
      initialPreloadCount: 40,
      fadeBlackRange: [0.95, 1.0], // Canvas fades to solid black in last 5%
      hud: {
        speedMax: 118,      // 000 -> 118 KM/H
        distanceMax: 4.2    // 0.0 -> 4.2 KM
      },
      chapters: [
        {
          id: '01',
          range: [0.0, 0.12],
          subtitle: 'The city is asleep.',
          hint: 'SCROLL TO WAKE IT'
        },
        {
          id: '02',
          range: [0.22, 0.40],
          title: "It doesn't need the city's light."
        },
        {
          id: '03',
          range: [0.50, 0.68],
          title: 'It brings its own.'
        },
        {
          id: '04',
          range: [0.80, 1.0],
          title: 'GT-E',
          specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
          cta: 'Discover the GT-E',
          ctaHref: '#lineup'
        }
      ]
    },

    statement: {
      tag: '02 — ENGINEERING',
      text: 'Every part was designed to disappear into one line of light.'
    },

    dismantle: {
      heightVh: 350, // 350vh scroll wrapper
      title: 'Look closer.',
      calloutsThreshold: 0.70, // Callouts begin fading in after 70% progress
      callouts: [
        {
          id: 'body',
          label: 'BODY',
          detail: 'Carbon composite monocoque',
          progressIn: 0.72,
          // Percentage coordinates on the car stage (tuned for desktop 16:9)
          dot: { x: 48, y: 34 },
          text: { x: 26, y: 22 }
        },
        {
          id: 'battery',
          label: 'BATTERY',
          detail: '110 kWh structural pack',
          progressIn: 0.79,
          dot: { x: 53, y: 68 },
          text: { x: 58, y: 78 }
        },
        {
          id: 'drive',
          label: 'DRIVE',
          detail: 'Dual axial-flux motors, 680 kW',
          progressIn: 0.86,
          dot: { x: 72, y: 52 },
          text: { x: 75, y: 38 }
        },
        {
          id: 'light',
          label: 'LIGHT',
          detail: 'Single-line LED signature',
          progressIn: 0.93,
          dot: { x: 23, y: 52 },
          text: { x: 14, y: 64 }
        }
      ]
    },

    lineup: {
      tag: '03 — THE LINEUP',
      title: 'Five ways to drive the night.',
      defaultOpenIndex: 0,
      hoverDebounceMs: 80,
      models: [
        {
          id: 'gt-e',
          num: '01',
          name: 'GT-E',
          verticalName: '01 GT-E',
          subtitle: 'The grand tourer.',
          specs: [
            { label: 'RANGE', value: '640 KM' },
            { label: '0–100 KM/H', value: '3.1 S' },
            { label: 'POWER', value: '680 KW' }
          ],
          image: 'assets/cars/gt-e.webp',
          colors: [
            { name: 'Matte Graphite', hex: '#1A1D20' },
            { name: 'Obsidian', hex: '#0D0E10' },
            { name: 'Xenon Blue', hex: '#1E2838' },
            { name: 'Chalk', hex: '#D0CDC7' }
          ]
        },
        {
          id: 's',
          num: '02',
          name: 'S',
          verticalName: '02 S',
          subtitle: 'Four doors, no compromise.',
          specs: [
            { label: 'RANGE', value: '600 KM' },
            { label: '0–100 KM/H', value: '3.6 S' },
            { label: 'POWER', value: '520 KW' }
          ],
          image: 'assets/cars/s.webp',
          colors: [
            { name: 'Satin Bone', hex: '#EDEAE4' },
            { name: 'Basalt', hex: '#1C1E22' },
            { name: 'Dark Night', hex: '#10141D' },
            { name: 'Slate', hex: '#4B515D' }
          ]
        },
        {
          id: 'x',
          num: '03',
          name: 'X',
          verticalName: '03 X',
          subtitle: 'Higher, never heavier.',
          specs: [
            { label: 'RANGE', value: '560 KM' },
            { label: '0–100 KM/H', value: '4.2 S' },
            { label: 'POWER', value: '480 KW' }
          ],
          image: 'assets/cars/x.webp',
          colors: [
            { name: 'Midnight Blue', hex: '#121C2B' },
            { name: 'Carbon', hex: '#151618' },
            { name: 'Arctic', hex: '#CFE3FF' },
            { name: 'Smoke', hex: '#5C626E' }
          ]
        },
        {
          id: 'r',
          num: '04',
          name: 'R',
          verticalName: '04 R',
          subtitle: 'Built for the track.',
          specs: [
            { label: 'RANGE', value: '420 KM' },
            { label: '0–100 KM/H', value: '2.4 S' },
            { label: 'POWER', value: '900 KW' }
          ],
          image: 'assets/cars/r.webp',
          colors: [
            { name: 'Satin Black', hex: '#0A0B0D' },
            { name: 'Racing Carmine', hex: '#E1251B' },
            { name: 'Stealth Grey', hex: '#25272B' },
            { name: 'Pure White', hex: '#F5F5F7' }
          ]
        },
        {
          id: 'one',
          num: '05',
          name: 'ONE',
          verticalName: '05 ONE',
          subtitle: 'The future, early.',
          specs: [
            { label: 'STATUS', value: 'CONCEPT' },
            { label: 'POWERTRAIN', value: 'QUAD AXIAL' },
            { label: 'AERODYNAMICS', value: 'ACTIVE VORTEX' }
          ],
          image: 'assets/cars/one.webp',
          colors: [
            { name: 'Liquid Silver', hex: '#B8C2CC' },
            { name: 'Solar Black', hex: '#0B0C0E' },
            { name: 'Prismatic', hex: '#8898AA' },
            { name: 'Deep Void', hex: '#050608' }
          ]
        }
      ]
    },

    reserve: {
      title: 'Drive the night.',
      subtitle: 'Production begins 2027. Limited allocation available by application.',
      buttonText: 'RESERVE YOUR NOCTIS'
    }
  },

  motion: {
    frameLerp: 0.15,
    cursorLerp: 0.18,
    reducedMotionKeyframes: {
      hero: [0.0, 0.35, 0.65, 1.0],
      dismantle: [0.0, 1.0]
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
