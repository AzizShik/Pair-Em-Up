import { createElement, qsElement } from './utils/dom.js';
import { gameState } from './gameState.js';
import { createStartScreen } from './screens/createStartScreen.js';

export function createUI() {
  const screenConstructors = {
    start: createStartScreen,
    // game: '',
    // settings: '',
    // results: '',
  };

  function getScreenConstructor(screenName) {
    return screenConstructors[screenName];
  }

  function getAllScreenNames() {
    return Object.keys(screenConstructors);
  }

  return {
    getScreenConstructor,
    getAllScreenNames,
  };
}
