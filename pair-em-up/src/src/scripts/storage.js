import { gameState } from './gameState.js';
import { STORAGE_KEY } from './constants.js';

export function createStorage() {
  function loadData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  return {
    loadSettings() {
      const data = loadData();
      return data.settings || gameState.settings;
    },

    saveSettings(settings) {
      const data = loadData();
      data.settings = settings;
      saveData(data);
    },

    loadResults() {
      const data = loadData();
      return data.results || [];
    },

    saveResults(results) {
      const data = loadData();
      data.results = results;
      saveData(data);
    },

    loadCurrentGame() {
      const data = loadData();
      return data.currentGame;
    },

    clearCurrentGame() {
      const data = loadData();
      delete data.currentGame;
      saveData(data);
    },
  };
}
