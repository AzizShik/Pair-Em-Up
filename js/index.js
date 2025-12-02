(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function createElement(options) {
  const {
    tag = "div",
    text = "",
    parent,
    children = [],
    classArr = [],
    id = "",
    data = {},
    attr = {},
    src = "",
    href = ""
  } = options;
  const element = document.createElement(tag);
  element.textContent = text;
  if (classArr.length > 0) {
    element.classList.add(...classArr);
  }
  if (parent != null) {
    parent.append(element);
  }
  if (children.length > 0) {
    element.append(...children);
  }
  if (src) {
    element.src = src;
  }
  if (id) {
    element.id = id;
  }
  if (href) {
    element.href = href;
  }
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) {
      element.dataset[key] = value;
    }
  });
  Object.entries(attr).forEach(([key, value]) => {
    if (value !== null) {
      element.setAttribute(key, value);
    }
  });
  return element;
}
function qsElement(selector, root = document) {
  return root.querySelector(selector);
}
function createScreenManager(appElement) {
  let currentScreen = null;
  const screenConstructors = /* @__PURE__ */ new Map();
  function registerScreen(name, constructor) {
    screenConstructors.set(name, constructor);
  }
  function showScreen(name, data = {}) {
    if (currentScreen) {
      currentScreen.element.remove();
      if (currentScreen.onDestroy) {
        currentScreen.onDestroy();
      }
      currentScreen = null;
    }
    const screenConstructor = screenConstructors.get(name);
    if (screenConstructor) {
      const screen = screenConstructor(data);
      appElement.append(screen.element);
      currentScreen = {
        name,
        element: screen.element,
        controller: screen.controller,
        onDestroy: screen.onDestroy
      };
      if (screen.onShow) {
        screen.onShow();
      }
    }
  }
  function getCurrentScreen() {
    return currentScreen && currentScreen.name;
  }
  function getCurrentController() {
    return currentScreen && currentScreen.controller;
  }
  return {
    registerScreen,
    showScreen,
    getCurrentScreen,
    getCurrentController
  };
}
const TARGET_SCORE = 100;
const STORAGE_KEY = "pairEmUp";
const SETTINGS_STORAGE_KEY = "pairEmUpSettings";
const GRID_COLS = 9;
const MAX_LINES = 50;
const gameState = {
  mode: null,
  grid: [],
  score: 0,
  targetScore: TARGET_SCORE,
  assists: {
    addNumbers: { used: 0, max: 10 },
    shuffle: { used: 0, max: 5 },
    eraser: { used: 0, max: 5 },
    revert: { used: 0, max: 1 }
  },
  hint: 0,
  selectedCells: [],
  elapsedTime: 0,
  isGameActive: true,
  moveHistory: [],
  canRevert: false
};
const settings = {
  theme: "light",
  isAudioEnabled: true
};
function resetGameState() {
  gameState.score = 0;
  gameState.elapsedTime = 0;
  gameState.selectedCells = [];
  gameState.grid = [];
  gameState.isGameActive = true;
  gameState.moveHistory = [];
  gameState.canRevert = false;
  Object.keys(gameState.assists).forEach((key) => {
    gameState.assists[key].used = 0;
  });
}
function getSaveData() {
  return {
    mode: gameState.mode,
    grid: JSON.parse(JSON.stringify(gameState.grid)),
    score: gameState.score,
    elapsedTime: gameState.elapsedTime,
    isGameActive: gameState.isGameActive,
    assists: JSON.parse(JSON.stringify(gameState.assists))
  };
}
function loadGameState(savedGame) {
  if (!savedGame) return;
  Object.assign(gameState, savedGame);
}
function createStartScreen() {
  const isSavedGame = !!gameState;
  const startScreenEl = createElement({
    tag: "div",
    classArr: ["start-screen"]
  });
  createElement({
    tag: "h1",
    classArr: ["start-screen__title"],
    text: "Pair 'em Up",
    parent: startScreenEl
  });
  createElement({
    tag: "div",
    classArr: ["start-screen__author"],
    children: [
      createElement({
        tag: "span",
        text: "Created by ",
        classArr: ["start-screen__author-span"]
      }),
      createElement({
        tag: "a",
        attr: { target: "_blank" },
        text: "AzizShik",
        href: "https://github.com/AzizShik",
        classArr: ["start-screen__author-link"]
      })
    ],
    parent: startScreenEl
  });
  createElement({
    tag: "div",
    classArr: ["start-screen__mode-wrapper"],
    children: [
      createElement({
        tag: "button",
        classArr: ["start-screen__mode-btn", "button"],
        text: "Classic Mode",
        id: "mode-classic",
        data: { mode: "classic" }
      }),
      createElement({
        tag: "button",
        classArr: ["start-screen__mode-btn", "button"],
        text: "Random Mode",
        id: "mode-random",
        data: { mode: "random" }
      }),
      createElement({
        tag: "button",
        classArr: ["start-screen__mode-btn", "button"],
        text: "Chaotic Mode",
        id: "mode-chaotic",
        data: { mode: "chaotic" }
      })
    ],
    parent: startScreenEl
  });
  createElement({
    tag: "div",
    classArr: ["start-screen__controls-wrapper"],
    children: [
      createElement({
        tag: "button",
        classArr: [
          "start-screen__controls-btn",
          "button",
          "button--controls",
          ...(!isSavedGame ? ["button--disabled"] : [""]).filter(Boolean)
        ],
        attr: { disabled: !isSavedGame },
        text: "Continue",
        id: "controls-continue"
      }),
      createElement({
        tag: "button",
        classArr: ["start-screen__controls-btn", "button", "button--controls"],
        text: "Settings",
        id: "controls-settings"
      }),
      createElement({
        tag: "button",
        classArr: ["start-screen__controls-btn", "button", "button--controls"],
        text: "Results",
        id: "controls-results"
      })
    ],
    parent: startScreenEl
  });
  const controller = {
    onModeSelect: null,
    onContinue: null,
    onSettings: null,
    onResults: null
  };
  function setupEventListeners() {
    startScreenEl.querySelectorAll(".start-screen__mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (controller.onModeSelect) {
          controller.onModeSelect(btn.dataset.mode);
        }
      });
    });
    startScreenEl.querySelector("#controls-continue").addEventListener("click", () => {
      if (controller.onContinue) controller.onContinue();
    });
    startScreenEl.querySelector("#controls-settings").addEventListener("click", () => {
      if (controller.onSettings) controller.onSettings();
    });
    startScreenEl.querySelector("#controls-results").addEventListener("click", () => {
      if (controller.onResults) controller.onResults();
    });
  }
  setupEventListeners();
  function onShow() {
    updateContinueButton();
  }
  function updateContinueButton() {
    const continueBtn = qsElement("#controls-continue");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const hasSavedGame = !!saved.savedGame;
    if (!continueBtn) return;
    if (hasSavedGame) {
      continueBtn.classList.remove("button--disabled");
      continueBtn.disabled = false;
    } else {
      continueBtn.classList.add("button--disabled");
      continueBtn.disabled = true;
    }
  }
  return {
    element: startScreenEl,
    controller,
    onShow
  };
}
function createStorage() {
  function loadData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || gameState;
  }
  function loadSettings() {
    return JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || settings;
  }
  function saveSettings(settings2) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings2));
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
    }
  };
}
let audioContext;
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function playSound(type) {
  const storage = createStorage();
  const settings2 = storage.loadSettings();
  if (!settings2.isAudioEnabled) return;
  initAudio();
  let frequency, duration, typeOsc;
  switch (type) {
    case "select":
      frequency = 550;
      duration = 0.025;
      typeOsc = "triangle";
      break;
    case "valid":
      frequency = [660, 880];
      duration = 0.1;
      typeOsc = "triangle";
      break;
    case "invalid":
      frequency = 110;
      duration = 0.2;
      typeOsc = "sawtooth";
      break;
    case "assist":
      frequency = 784;
      duration = 0.08;
      typeOsc = "square";
      break;
    case "win":
      frequency = [1047, 1319, 1568];
      duration = 0.5;
      typeOsc = "sine";
      break;
    case "lose":
      frequency = [330, 165];
      duration = 0.4;
      typeOsc = "sawtooth";
      break;
    default:
      return;
  }
  if (Array.isArray(frequency)) {
    frequency.forEach((f, i) => {
      setTimeout(
        () => {
          generateTone(f, duration, typeOsc);
        },
        i * duration * 1e3 * 0.5
      );
    });
  } else {
    generateTone(frequency, duration, typeOsc);
  }
}
function generateTone(frequency, duration, typeOsc) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = typeOsc;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    1e-3,
    audioContext.currentTime + duration
  );
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}
let currentModal = null;
function openModal(modalElement) {
  if (currentModal && document.body.contains(currentModal)) {
    currentModal.remove();
  }
  document.body.append(modalElement);
  modalElement.classList.add("modal--active");
  document.body.style.overflow = "hidden";
  currentModal = modalElement;
  playSound("select");
}
function closeCurrentModal() {
  if (!currentModal) return;
  currentModal.classList.remove("modal--active");
  document.body.style.overflow = "";
  setTimeout(() => {
    if (document.body.contains(currentModal)) {
      currentModal.remove();
    }
    currentModal = null;
  }, 300);
  playSound("select");
}
function createSettingsModal() {
  const modal = createElement({
    tag: "div",
    classArr: ["modal", "settings-modal"]
  });
  const overlay = createElement({
    tag: "div",
    classArr: ["modal__overlay"],
    parent: modal
  });
  const content = createElement({
    tag: "div",
    classArr: ["modal__content"],
    parent: modal
  });
  createElement({
    tag: "div",
    classArr: ["modal__header"],
    parent: content,
    children: [
      createElement({
        tag: "h2",
        classArr: ["modal__title"],
        text: "Settings"
      }),
      createElement({
        tag: "button",
        classArr: ["modal__close-btn"],
        id: "modal-close",
        children: [
          createElement({ tag: "span", classArr: ["modal__close-btn__span"] }),
          createElement({ tag: "span", classArr: ["modal__close-btn__span"] })
        ]
      })
    ]
  });
  const settingsContainer = createElement({
    tag: "div",
    classArr: ["modal__body"],
    parent: content
  });
  const audioSection = createElement({
    tag: "div",
    classArr: ["settings-section"],
    parent: settingsContainer
  });
  createElement({
    tag: "h3",
    classArr: ["settings-section__title"],
    text: "Audio",
    parent: audioSection
  });
  createElement({
    tag: "label",
    classArr: ["settings-toggle"],
    parent: audioSection,
    children: [
      createElement({
        tag: "span",
        classArr: ["settings-toggle__label"],
        text: "Sound Effects"
      }),
      createElement({
        tag: "label",
        classArr: ["settings-toggle__switch"],
        children: [
          createElement({
            tag: "input",
            classArr: ["settings-toggle__switch-input"],
            id: "audio-toggle",
            attr: { type: "checkbox" }
          }),
          createElement({
            tag: "span",
            classArr: ["settings-toggle__slider"]
          })
        ]
      })
    ]
  });
  const themeSection = createElement({
    tag: "div",
    classArr: ["settings-section"],
    parent: settingsContainer
  });
  createElement({
    tag: "h3",
    classArr: ["settings-section__title"],
    text: "Theme",
    parent: themeSection
  });
  const themeOptions = createElement({
    tag: "div",
    classArr: ["settings-theme-options"],
    parent: themeSection
  });
  const themes = [
    { id: "light", name: "Light", icon: "☀️" },
    { id: "dark", name: "Dark", icon: "🌙" }
  ];
  themes.forEach((theme) => {
    createElement({
      tag: "label",
      classArr: ["settings-theme-option"],
      attr: { for: `theme-${theme.id}` },
      parent: themeOptions,
      children: [
        createElement({
          tag: "input",
          id: `theme-${theme.id}`,
          attr: {
            type: "radio",
            name: "theme",
            value: theme.id
          }
        }),
        createElement({
          tag: "span",
          classArr: ["settings-theme-option__preview"],
          text: `${theme.icon}${theme.name}`
        })
      ]
    });
  });
  createElement({
    tag: "div",
    classArr: ["modal__footer"],
    parent: content,
    children: [
      createElement({
        tag: "button",
        classArr: ["button", "button--secondary"],
        text: "Reset to Defaults",
        id: "settings-reset"
      })
    ]
  });
  const controller = {
    onClose: null,
    onThemeChange: null,
    onAudioToggle: null,
    onReset: null,
    show: null,
    hide: null,
    setSettings: null
  };
  const storage = createStorage();
  let currentSettings = storage.loadSettings();
  function setupEventListeners() {
    const closeBtn = qsElement("#modal-close", modal);
    if (closeBtn) closeBtn.addEventListener("click", hide);
    overlay.addEventListener("click", hide);
    const resetBtn = qsElement("#settings-reset", modal);
    if (resetBtn)
      resetBtn.addEventListener("click", () => {
        resetToDefaults();
        if (controller.onReset) controller.onReset();
      });
    const audioCheckbox = qsElement("#audio-toggle", modal);
    if (audioCheckbox)
      audioCheckbox.addEventListener("change", (e) => {
        currentSettings.isAudioEnabled = e.target.checked;
        if (controller.onAudioToggle)
          controller.onAudioToggle(e.target.checked);
      });
    const themeRadios = modal.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        currentSettings.theme = e.target.value;
        if (controller.onThemeChange) controller.onThemeChange(e.target.value);
      });
    });
  }
  setupEventListeners();
  function show() {
    openModal(modal);
    if (updateUI) updateUI();
  }
  function hide() {
    closeCurrentModal();
    setTimeout(() => {
      if (controller.onClose) controller.onClose();
    }, 300);
  }
  function setSettings(settings2) {
    if (!settings2) return;
    currentSettings = { ...currentSettings, ...settings2 };
    updateUI();
  }
  function resetToDefaults() {
    currentSettings = { isAudioEnabled: true, theme: "light" };
    updateUI();
    if (controller.onAudioToggle)
      controller.onAudioToggle(currentSettings.isAudioEnabled, false);
    if (controller.onThemeChange)
      controller.onThemeChange(currentSettings.theme, false);
  }
  function updateUI() {
    const audioCheckbox = qsElement("#audio-toggle", modal);
    if (audioCheckbox) audioCheckbox.checked = !!currentSettings.isAudioEnabled;
    const themeRadio = modal.querySelector(`#theme-${currentSettings.theme}`);
    if (themeRadio) themeRadio.checked = true;
  }
  function getCurrentSettings() {
    return { ...currentSettings };
  }
  controller.show = show;
  controller.hide = hide;
  controller.setSettings = setSettings;
  return {
    element: modal,
    controller,
    getCurrentSettings
  };
}
function createResultsModal() {
  const modal = createElement({
    tag: "div",
    classArr: ["modal", "results-modal"]
  });
  const overlay = createElement({
    tag: "div",
    classArr: ["modal__overlay"],
    parent: modal
  });
  const content = createElement({
    tag: "div",
    classArr: ["modal__content"],
    parent: modal
  });
  createElement({
    tag: "div",
    classArr: ["modal__header"],
    parent: content,
    children: [
      createElement({
        tag: "h2",
        classArr: ["modal__title"],
        text: "Game Results"
      }),
      createElement({
        tag: "button",
        classArr: ["modal__close-btn"],
        id: "modal-close",
        children: [
          createElement({ tag: "span", classArr: ["modal__close-btn__span"] }),
          createElement({ tag: "span", classArr: ["modal__close-btn__span"] })
        ]
      })
    ]
  });
  const settingsContainer = createElement({
    tag: "div",
    classArr: ["modal__body"],
    parent: content
  });
  const resultsTable = createElement({
    tag: "div",
    classArr: ["results-table"],
    parent: settingsContainer
  });
  const resultsTableHeaderTitles = ["Mode", "Score", "Time", "Moves", "Result"];
  const resultsTableHeader = createElement({
    tag: "div",
    classArr: ["results-table__header"],
    parent: resultsTable
  });
  resultsTableHeaderTitles.forEach((title) => {
    createElement({
      tag: "h3",
      classArr: ["results-table__header-title"],
      text: title,
      parent: resultsTableHeader
    });
  });
  const resultsTableBody = createElement({
    tag: "div",
    classArr: ["results-table__body"],
    parent: resultsTable
  });
  function render(results) {
    resultsTableBody.textContent = "";
    if (!results || results.length === 0) {
      createElement({
        tag: "div",
        classArr: ["results-table__empty"],
        text: "No games played yet",
        parent: resultsTableBody
      });
      return;
    }
    results.forEach((result) => {
      const row = createElement({
        tag: "div",
        classArr: ["results-table__row"],
        parent: resultsTableBody
      });
      createElement({
        tag: "div",
        classArr: ["results-table__cell"],
        text: result.mode,
        parent: row
      });
      createElement({
        tag: "div",
        classArr: ["results-table__cell"],
        text: result.score,
        parent: row
      });
      createElement({
        tag: "div",
        classArr: ["results-table__cell"],
        text: result.time,
        parent: row
      });
      createElement({
        tag: "div",
        classArr: ["results-table__cell"],
        text: result.moves,
        parent: row
      });
      createElement({
        tag: "div",
        classArr: ["results-table__cell"],
        text: result.result,
        parent: row
      });
    });
  }
  const controller = {
    onClose: null,
    show: null,
    hide: null
  };
  function setupEventListeners() {
    const closeBtn = qsElement("#modal-close", modal);
    if (closeBtn) closeBtn.addEventListener("click", hide);
    overlay.addEventListener("click", hide);
  }
  setupEventListeners();
  function show() {
    openModal(modal);
  }
  function hide() {
    closeCurrentModal();
  }
  controller.show = show;
  controller.hide = hide;
  return {
    element: modal,
    controller,
    render
  };
}
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function completeShuffle(matrix) {
  const flatArr = matrix.flat();
  const shuffledFlat = shuffleArray(flatArr);
  const res = [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let i = 0; i < rows; i++) {
    res.push(shuffledFlat.slice(i * cols, (i + 1) * cols));
  }
  return res;
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function createChaoticGrid(size) {
  const matrix = [];
  const randomArr = [];
  while (randomArr.length < size) {
    randomArr.push(getRandomInt(1, 9));
  }
  for (let i = 0; i < randomArr.length; i += 9) {
    matrix.push(randomArr.slice(i, i + 9));
  }
  return matrix;
}
function createGameScreen({ mode, savedState }) {
  const screen = createElement({
    tag: "div",
    classArr: ["game-screen"]
  });
  const modeTitle = `${mode.charAt(0).toUpperCase()}${mode.slice(1)} Mode`;
  const gameHeader = createElement({
    tag: "div",
    classArr: ["game-screen__header"],
    parent: screen
  });
  createElement({
    tag: "h2",
    classArr: ["game-screen__header-mode"],
    text: modeTitle,
    parent: gameHeader
  });
  const headerGameStats = createElement({
    tag: "div",
    classArr: ["game-screen__header-game-stats"],
    parent: gameHeader
  });
  const headerTimerEl = createElement({
    tag: "div",
    classArr: ["game-screen__header-timer"],
    parent: headerGameStats
  });
  createElement({
    tag: "div",
    classArr: ["game-screen__header-timer-text"],
    text: "Time",
    parent: headerTimerEl
  });
  createElement({
    tag: "div",
    classArr: ["game-screen__header-timer-display"],
    id: "timer-display",
    text: `00:00`,
    parent: headerTimerEl
  });
  const headerScoreEl = createElement({
    tag: "div",
    classArr: ["game-screen__header-score"],
    parent: headerGameStats
  });
  createElement({
    tag: "div",
    classArr: ["game-screen__header-score-text"],
    text: "Score",
    parent: headerScoreEl
  });
  createElement({
    tag: "div",
    classArr: ["game-screen__header-score-display"],
    id: "score-dispay",
    text: `0 / ${TARGET_SCORE}`,
    parent: headerScoreEl
  });
  const progressBarEl = createElement({
    tag: "div",
    classArr: ["game-screen__progress-bar"],
    parent: screen
  });
  createElement({
    tag: "p",
    classArr: ["game-screen__progress-bar-text"],
    text: "Progress to Win (100 Points)",
    parent: progressBarEl
  });
  const progressBarContainer = createElement({
    tag: "div",
    classArr: ["game-screen__progress-bar-container"],
    parent: progressBarEl
  });
  createElement({
    tag: "div",
    classArr: ["game-screen__progress-bar-fill"],
    id: "progress-fill",
    parent: progressBarContainer
  });
  const gameGridEl = createElement({
    tag: "div",
    classArr: ["game-screen__grid", "game-grid"],
    id: "game-grid",
    parent: screen
  });
  const toolsPanelEl = createElement({
    tag: "div",
    classArr: ["game-screen__tools"],
    parent: screen
  });
  createElement({
    tag: "button",
    text: "Save Game",
    id: "save-game",
    classArr: ["game-screen__tools-btn", "button", "button--secondary"],
    parent: toolsPanelEl
  });
  createElement({
    tag: "button",
    text: "Reset Game",
    id: "reset-game",
    classArr: ["game-screen__tools-btn", "button", "button--secondary"],
    parent: toolsPanelEl
  });
  createElement({
    tag: "button",
    text: "Settings",
    id: "settings",
    classArr: ["game-screen__tools-btn", "button", "button--secondary"],
    parent: toolsPanelEl
  });
  createElement({
    tag: "button",
    text: "Main Menu",
    id: "main-menu",
    classArr: ["game-screen__tools-btn", "button", "button--secondary"],
    parent: toolsPanelEl
  });
  createElement({
    tag: "div",
    classArr: ["game-screen__hints"],
    parent: screen,
    data: { assist: "hints" },
    children: [
      createElement({
        tag: "div",
        text: "Moves Left:",
        classArr: ["game-screen__hints-text"]
      }),
      createElement({
        tag: "div",
        text: "5+",
        id: "hints-counter",
        classArr: ["game-screen__hints-counter"]
      })
    ]
  });
  const assistsPanelEl = createElement({
    tag: "div",
    classArr: ["game-screen__assists"],
    parent: screen
  });
  createElement({
    tag: "button",
    classArr: ["game-screen__assists-btn", "button"],
    parent: assistsPanelEl,
    data: { assist: "revert" },
    children: [
      createElement({
        tag: "div",
        text: "Revert",
        classArr: ["game-screen__assists-btn-text"]
      }),
      createElement({
        tag: "div",
        text: "1/1",
        id: "revert-counter",
        classArr: ["game-screen__assists-btn-counter"]
      })
    ]
  });
  createElement({
    tag: "button",
    classArr: ["game-screen__assists-btn", "button"],
    parent: assistsPanelEl,
    data: { assist: "add-numbers" },
    children: [
      createElement({
        tag: "div",
        text: "Add",
        classArr: ["game-screen__assists-btn-text"]
      }),
      createElement({
        tag: "div",
        text: "10/10",
        id: "add-numbers-counter",
        classArr: ["game-screen__assists-btn-counter"]
      }),
      createElement({
        tag: "div",
        text: `3/${MAX_LINES}`,
        id: "add-numbers-max-lines",
        classArr: ["game-screen__assists-btn-counter"]
      })
    ]
  });
  createElement({
    tag: "button",
    classArr: ["game-screen__assists-btn", "button"],
    parent: assistsPanelEl,
    data: { assist: "shuffle" },
    children: [
      createElement({
        tag: "div",
        text: "Shuffle",
        classArr: ["game-screen__assists-btn-text"]
      }),
      createElement({
        tag: "div",
        text: "5/5",
        id: "shuffle-counter",
        classArr: ["game-screen__assists-btn-counter"]
      })
    ]
  });
  createElement({
    tag: "button",
    classArr: ["game-screen__assists-btn", "button"],
    parent: assistsPanelEl,
    data: { assist: "eraser" },
    children: [
      createElement({
        tag: "div",
        text: "Eraser",
        classArr: ["game-screen__assists-btn-text"]
      }),
      createElement({
        tag: "div",
        text: "5/5",
        id: "eraser-counter",
        classArr: ["game-screen__assists-btn-counter"]
      })
    ]
  });
  const controller = {
    onReset: null,
    onSave: null,
    onSettings: null,
    onMainMenu: null,
    onAssistUse: null,
    onCellSelect: null
  };
  function setupEventListeners() {
    screen.addEventListener("click", (e) => {
      const target = e.target;
      if (target.id === "reset-game" || target.closest("#reset-game")) {
        if (controller.onReset) controller.onReset();
        return;
      }
      if (target.id === "save-game" || target.closest("#save-game")) {
        if (controller.onSave) controller.onSave();
        return;
      }
      if (target.id === "settings" || target.closest("#settings")) {
        if (controller.onSettings) controller.onSettings();
        return;
      }
      if (target.id === "main-menu" || target.closest("#main-menu")) {
        if (controller.onMainMenu) controller.onMainMenu();
        return;
      }
      const assistBtn = target.closest(".game-screen__assists-btn");
      if (assistBtn) {
        const assistId = assistBtn.dataset.assist;
        if (controller.onAssistUse) controller.onAssistUse(assistId);
        return;
      }
      const gridCell = target.closest(".game-grid__cell");
      if (gridCell) {
        const cellData = {
          element: gridCell,
          number: parseInt(gridCell.dataset.number),
          row: parseInt(gridCell.dataset.row),
          col: parseInt(gridCell.dataset.col)
        };
        if (controller.onCellSelect) controller.onCellSelect(cellData);
      }
    });
  }
  const classicGrid = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 1, 1, 2, 1, 3, 1, 4, 1],
    [5, 1, 6, 1, 7, 1, 8, 1, 9]
  ];
  function generateGameGrid(gridMatrix) {
    gridMatrix.forEach((row, rowIdx) => {
      const rowEl = createElement({
        tag: "div",
        classArr: ["game-grid__row"],
        parent: gameGridEl
      });
      row.forEach((number, colIdx) => {
        if (number === null) {
          createElement({
            tag: "button",
            classArr: ["game-grid__cell", "game-grid__cell--empty"],
            text: "",
            data: { number, row: rowIdx, col: colIdx },
            parent: rowEl
          });
        } else if (number === 0) {
          createElement({
            tag: "button",
            classArr: ["game-grid__cell", "game-grid__cell--blank"],
            text: "",
            data: { number, row: rowIdx, col: colIdx },
            parent: rowEl
          });
        } else {
          createElement({
            tag: "button",
            classArr: ["game-grid__cell"],
            text: number.toString(),
            data: { number, row: rowIdx, col: colIdx },
            parent: rowEl
          });
        }
      });
    });
  }
  function initializeGrid() {
    const gameGridEl2 = screen.querySelector("#game-grid");
    gameGridEl2.textContent = "";
    if (savedState) {
      generateGameGrid(savedState.savedState.grid);
      return;
    }
    if (mode === "classic") {
      gameState.grid = classicGrid;
      generateGameGrid(gameState.grid);
    }
    if (mode === "random") {
      gameState.grid = completeShuffle(classicGrid);
      generateGameGrid(gameState.grid);
    }
    if (mode === "chaotic") {
      gameState.grid = createChaoticGrid(27);
      generateGameGrid(gameState.grid);
    }
  }
  setupEventListeners();
  function onShow() {
    initializeGrid();
  }
  function onDestroy() {
  }
  return {
    element: screen,
    controller,
    onShow,
    onDestroy
  };
}
function createGameOutcomeModal() {
  const modal = createElement({
    tag: "div",
    classArr: ["modal", "game-outcome-modal"]
  });
  const overlay = createElement({
    tag: "div",
    classArr: ["modal__overlay"],
    parent: modal
  });
  const content = createElement({
    tag: "div",
    classArr: ["modal__content", "game-outcome-modal__content"],
    parent: modal
  });
  const header = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__header"],
    parent: content
  });
  const title = createElement({
    tag: "h2",
    classArr: ["game-outcome-modal__title"],
    text: "Game",
    parent: header
  });
  const subTitle = createElement({
    tag: "h2",
    classArr: ["game-outcome-modal__subtitle"],
    parent: header
  });
  const statsContainer = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__stats"],
    parent: content
  });
  const modeRow = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__stat-row"],
    parent: statsContainer
  });
  createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-label"],
    text: "Mode:",
    parent: modeRow
  });
  const modeValue = createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-value"],
    text: "Classic Mode",
    parent: modeRow
  });
  const scoreRow = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__stat-row"],
    parent: statsContainer
  });
  createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-label"],
    text: "Score:",
    parent: scoreRow
  });
  const scoreValue = createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-value"],
    text: "0",
    parent: scoreRow
  });
  const timeRow = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__stat-row"],
    parent: statsContainer
  });
  createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-label"],
    text: "Time:",
    parent: timeRow
  });
  const timeValue = createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-value"],
    text: "00:00",
    parent: timeRow
  });
  const movesRow = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__stat-row"],
    parent: statsContainer
  });
  createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-label"],
    text: "Moves:",
    parent: movesRow
  });
  const movesValue = createElement({
    tag: "span",
    classArr: ["game-outcome-modal__stat-value"],
    text: "Moves",
    parent: movesRow
  });
  const buttonsContainer = createElement({
    tag: "div",
    classArr: ["game-outcome-modal__buttons"],
    parent: content
  });
  const playAgainBtn = createElement({
    tag: "button",
    classArr: ["button", "button--primary", "game-outcome-modal__btn"],
    text: "Play Again",
    parent: buttonsContainer
  });
  const mainMenuBtn = createElement({
    tag: "button",
    classArr: ["button", "button--secondary", "game-outcome-modal__btn"],
    text: "Main Menu",
    parent: buttonsContainer
  });
  const viewResultsBtn = createElement({
    tag: "button",
    classArr: ["button", "button--secondary", "game-outcome-modal__btn"],
    text: "View Results",
    parent: buttonsContainer
  });
  const controller = {
    onPlayAgain: null,
    onMainMenu: null,
    onViewResults: null,
    show: null,
    hide: null,
    setOutcome: null
  };
  function setupEventListeners() {
    playAgainBtn.addEventListener("click", () => {
      if (controller.onPlayAgain) controller.onPlayAgain();
      hide();
    });
    mainMenuBtn.addEventListener("click", () => {
      if (controller.onMainMenu) controller.onMainMenu();
      hide();
    });
    viewResultsBtn.addEventListener("click", () => {
      if (controller.onViewResults) controller.onViewResults();
    });
    overlay.addEventListener("click", () => {
      if (controller.onPlayAgain) controller.onPlayAgain();
      hide();
    });
  }
  setupEventListeners();
  function show(outcomeData = {}) {
    openModal(modal);
    if (outcomeData) {
      setOutcome(outcomeData);
    }
  }
  function hide() {
    closeCurrentModal();
  }
  function setOutcome(outcomeData) {
    const {
      outcome,
      score = 0,
      time = "00:00",
      mode = "Classic Mode",
      moves = 0
    } = outcomeData;
    title.textContent = outcome === "Win" ? "You Win!" : "You Loss";
    subTitle.textContent = outcome === "Win" ? "Congratulations" : "Exceeding the 50 line limit!";
    modeValue.textContent = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`;
    scoreValue.textContent = score;
    timeValue.textContent = time;
    movesValue.textContent = moves;
    if (outcome === "Win") {
      title.classList.add("game-outcome-modal__title--win");
      content.classList.add("game-outcome-modal__content--win");
      title.classList.remove("game-outcome-modal__title--loss");
      content.classList.remove("game-outcome-modal__content--loss");
    } else {
      title.classList.remove("game-outcome-modal__title--win");
      content.classList.remove("game-outcome-modal__content--win");
      title.classList.add("game-outcome-modal__title--loss");
      content.classList.add("game-outcome-modal__content--loss");
    }
  }
  controller.show = show;
  controller.hide = hide;
  controller.setOutcome = setOutcome;
  return {
    element: modal,
    controller
  };
}
function createUI() {
  const screenConstructors = {
    start: createStartScreen,
    game: createGameScreen
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
    getGameOutcomeModal
  };
}
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
function createGame(screenManager) {
  const ui = createUI();
  const storage = createStorage();
  let currentSettings = storage.loadSettings();
  const cellClassTimeout = 300;
  const toastMessageTimeout = 1e3;
  let gameTimer = null;
  function init() {
    const screenNames = ui.getAllScreenNames();
    screenNames.forEach((name) => {
      const ctor = ui.getScreenConstructor(name);
      if (ctor) screenManager.registerScreen(name, ctor);
    });
    if (storage.loadSavedGame()) {
      gameState.savedGame = storage.loadSavedGame();
    }
    applyTheme(currentSettings.theme || "light");
    setupModals();
    showStartScreen();
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }
  function setupModals() {
    const settingsModal = ui.getSettingsModal();
    if (settingsModal.controller) {
      settingsModal.controller.onThemeChange = (theme, playSoundFlag = true) => {
        currentSettings.theme = theme;
        applyTheme(theme);
        storage.saveSettings(currentSettings);
        if (playSoundFlag) {
          playSound("select");
        }
      };
      settingsModal.controller.onAudioToggle = (enabled, playSoundFlag = true) => {
        currentSettings.isAudioEnabled = enabled;
        storage.saveSettings(currentSettings);
        if (playSoundFlag) {
          playSound("select");
        }
      };
      settingsModal.controller.onReset = () => {
        currentSettings = { theme: "light", isAudioEnabled: true };
        storage.saveSettings(currentSettings);
        applyTheme("light");
        playSound("select");
      };
    }
  }
  function showStartScreen() {
    screenManager.showScreen("start");
    const controller = screenManager.getCurrentController();
    if (!controller) return;
    controller.onModeSelect = (mode) => {
      gameState.mode = mode;
      resetGameState();
      showGameScreen(mode);
      playSound("select");
    };
    controller.onContinue = () => {
      const savedGame = storage.loadSavedGame().gameState;
      loadGameState(savedGame);
      if (!savedGame) {
        controller.disableContinue();
        return;
      }
      showGameScreen("game", {
        mode: savedGame.mode,
        savedState: savedGame
      });
      playSound("select");
    };
    controller.onSettings = () => {
      ui.getSettingsModal().controller.show();
    };
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
  function showGameScreen(mode, savedState = null) {
    screenManager.showScreen("game", { mode, savedState });
    const controller = screenManager.getCurrentController();
    if (!controller) return;
    if (savedState) {
      loadGameState();
    }
    startGameTimer();
    updateAssistCounters();
    updateTimerUI();
    updateScoreUI();
    updateMovesLeftUI();
    updateRevertButtonState();
    Object.keys(gameState.assists).forEach((assistId) => {
      updateAssistUI(assistId);
    });
    controller.onCellSelect = (cellData) => {
      handleCellClick(cellData);
    };
    controller.onReset = () => {
      resetGameState();
      showGameScreen(gameState.mode);
      saveCurrentGame();
      playSound("select");
    };
    controller.onSave = () => {
      saveCurrentGame();
      playSound("select");
    };
    controller.onSettings = () => {
      ui.getSettingsModal().controller.show();
    };
    controller.onMainMenu = () => {
      stopGameTimer();
      showStartScreen();
      saveCurrentGame();
      playSound("select");
    };
    controller.onAssistUse = (assistId) => {
      handleAssistUse(assistId);
      saveCurrentGame();
      playSound("assist");
    };
  }
  function saveCurrentGame() {
    const gameData = {
      gameState: getSaveData(),
      timestamp: Date.now()
    };
    const data = storage.loadData();
    data.savedGame = gameData;
    storage.saveData(data);
  }
  function updateMovesLeftUI() {
    const hintsCounter = document.querySelector("#hints-counter");
    const availableMoves = findAvailablePairs().length;
    const movesText = availableMoves > 5 ? "5+" : availableMoves.toString();
    hintsCounter.textContent = movesText;
    gameState.hint = availableMoves;
  }
  function handleCellClick(cellData) {
    const { element, number, row, col } = cellData;
    toggleCellSelection(element, number, row, col);
    if (gameState.selectedCells.length < 2) {
      playSound("select");
    }
    if (gameState.selectedCells.length === 2) {
      checkSelectedPair();
    }
  }
  function toggleCellSelection(cell, number, row, col) {
    const existingIndex = gameState.selectedCells.findIndex(
      (selected) => selected.row === row && selected.col === col
    );
    if (existingIndex > -1) {
      gameState.selectedCells.splice(existingIndex, 1);
      cell.classList.remove("game-grid__cell--selected");
    } else {
      gameState.selectedCells.push({
        element: cell,
        number,
        row,
        col
      });
      cell.classList.add("game-grid__cell--selected");
    }
    updateEraserButtonState();
  }
  function checkSelectedPair() {
    const [cell1, cell2] = gameState.selectedCells;
    if (isValidPair(cell1, cell2)) {
      gameState.moveHistory.push(gameState.selectedCells);
      removeCellsFromGrid([cell1, cell2]);
      applyValidationClasses([cell1, cell2], "valid");
      setTimeout(() => {
        clearSelection();
      }, cellClassTimeout);
      updateScoreGameState(cell1, cell2);
      saveCurrentGame();
      playSound("valid");
      checkWinCondition();
      updateScoreUI();
      updateMovesLeftUI();
    } else {
      playSound("invalid");
      applyValidationClasses([cell1, cell2], "invalid");
      setTimeout(() => {
        clearSelection();
      }, cellClassTimeout);
    }
  }
  function updateScoreGameState(cell1, cell2) {
    const points = calculateScore(cell1.number, cell2.number);
    gameState.score += points;
  }
  function updateScoreUI() {
    const scoreDisplay = document.querySelector("#score-dispay");
    if (scoreDisplay) {
      scoreDisplay.textContent = `${gameState.score} / ${TARGET_SCORE}`;
    }
    const progressFill = document.querySelector("#progress-fill");
    if (progressFill) {
      const progress = gameState.score / TARGET_SCORE * 100;
      progressFill.style.width = `${Math.min(progress, 100)}%`;
    }
  }
  function applyValidationClasses(cells, action) {
    cells.forEach((cell) => {
      if (cell.element) {
        if (action === "valid") {
          cell.element.classList.add("game-grid__cell--valid");
        }
        if (action === "invalid") {
          cell.element.classList.add("game-grid__cell--invalid");
        }
      }
    });
  }
  function removeCellsFromGrid(cells) {
    const move = {
      removedCells: cells,
      previousScore: gameState.score,
      previousGrid: JSON.parse(JSON.stringify(gameState.grid)),
      timestamp: Date.now()
    };
    gameState.moveHistory.push(move);
    gameState.assists.revert.used = 0;
    updateRevertButtonState();
    cells.forEach((cell) => {
      if (cell.element) {
        cell.element.textContent = "";
        cell.element.classList.add("game-grid__cell--empty");
        cell.element.disabled = true;
        gameState.grid[cell.row][cell.col] = null;
      }
    });
  }
  function clearSelection() {
    gameState.selectedCells = [];
    const selectedCells = document.querySelectorAll(
      ".game-grid__cell--selected"
    );
    selectedCells.forEach((cell) => {
      cell.classList.remove("game-grid__cell--selected");
      cell.classList.remove("game-grid__cell--valid");
      cell.classList.remove("game-grid__cell--invalid");
    });
    updateEraserButtonState();
    updateRevertButtonState();
  }
  function isValidPair(cell1, cell2) {
    if (!isValidNumberPair(cell1.number, cell2.number)) {
      return false;
    }
    return areCellsConnected(cell1, cell2);
  }
  function isValidNumberPair(num1, num2) {
    return num1 === num2 || num1 + num2 === 10;
  }
  function areCellsConnected(cell1, cell2) {
    const { row: row1, col: col1 } = cell1;
    const { row: row2, col: col2 } = cell2;
    if (areAdjacentCells(row1, col1, row2, col2)) {
      return true;
    }
    if (row1 === row2) {
      return isHorizontalPathClear(row1, col1, col2);
    }
    if (col1 === col2) {
      return isVerticalPathClear(col1, row1, row2);
    }
    if (areRowBoundaryCells(row1, col1, row2) || areRowBoundaryCells(row2, col2, row1)) {
      return isRowBoundaryPathClear(row1, col1, row2, col2) || isRowBoundaryPathClear(row2, col2, row1, col1);
    }
    return false;
  }
  function areAdjacentCells(row1, col1, row2, col2) {
    const verticalAdjacent = Math.abs(row1 - row2) === 1 && col1 === col2;
    const horizontalAdjacent = row1 === row2 && Math.abs(col1 - col2) === 1;
    return verticalAdjacent || horizontalAdjacent;
  }
  function isHorizontalPathClear(row, col1, col2) {
    const startCol = Math.min(col1, col2);
    const endCol = Math.max(col1, col2);
    for (let col = startCol + 1; col < endCol; col++) {
      if (!isCellEmpty(row, col)) {
        return false;
      }
    }
    return true;
  }
  function isVerticalPathClear(col, row1, row2) {
    const startRow = Math.min(row1, row2);
    const endRow = Math.max(row1, row2);
    for (let row = startRow + 1; row < endRow; row++) {
      if (!isCellEmpty(row, col)) {
        return false;
      }
    }
    return true;
  }
  function areRowBoundaryCells(row1, col1, row2) {
    const lastColRow1 = getLastNonEmptyCol(row1);
    const firstColRow1 = 0;
    return col1 === lastColRow1 && row2 === row1 + 1 || col1 === firstColRow1 && row2 === row1 - 1;
  }
  function isRowBoundaryPathClear(row1, col1, row2, col2) {
    const lastColRow1 = getLastNonEmptyCol(row1);
    const lastColRow2 = getLastNonEmptyCol(row2);
    if (col1 === lastColRow1 && row2 === row1 + 1) {
      for (let col = 0; col < col2; col++) {
        if (!isCellEmpty(row2, col)) return false;
      }
      return true;
    }
    if (col1 === 0 && row2 === row1 - 1) {
      for (let col = lastColRow2; col > col2; col--) {
        if (!isCellEmpty(row2, col)) return false;
      }
      return true;
    }
    return false;
  }
  function getLastNonEmptyCol(row) {
    for (let col = gameState.grid[row].length - 1; col >= 0; col--) {
      if (gameState.grid[row][col] !== null) {
        return col;
      }
    }
    return -1;
  }
  function isCellEmpty(row, col) {
    if (gameState.grid[row] && gameState.grid[row][col] === null) {
      return true;
    }
    const cellElement = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (cellElement && cellElement.classList.contains("game-grid__cell--empty")) {
      return true;
    }
    return false;
  }
  function calculateScore(num1, num2) {
    if (num1 === 5 && num2 === 5) return 3;
    if (num1 === num2) return 1;
    if (num1 + num2 === 10) return 2;
    return 0;
  }
  function handleAssistUse(assistId) {
    switch (assistId) {
      case "revert":
        useRevert();
        break;
      case "add-numbers":
        useAddNumbers();
        break;
      case "shuffle":
        useShuffle();
        break;
      case "eraser":
        useEraser();
        break;
    }
    updateAssistUI(assistId);
    updateMovesLeftUI();
  }
  function findAvailablePairs() {
    const availablePairs = [];
    const allCells = getAllNonEmptyCells();
    for (let i = 0; i < allCells.length; i++) {
      for (let j = i + 1; j < allCells.length; j++) {
        const cell1 = allCells[i];
        const cell2 = allCells[j];
        if (isValidNumberPair(cell1.number, cell2.number) && areCellsConnected(cell1, cell2)) {
          availablePairs.push([cell1, cell2]);
          if (availablePairs.length > 5) return availablePairs;
        }
      }
    }
    return availablePairs;
  }
  function getAllNonEmptyCells() {
    const allCells = [];
    const cellElements = document.querySelectorAll(
      ".game-grid__cell:not(.game-grid__cell--empty)"
    );
    cellElements.forEach((cell) => {
      allCells.push({
        element: cell,
        number: parseInt(cell.dataset.number),
        row: parseInt(cell.dataset.row),
        col: parseInt(cell.dataset.col)
      });
    });
    return allCells;
  }
  function useRevert() {
    if (gameState.assists.revert.used >= gameState.assists.revert.max) {
      showMessage("Revert already used!");
      return;
    }
    if (gameState.moveHistory.length === 0) {
      showMessage("No moves to revert!");
      return;
    }
    const lastMove = gameState.moveHistory.pop();
    revertMove(lastMove);
    gameState.assists.revert.used = 1;
    updateAssistCounters();
    gameState.score = lastMove.previousScore;
    updateRevertButtonState();
    showMessage("Last move reverted");
  }
  function updateRevertButtonState() {
    const revertButton = document.querySelector('[data-assist="revert"]');
    const revertCounter = document.querySelector("#revert-counter");
    if (!revertButton || !revertCounter) return;
    const hasMovesToRevert = gameState.moveHistory.length > 0;
    const hasNotUsedRevert = gameState.assists.revert.used < gameState.assists.revert.max;
    revertButton.disabled = !hasMovesToRevert || !hasNotUsedRevert;
    if (revertButton.disabled) {
      revertButton.classList.add("button--disabled");
    } else {
      revertButton.classList.remove("button--disabled");
    }
    const remaining = gameState.assists.revert.max - gameState.assists.revert.used;
    revertCounter.textContent = `${remaining}/${gameState.assists.revert.max}`;
  }
  function revertMove(move) {
    move.removedCells.forEach((cell) => {
      if (cell.element) {
        cell.element.textContent = cell.number;
        cell.element.classList.remove("game-grid__cell--empty");
        cell.element.disabled = false;
        gameState.grid[cell.row][cell.col] = cell.number;
      }
    });
    gameState.score = move.previousScore;
    updateScoreUI();
    clearSelection();
  }
  function useAddNumbers() {
    if (!useAssist("addNumbers")) {
      showMessage("No more number additions available!");
      return;
    }
    addNewLineToGrid();
    updateAssistCounters();
    checkLoseCondition();
    showMessage("New numbers added to grid");
  }
  function addNewLineToGrid() {
    let gameGridFlat = gameState.grid.flat();
    let matrix = createGridMatrixFromArr(gameGridFlat.filter(Boolean));
    const gameGridEl = document.querySelector("#game-grid");
    if (gameGridEl) {
      renderNewMatrix(matrix, gameState.grid.length - 1, gameGridEl);
    }
    const isMatrixFull = matrix.every((row) => row.length === GRID_COLS);
    const isGameStateGridFull = gameState.grid.every(
      (row) => row.length === GRID_COLS
    );
    if (isMatrixFull || isGameStateGridFull) {
      matrix.forEach((arr) => {
        gameState.grid.push(arr);
      });
    } else {
      const lastGridArr = gameState.grid[gameState.grid.length - 1];
      const cellLeftToFullRow = GRID_COLS - lastGridArr.length;
      const leftToFillLastRowArr = matrix.flat().slice(0, cellLeftToFullRow);
      const newMatrix = createGridMatrixFromArr(
        matrix.flat().slice(cellLeftToFullRow)
      );
      leftToFillLastRowArr.forEach((number) => {
        gameState.grid[gameState.grid.length - 1].push(number);
      });
      newMatrix.forEach((arr) => {
        gameState.grid.push(arr);
      });
    }
  }
  function createGridMatrixFromArr(arr) {
    const matrix = [];
    for (let i = 0; i < arr.length; i += 9) {
      matrix.push(arr.slice(i, i + 9));
    }
    return matrix;
  }
  function renderNewMatrix(matrix, rowIndex, gridElement) {
    const isGameStateGridFull = gameState.grid.every(
      (row) => row.length === GRID_COLS
    );
    if (isGameStateGridFull) {
      renderFromNewLine(matrix, rowIndex, gridElement);
    } else {
      const lastdRowEl = gridElement.querySelector(
        ".game-grid__row:last-child"
      );
      const lastdRowCellsAmount = lastdRowEl.querySelectorAll(".game-grid__cell").length;
      const emptyCellsAmount = GRID_COLS - lastdRowCellsAmount;
      const fillEmptyArr = matrix.flat().slice(0, emptyCellsAmount);
      const newMatrix = createGridMatrixFromArr(
        matrix.flat().slice(emptyCellsAmount)
      );
      fillEmptyArr.forEach((number, idx) => {
        const colIndex = lastdRowCellsAmount + idx + 1;
        const cell = createElement({
          tag: "button",
          text: number,
          data: { number, row: rowIndex, col: colIndex },
          classArr: ["game-grid__cell"]
        });
        lastdRowEl.appendChild(cell);
      });
      renderFromNewLine(newMatrix, rowIndex, gridElement);
    }
  }
  function renderFromNewLine(matrix, rowIndex, gridElement) {
    matrix.forEach((row, idx) => {
      const rowEl = createElement({
        tag: "div",
        classArr: ["game-grid__row"]
      });
      const newRowIdx = idx + rowIndex + 1;
      row.forEach((number, colIndex) => {
        const cell = createElement({
          tag: "button",
          text: number,
          data: { number, row: newRowIdx, col: colIndex },
          classArr: ["game-grid__cell"]
        });
        rowEl.appendChild(cell);
      });
      gridElement.appendChild(rowEl);
    });
  }
  function useShuffle() {
    if (!useAssist("shuffle")) {
      showMessage("No more shuffles available!");
      return;
    }
    shuffleGrid();
    updateAssistCounters();
    showMessage("Grid shuffled");
  }
  function shuffleGrid() {
    const allNumbers = [];
    for (let row = 0; row < gameState.grid.length; row++) {
      for (let col = 0; col < gameState.grid[row].length; col++) {
        if (!isCellEmpty(row, col)) {
          allNumbers.push(gameState.grid[row][col]);
        }
      }
    }
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    let index = 0;
    for (let row = 0; row < gameState.grid.length; row++) {
      for (let col = 0; col < gameState.grid[row].length; col++) {
        if (!isCellEmpty(row, col)) {
          gameState.grid[row][col] = allNumbers[index++];
        }
      }
    }
    updateGridUI();
  }
  function updateGridUI() {
    const gameGridEl = document.querySelector("#game-grid");
    if (!gameGridEl) return;
    gameGridEl.textContent = "";
    gameState.grid.forEach((row, rowIndex) => {
      const rowEl = createElement({ tag: "div", classArr: ["game-grid__row"] });
      row.forEach((number, colIndex) => {
        if (number === null) {
          const emptyCell = createElement({
            tag: "div",
            text: "",
            classArr: ["game-grid__cell", "game-grid__cell--empty"]
          });
          rowEl.appendChild(emptyCell);
        } else {
          const cell = createElement({
            tag: "button",
            text: number,
            data: { number, row: rowIndex, col: colIndex },
            classArr: ["game-grid__cell"]
          });
          rowEl.appendChild(cell);
        }
      });
      gameGridEl.appendChild(rowEl);
    });
  }
  function useEraser() {
    if (!useAssist("eraser")) {
      showMessage("No more eraser uses available!");
      return;
    }
    if (gameState.selectedCells.length !== 1) {
      showMessage("Please select exactly one number to erase");
      return;
    }
    const cellToErase = gameState.selectedCells[0];
    eraseCell(cellToErase);
    updateAssistCounters();
    showMessage("Number removed");
  }
  function eraseCell(cell) {
    const { element, row, col } = cell;
    element.textContent = "";
    element.classList.add("game-grid__cell--empty");
    element.disabled = true;
    gameState.grid[row][col] = null;
    clearSelection();
    updateEraserButtonState();
  }
  function updateEraserButtonState() {
    const eraserButton = document.querySelector('[data-assist="eraser"]');
    if (eraserButton) {
      const hasSingleSelection = gameState.selectedCells.length === 1;
      const hasUsesLeft = getAssistUses("eraser") > 0;
      eraserButton.disabled = !hasSingleSelection || !hasUsesLeft;
      if (eraserButton.disabled) {
        eraserButton.classList.add("button--disabled");
      } else {
        eraserButton.classList.remove("button--disabled");
      }
    }
  }
  function useAssist(assistName) {
    const assist = gameState.assists[assistName];
    if (assist && assist.used < assist.max) {
      assist.used++;
      return true;
    }
    return false;
  }
  function updateAssistCounters() {
    Object.keys(gameState.assists).forEach((assistId) => {
      const counterElement = document.querySelector(`#${assistId}-counter`);
      const assistButton = document.querySelector(
        `[data-assist="${assistId}"]`
      );
      if (counterElement && assistButton) {
        const assist = gameState.assists[assistId];
        const remaining = assist.max - assist.used;
        if (assistId === "eraser") {
          const hasSingleSelection = gameState.selectedCells.length === 1;
          assistButton.disabled = !hasSingleSelection || remaining <= 0;
        } else if (assistId === "revert") {
          const hasMovesToRevert = gameState.moveHistory.length > 0;
          const hasNotUsedRevert = remaining > 0;
          assistButton.disabled = !hasMovesToRevert || !hasNotUsedRevert;
        } else {
          assistButton.disabled = remaining <= 0;
        }
        if (assistButton.disabled) {
          assistButton.classList.add("button--disabled");
        } else {
          assistButton.classList.remove("button--disabled");
        }
      }
    });
  }
  function updateAssistUI(assistId) {
    if (assistId === "revert" || assistId === "hints") return;
    let assistInfo;
    let elementId;
    const addNumbersMaxLineEl = document.getElementById(
      "add-numbers-max-lines"
    );
    if (assistId === "add-numbers") {
      assistInfo = gameState.assists["addNumbers"];
      elementId = assistId;
      addNumbersMaxLineEl.textContent = `${gameState.grid.length}/${MAX_LINES}`;
    } else {
      assistInfo = gameState.assists[assistId];
      elementId = assistId;
    }
    if (assistId === "addNumbers") {
      elementId = "add-numbers";
      addNumbersMaxLineEl.textContent = `${gameState.grid.length}/${MAX_LINES}`;
    }
    const max = assistInfo.max;
    const left = max - assistInfo.used;
    const counterElement = document.querySelector(`#${elementId}-counter`);
    counterElement.textContent = `${left}/${max}`;
  }
  function getAssistUses(assistName) {
    const assist = gameState.assists[assistName];
    if (!assist) return 0;
    return Math.max(0, assist.max - assist.used);
  }
  function showMessage(message) {
    const el = createElement({
      tag: "div",
      text: message,
      classArr: ["toast-message"]
    });
    const isToastedAdded = !!document.querySelector(".toast-message");
    if (!isToastedAdded) {
      document.body.append(el);
      setTimeout(() => {
        if (document.querySelector(".toast-message")) {
          document.querySelector(".toast-message").remove();
        }
      }, toastMessageTimeout);
    } else {
      document.querySelector(".toast-message").remove();
      document.body.append(el);
      setTimeout(() => {
        if (document.querySelector(".toast-message")) {
          document.querySelector(".toast-message").remove();
        }
      }, toastMessageTimeout);
    }
  }
  function startGameTimer() {
    stopGameTimer();
    if (!gameState.isGameActive) return;
    gameTimer = setInterval(() => {
      if (gameState.isGameActive) {
        gameState.elapsedTime++;
        updateTimerUI();
      } else {
        stopGameTimer();
      }
    }, 1e3);
  }
  function updateTimerUI() {
    const timerDisplay = document.querySelector("#timer-display");
    if (timerDisplay) {
      timerDisplay.textContent = `${formatTime(gameState.elapsedTime)}`;
    }
  }
  function stopGameTimer() {
    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }
  }
  function checkWinCondition() {
    if (gameState.score >= TARGET_SCORE) {
      gameState.isGameActive = false;
      stopGameTimer();
      showGameOutcomeModal("Win");
      playSound("win");
      const resultsObj = {
        mode: gameState.mode,
        score: gameState.score,
        time: formatTime(gameState.elapsedTime),
        moves: gameState.moveHistory.length,
        result: "Win"
      };
      saveGameResults(resultsObj);
    }
  }
  function checkLoseCondition() {
    if (gameState.grid.length >= MAX_LINES) {
      gameState.isGameActive = false;
      stopGameTimer();
      showGameOutcomeModal("Lose");
      playSound("lose");
      const resultsObj = {
        mode: gameState.mode,
        score: gameState.score,
        time: formatTime(gameState.elapsedTime),
        moves: gameState.moveHistory.length,
        result: "Lose"
      };
      saveGameResults(resultsObj);
    }
  }
  function saveGameResults(results) {
    const storagedArr = storage.loadResults();
    let pastResultsArr = [];
    if (storagedArr.length) {
      pastResultsArr.push(...storagedArr);
    }
    if (pastResultsArr.length >= 5) {
      pastResultsArr = pastResultsArr.slice(-4);
    }
    pastResultsArr.push(results);
    storage.saveResults(pastResultsArr);
  }
  function showGameOutcomeModal(outcome) {
    const outcomeModal = ui.getGameOutcomeModal();
    outcomeModal.controller.setOutcome({
      outcome,
      score: gameState.score,
      time: formatTime(gameState.elapsedTime),
      mode: gameState.mode,
      moves: gameState.moveHistory.length
    });
    outcomeModal.controller.onPlayAgain = () => {
      resetGameState();
      showGameScreen(gameState.mode);
    };
    outcomeModal.controller.onMainMenu = () => {
      resetGameState();
      storage.clearCurrentGame();
      showStartScreen();
    };
    outcomeModal.controller.onViewResults = () => {
      const results = storage.loadResults();
      const modal = ui.getResultsModal();
      if (modal.render) {
        const top5 = results.sort((a, b) => a.timeSec - b.timeSec).slice(0, 5);
        modal.render(top5);
      }
      modal.controller.show();
      modal.element.addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".modal__overlay") || target.closest(".modal__close-btn")) {
          resetGameState();
          showGameScreen(gameState.mode);
        }
      });
    };
    outcomeModal.controller.show({
      outcome,
      score: gameState.score,
      time: formatTime(gameState.elapsedTime),
      mode: gameState.mode,
      moves: gameState.moveHistory.length
    });
  }
  return { init };
}
document.addEventListener("DOMContentLoaded", () => {
  const appEl = createElement({ tag: "div", classArr: ["app"], id: "app" });
  document.body.append(appEl);
  const screenManager = createScreenManager(appEl);
  const game = createGame(screenManager);
  game.init();
});
//# sourceMappingURL=index.js.map
