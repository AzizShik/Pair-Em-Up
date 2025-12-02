import '../styles/main.scss';
import { createElement } from './utils/dom.js';
import { createScreenManager } from './screenManager.js';
import { createGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  const appEl = createElement({ tag: 'div', classArr: ['app'], id: 'app' });
  document.body.append(appEl);

  const screenManager = createScreenManager(appEl);
  const game = createGame(screenManager);

  game.init();
});
