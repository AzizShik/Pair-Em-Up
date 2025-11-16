import '../styles/main.scss';
import { createElement } from './utils/dom.js';
import { createUI } from './ui.js';
import { gameState } from './gameState.js';
import { STORAGE_KEY } from './constants.js';
import { createStorage } from './storage.js';

const storage = createStorage();
const ui = createUI();

document.addEventListener('DOMContentLoaded', e => {
  initGame();

  ui.createStartScreen();

  document.documentElement.dataset.theme = 'light';
});

function initGame() {
  if (localStorage.getItem(STORAGE_KEY)) {
    Object.assign(gameState, storage.loadData());
  }
}
