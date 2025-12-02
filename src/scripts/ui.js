import { createStartScreen } from './screens/createStartScreen.js';
import { createSettingsModal } from './screens/createSetingsModal.js';
import { createResultsModal } from './screens/createResultsModal.js';
import { createGameScreen } from './screens/createGameScreen.js';
import { createGameOutcomeModal } from './screens/createGameOutcomeModal.js';

export function createUI() {
  const screenConstructors = {
    start: createStartScreen,
    game: createGameScreen,
  };

  const settingsModal = createSettingsModal();
  const resultsModal = createResultsModal();
  const gameOutcomeModal = createGameOutcomeModal();

  function getSettingsModal() {
    return settingsModal;
  }

  function getResultsModal() {
    return resultsModal;
  }

  function getGameOutcomeModal() {
    return gameOutcomeModal;
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
    getGameOutcomeModal,
  };
}
