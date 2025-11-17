import { createElement, qsElement } from './utils/dom.js';
import { gameState } from './gameState.js';
import { createStartScreen } from './screens/createStartScreen.js';
import { createSettingsModal } from './screens/createSetingsModal.js';
import { createResultsModal } from './screens/createResultsModal.js';

export function createUI() {
  const screenConstructors = {
    start: createStartScreen,
    // game: '',
  };

  const settingsModal = createSettingsModal();
  const resultsModal = createResultsModal();

  function getSettingsModal() {
    return settingsModal;
  }

  function getResultsModal() {
    return resultsModal;
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
    getResultsModal,
  };
}
