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

  let currentSettings = storage.loadSettings() || { ...gameState.settings };

  function init() {
    const screenNames = ui.getAllScreenNames();

    screenNames.forEach(screenName => {
      const constuctor = ui.getScreenConstructor(screenName);
      screenManager.registerScreen(screenName, constuctor);
    });

    storage.loadSettings();

    if (currentSettings?.theme) {
      applyTheme(currentSettings.theme);
    } else {
      applyTheme('light');
    }

    const settingsModal = ui.getSettingsModal();
    if (settingsModal && settingsModal.controller) {
      const modalController = settingsModal.controller;

      modalController.onThemeChange = theme => {
        currentSettings.theme = theme;
        applyTheme(theme);
        storage.saveSettings(currentSettings);
      };

      modalController.onAudioToggle = enabled => {
        currentSettings.audioEnabled = enabled;
        storage.saveSettings(currentSettings);
      };

      modalController.onReset = () => {
        currentSettings = {
          audioEnabled: true,
          theme: 'light',
        };
        applyTheme('light');
        storage.saveSettings(currentSettings);
      };

      modalController.onClose = () => {
        storage.saveSettings(currentSettings);
      };
    }

    showStartScreen();
  }

  function showStartScreen() {
    screenManager.showScreen('start');

    const controller = screenManager.getCurrentController();
    if (controller) {
      controller.onSettings = showSettingsModal;
      controller.onResults = showResultsModal;
    }
  }

  function showSettingsModal() {
    const settingsModal = ui.getSettingsModal();
    if (settingsModal && settingsModal.controller) {
      if (typeof settingsModal.controller.setSettings === 'function') {
        settingsModal.controller.setSettings(currentSettings);
      }
      settingsModal.controller.show();
    }
  }

  function showResultsModal() {
    const resultsModal = ui.getResultsModal();
    if (!resultsModal || !resultsModal.controller) return;

    const results = storage.loadResults();

    console.log(results);

    if (typeof resultsModal.render === 'function') {
      resultsModal.render(results);
    }

    resultsModal.controller.show();
  }

  function applyTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
  }

  return {
    init,
    showStartScreen,
    showSettingsModal,
    showResultsModal,
  };
}
