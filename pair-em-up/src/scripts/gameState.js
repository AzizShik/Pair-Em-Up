import { TARGET_SCORE } from './constants.js';

export const gameState = {
  mode: null,
  grid: [],
  score: 0,
  targetScore: TARGET_SCORE,

  assists: {
    addNumbers: { used: 0, max: 10 },
    shuffle: { used: 0, max: 5 },
    eraser: { used: 0, max: 5 },
    revert: { used: 0, max: 1 },
  },
  hint: 0,
  selectedCells: [],
  elapsedTime: 0,
  isGameActive: true,
  moveHistory: [],
  canRevert: false,
};

export const settings = {
  theme: 'light',
  isAudioEnabled: true,
};

export function resetGameState() {
  gameState.score = 0;
  gameState.elapsedTime = 0;
  gameState.selectedCells = [];
  gameState.grid = [];
  gameState.isGameActive = true;
  gameState.moveHistory = [];
  gameState.canRevert = false;

  Object.keys(gameState.assists).forEach(key => {
    gameState.assists[key].used = 0;
  });
}

export function getSaveData() {
  return {
    mode: gameState.mode,
    grid: JSON.parse(JSON.stringify(gameState.grid)),
    score: gameState.score,
    elapsedTime: gameState.elapsedTime,
    isGameActive: gameState.isGameActive,
    assists: JSON.parse(JSON.stringify(gameState.assists)),
    moveHistory: JSON.parse(JSON.stringify(gameState.moveHistory)),
  };
}

export function loadGameState(savedGame) {
  if (!savedGame) return;
  Object.assign(gameState, savedGame);
}
