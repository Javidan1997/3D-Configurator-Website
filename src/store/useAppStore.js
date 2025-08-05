// src/store/useAppStore.js
import { create } from "zustand";

// --- possible values for speed challenge ---
const COLORS = ["#308CFF", "#14e3a1", "#f35", "#f5c84b"];
const BODIES = ["Cube", "Pyramid", "Cylinder"];
const WHEELS = ["Thin", "Chunky"];

// helper to pick a random element
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// build a new random target
const makeTarget = () => ({
  color: rand(COLORS),
  body:  rand(BODIES),
  wheels: rand(WHEELS),
});

export const useAppStore = create((set, get) => ({
  // ─────────────────────────────────────────────────────────────
  // Global UI state for Hero3D
  // ─────────────────────────────────────────────────────────────
  env: "studio",                  // drei Environment preset
  lightRotation: 0,               // hero light spin angle (radians)
  setEnv:       (env) => set({ env }),
  setLightRotation: (r) => set({ lightRotation: r }),

  // ─────────────────────────────────────────────────────────────
  // Speed Challenge state
  // ─────────────────────────────────────────────────────────────
  time:   0,                      // elapsed time in seconds
  target: makeTarget(),           // random config to match
  choice: {                       // user’s current pick
    color:  null,
    body:   null,
    wheels: null,
  },

  // advance timer by 0.01s
  tick: () =>
    set((state) => ({
      time: Number((state.time + 0.01).toFixed(2)),
    })),

  // user selects one attribute
  setChoice: (key, value) =>
    set((state) => ({
      choice: { ...state.choice, [key]: value },
    })),

  // reset timer, clear choice, generate a new random target
  resetGame: () =>
    set({
      time:   0,
      target: makeTarget(),
      choice: { color: null, body: null, wheels: null },
    }),
}));
