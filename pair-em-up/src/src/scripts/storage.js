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
    loadSettings: function () {
      const data = loadData();
      if (!data.settings) {
        return gameState.settings;
      }
      return data.settings;
    },
  };
}
