import '../styles/main.scss';
import { createElement } from './utils/dom.js';
import { createUI } from './ui.js';
import { gameState } from './gameState.js';
import { STORAGE_KEY } from './constants.js';
import { createStorage } from './storage.js';
import { createScreenManager } from './screenManager.js';
import { createGame } from './game.js';

document.addEventListener('DOMContentLoaded', e => {
  const appEl = createElement({ tag: 'div', classArr: ['app'], id: 'app' });
  document.body.append(appEl);

  const screenManager = createScreenManager(appEl);
  const game = createGame(screenManager);

  game.init();
});
