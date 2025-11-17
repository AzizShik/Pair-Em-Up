import { createElement, qsAll, qsElement } from '../utils/dom.js';
import { gameState } from '../gameState.js';
import { STORAGE_KEY } from '../constants.js';

export function createStartScreen() {
  const isSavedGame = !!gameState.currentGame;

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
        data: { mode: 'classic' },
      }),
      createElement({
        tag: 'button',
        classArr: ['start-screen__mode-btn', 'button'],
        text: 'Random Mode',
        id: 'mode-random',
        data: { mode: 'random' },
      }),
      createElement({
        tag: 'button',
        classArr: ['start-screen__mode-btn', 'button'],
        text: 'Chaotic Mode',
        id: 'mode-chaotic',
        data: { mode: 'chaotic' },
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
        classArr: ['start-screen__controls-btn', 'button', 'button--controls'],
        text: 'Settings',
        id: 'controls-settings',
      }),
      createElement({
        tag: 'button',
        classArr: ['start-screen__controls-btn', 'button', 'button--controls'],
        text: 'Results',
        id: 'controls-results',
      }),
    ],
    parent: startScreenEl,
  });

  const controller = {
    onModeSelect: null,
    onContinue: null,
    onSettings: null,
    onResults: null,
  };

  function setupEventListeners() {
    startScreenEl.querySelectorAll('.start-screen__mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        controller.onModeSelect?.(btn.dataset.mode);
      });
    });

    startScreenEl
      .querySelector('#controls-continue')
      .addEventListener('click', () => controller.onContinue?.());

    startScreenEl
      .querySelector('#controls-settings')
      .addEventListener('click', () => controller.onSettings?.());

    startScreenEl
      .querySelector('#controls-results')
      .addEventListener('click', () => controller.onResults?.());
  }

  function onShow() {
    updateContinueButton();
    setupEventListeners();
  }

  function updateContinueButton() {
    const continueBtn = qsElement('#controls-continue');
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    const hasSavedGame = !!saved.currentGame;

    if (!continueBtn) return;

    if (hasSavedGame) {
      continueBtn.classList.remove('button--disabled');
      continueBtn.disabled = false;
    } else {
      continueBtn.classList.add('button--disabled');
      continueBtn.disabled = true;
    }
  }

  return {
    element: startScreenEl,
    controller,
    onShow,
  };
}
