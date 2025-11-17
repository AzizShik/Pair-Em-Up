import { createElement, qsElement, qsAll } from '../utils/dom.js';
import { gameState } from '../gameState.js';
import { TARGET_SCORE, STORAGE_KEY } from '../constants.js';
import { openModal } from '../utils/modal.js';

export function createGameScreen({ mode, savedState }) {
  const screen = createElement({
    tag: 'div',
    classArr: ['game-screen'],
    text: `In progress...`,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__p'],
    text: `Just wanted to inform you that my project is still in development. As this is my first serious project.`,
    parent: screen,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__p'],
    text: `I would really appreciate it if I could have some extra time to finish it. Could you please check it later?`,
    parent: screen,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__p'],
    text: `Thank you for your understanding.`,
    parent: screen,
  });

  function onShow() {}

  function onDestroy() {}

  return {
    element: screen,
    onShow,
    onDestroy,
  };
}
