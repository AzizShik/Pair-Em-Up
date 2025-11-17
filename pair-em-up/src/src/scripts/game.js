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

    loadSettings();

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
        saveSettings();
      };

      modalController.onAudioToggle = enabled => {
        currentSettings.audioEnabled = enabled;
        saveSettings();
      };

      modalController.onReset = () => {
        currentSettings = {
          audioEnabled: true,
          theme: 'light',
        };
        applyTheme('light');
        saveSettings();
      };

      modalController.onClose = () => {
        saveSettings();
      };
    }

    showStartScreen();
  }

  function showStartScreen() {
    screenManager.showScreen('start');

    const controller = screenManager.getCurrentController();
    if (controller) {
      controller.onSettings = showSettingsModal;
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

  function loadSettings() {
    const loaded = storage.loadSettings();
    if (loaded) {
      currentSettings = { ...currentSettings, ...loaded };
    }
  }

  function saveSettings() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved.settings = { ...currentSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function applyTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
  }

  return {
    init,
    showStartScreen,
    showSettingsModal,
  };
}
