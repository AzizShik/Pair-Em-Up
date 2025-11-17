import { createElement, qsElement } from './utils/dom.js';
import { gameState } from './gameState.js';
import { createStartScreen } from './screens/createStartScreen.js';
import { createSettingsModal } from './screens/createSetingsModal.js';

export function createUI() {
  const screenConstructors = {
    start: createStartScreen,
    // settings: createSettingsScreen,
    // game: '',
    // results: '',
  };

  const settingsModal = createSettingsModal();

  function getSettingsModal() {
    return settingsModal;
  }

  function getScreenConstructor(screenName) {
    return screenConstructors[screenName];
  }

  function getAllScreenNames() {
    return Object.keys(screenConstructors);
  }

  return {
    getScreenConstructor,
    getAllScreenNames,
    getSettingsModal,
  };
}
