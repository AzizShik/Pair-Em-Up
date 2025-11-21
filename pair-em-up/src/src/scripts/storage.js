import { gameState, settings } from './gameState.js';
import { SETTINGS_STORAGE_KEY, STORAGE_KEY } from './constants.js';

export function createStorage() {
  function loadData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || gameState;
  }

  function loadSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || settings;
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return {
    loadData,
    saveData,
    loadSettings,
    saveSettings,

    loadResults() {
      const data = loadData();
      return data.results || [];
    },

    saveResults(results) {
      const data = loadData();
      data.results = results;
      saveData(data);
    },

    loadSavedGame() {
      const data = loadData();
      return data.savedGame;
    },

    clearCurrentGame() {
      const data = loadData();
      delete data.savedGame;
      saveData(data);
    },
  };
}
