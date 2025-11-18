import { TARGET_SCORE } from './constants.js';

export const gameState = {
  mode: null,
  grid: [],
  score: 0,
  targetScore: TARGET_SCORE,
  settings: {
    theme: 'light',
    audioEnabled: true,
  },
  assists: {
    addNumbers: { used: 0, max: 10 },
    shuffle: { used: 0, max: 5 },
    eraser: { used: 0, max: 5 },
    hint: { used: 0, max: Infinity },
  },
  selectedCells: [],
  elapsedTime: 0,
  isGameActive: true,
  moveHistory: [],
};
