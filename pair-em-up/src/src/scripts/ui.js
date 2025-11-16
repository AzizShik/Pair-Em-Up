import { createElement, qsElement } from './utils/dom.js';
import { gameState } from './gameState.js';

export function createUI() {
  function createStartScreen() {
    const appEl = createElement({ tag: 'div', classArr: ['app'], id: 'app' });
    document.body.append(appEl);

    const isSavedGame = gameState.currentGame ? true : false;

    const startScreenEl = createElement({
      tag: 'div',
      classArr: ['start-screen'],
    });

    createElement({
      tag: 'h1',
      classArr: ['start-screen__title'],
      text: "Pair 'em Up",
      parent: startScreenEl,
    });

    createElement({
      tag: 'div',
      classArr: ['start-screen__author'],
      children: [
        createElement({
          tag: 'span',
          text: 'Created by ',
          classArr: ['start-screen__author-span'],
        }),
        createElement({
          tag: 'a',
          attr: { target: '_blank' },
          text: 'AzizShik',
          href: 'https://github.com/AzizShik',
          classArr: ['start-screen__author-link'],
        }),
      ],
      parent: startScreenEl,
    });

    createElement({
      tag: 'div',
      classArr: ['start-screen__mode-wrapper'],
      children: [
        createElement({
          tag: 'button',
          classArr: ['start-screen__mode-btn', 'button'],
          text: 'Classic Mode',
          id: 'mode-classic',
        }),
        createElement({
          tag: 'button',
          classArr: ['start-screen__mode-btn', 'button'],
          text: 'Random Mode',
          id: 'mode-random',
        }),
        createElement({
          tag: 'button',
          classArr: ['start-screen__mode-btn', 'button'],
          text: 'Chaotic Mode',
          id: 'mode-chaotic',
        }),
      ],
      parent: startScreenEl,
    });

    createElement({
      tag: 'div',
      classArr: ['start-screen__controls-wrapper'],
      children: [
        createElement({
          tag: 'button',
          classArr: [
            'start-screen__controls-btn',
            'button',
            'button--controls',
            !isSavedGame ? 'button--disabled' : '',
          ],
          attr: { disabled: !isSavedGame },
          text: 'Continue',
          id: 'controls-continue',
        }),
        createElement({
          tag: 'button',
          classArr: [
            'start-screen__controls-btn',
            'button',
            'button--controls',
          ],
          text: 'Settings',
          id: 'controls-settings',
        }),
        createElement({
          tag: 'button',
          classArr: [
            'start-screen__controls-btn',
            'button',
            'button--controls',
          ],
          text: 'Results',
          id: 'controls-results',
        }),
      ],
      parent: startScreenEl,
    });

    appEl.append(startScreenEl);
  }

  return {
    createStartScreen,
  };
}
