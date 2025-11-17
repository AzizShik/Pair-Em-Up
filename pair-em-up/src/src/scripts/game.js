import { STORAGE_KEY } from './constants';
import { gameState } from './gameState';
import { createStorage } from './storage';
import { createUI } from './ui';

export function createGame(screenManager) {
  let timerInterval = null;
  let startTime = null;
  let elapsedTime = 0;
  let timerCallback = null;

  const ui = createUI();
  const storage = createStorage();

  function init() {
    const screenNames = ui.getAllScreenNames();

    screenNames.forEach(screenName => {
      const constuctor = ui.getScreenConstructor(screenName);
      screenManager.registerScreen(screenName, constuctor);
    });

    showStartScreen();

    const settings = storage.loadSettings();

    if (settings?.theme) {
      document.documentElement.dataset.theme = settings.theme;
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  }

  function showStartScreen() {
    screenManager.showScreen('start');

    const controller = screenManager.getCurrentController();
    if (controller) {
      // controller.onModeSelect = startGame;
      // controller.onContinue = continueGame;
      controller.onSettings = showSettingsScreen;
      // controller.onResults = showResultsScreen;
    }
  }

  function showSettingsScreen() {
    console.log('settings');
  }

  return {
    init,
    showStartScreen,
  };
}
