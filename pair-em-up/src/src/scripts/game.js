import { createUI } from './ui.js';
import { gameState } from './gameState.js';
import { createStorage } from './storage.js';

export function createGame(screenManager) {
  const ui = createUI();
  const storage = createStorage();
  let currentSettings = storage.loadSettings();

  function init() {
    const screenNames = ui.getAllScreenNames();
    screenNames.forEach(name => {
      const ctor = ui.getScreenConstructor(name);
      if (ctor) screenManager.registerScreen(name, ctor);
    });

    applyTheme(currentSettings.theme || 'light');
    setupModals();
    showStartScreen();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function setupModals() {
    const settingsModal = ui.getSettingsModal();
    if (settingsModal?.controller) {
      settingsModal.controller.onThemeChange = theme => {
        currentSettings.theme = theme;
        applyTheme(theme);
        storage.saveSettings(currentSettings);
      };
      settingsModal.controller.onAudioToggle = enabled => {
        currentSettings.audioEnabled = enabled;
        storage.saveSettings(currentSettings);
      };
      settingsModal.controller.onReset = () => {
        currentSettings = { theme: 'light', audioEnabled: true };
        applyTheme('light');
        storage.saveSettings(currentSettings);
      };
    }
  }

  function showStartScreen() {
    screenManager.showScreen('start');

    const controller = screenManager.getCurrentController();
    if (!controller) return;

    controller.onModeSelect = mode => {
      gameState.mode = mode;

      screenManager.showScreen('game', { mode });
    };

    controller.onContinue = () => {
      const savedGame = storage.loadCurrentGame();

      if (!savedGame) {
        controller.disableContinue?.();
        return;
      }

      Object.assign(gameState, savedGame.gameState);
      screenManager.showScreen('game', {
        mode: gameState.mode,
        savedState: savedGame,
      });
    };

    controller.onSettings = () => ui.getSettingsModal().controller.show();

    controller.onResults = () => {
      const results = storage.loadResults();
      const modal = ui.getResultsModal();
      if (modal.render) {
        const top5 = results.sort((a, b) => a.timeSec - b.timeSec).slice(0, 5);
        modal.render(top5);
      }
      modal.controller.show();
    };
  }

  return { init };
}
