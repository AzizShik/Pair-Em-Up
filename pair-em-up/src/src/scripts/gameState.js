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
};
