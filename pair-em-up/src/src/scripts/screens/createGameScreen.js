import { createElement, qsElement, qsAll } from '../utils/dom.js';
import { gameState } from '../gameState.js';
import { TARGET_SCORE, STORAGE_KEY } from '../constants.js';
import { openModal } from '../utils/modal.js';

export function createGameScreen({ mode, savedState }) {
  const screen = createElement({
    tag: 'div',
    classArr: ['game-screen'],
  });

  const modeTitle = `${mode.charAt(0).toUpperCase()}${mode.slice(1)} Mode`;

  const gameHeader = createElement({
    tag: 'game-screen__header',
    classArr: ['game-screen__header'],
    parent: screen,
  });

  createElement({
    tag: 'h2',
    classArr: ['game-screen__header-mode'],
    text: modeTitle,
    parent: gameHeader,
  });

  const headerTimerEl = createElement({
    tag: 'div',
    classArr: ['game-screen__header-timer'],
    parent: gameHeader,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__header-timer-text'],
    text: 'Time',
    parent: headerTimerEl,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__header-timer-display'],
    id: 'timer-display',
    text: '00:00',
    parent: headerTimerEl,
  });

  const headerScoreEl = createElement({
    tag: 'div',
    classArr: ['game-screen__header-score'],
    parent: gameHeader,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__header-score-text'],
    text: 'Score',
    parent: headerScoreEl,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__header-score-display'],
    id: 'score-dispay',
    text: `0 / ${TARGET_SCORE}`,
    parent: headerScoreEl,
  });

  const progressBarEl = createElement({
    tag: 'div',
    classArr: ['game-screen__progress-bar'],
    parent: screen,
  });

  createElement({
    tag: 'p',
    classArr: ['game-screen__progress-bar-text'],
    text: 'Progress to Win (100 Points)',
    parent: progressBarEl,
  });

  const progressBarContainer = createElement({
    tag: 'div',
    classArr: ['game-screen__progress-bar-container'],
    parent: progressBarEl,
  });

  createElement({
    tag: 'div',
    classArr: ['game-screen__progress-bar-fill'],
    id: 'progress-fill',
    parent: progressBarContainer,
  });

  const gameGridEl = createElement({
    tag: 'div',
    classArr: ['game-screen__grid', 'game-grid'],
    id: 'game-grid',
    parent: screen,
  });

  const toolsPanelEl = createElement({
    tag: 'div',
    classArr: ['game-screen__tools'],
    parent: screen,
  });

  createElement({
    tag: 'button',
    text: 'Save Game',
    id: 'save-game',
    classArr: ['game-screen__tools-btn', 'button', 'button--secondary'],
    parent: toolsPanelEl,
  });

  createElement({
    tag: 'button',
    text: 'Reset Game',
    id: 'reset-game',
    classArr: ['game-screen__tools-btn', 'button', 'button--secondary'],
    parent: toolsPanelEl,
  });

  createElement({
    tag: 'button',
    text: 'Settings',
    id: 'settings',
    classArr: ['game-screen__tools-btn', 'button', 'button--secondary'],
    parent: toolsPanelEl,
  });

  createElement({
    tag: 'button',
    text: 'Main Menu',
    id: 'main-menu',
    classArr: ['game-screen__tools-btn', 'button', 'button--secondary'],
    parent: toolsPanelEl,
  });

  const assistsPanelEl = createElement({
    tag: 'div',
    classArr: ['game-screen__assists'],
    parent: screen,
  });

  createElement({
    tag: 'button',
    classArr: ['game-screen__assists-btn', 'button'],
    parent: assistsPanelEl,
    data: { assist: 'hints' },
    children: [
      createElement({
        tag: 'div',
        text: 'Hints',
        classArr: ['game-screen__assists-btn-text'],
      }),

      createElement({
        tag: 'div',
        text: '5+',
        id: 'hints-counter',
        classArr: ['game-screen__assists-btn-counter'],
      }),
    ],
  });

  createElement({
    tag: 'button',
    classArr: ['game-screen__assists-btn', 'button'],
    parent: assistsPanelEl,
    data: { assist: 'revert' },
    children: [
      createElement({
        tag: 'div',
        text: 'Revert',
        classArr: ['game-screen__assists-btn-text'],
      }),

      createElement({
        tag: 'div',
        text: '1/1',
        id: 'revert-counter',
        classArr: ['game-screen__assists-btn-counter'],
      }),
    ],
  });

  createElement({
    tag: 'button',
    classArr: ['game-screen__assists-btn', 'button'],
    parent: assistsPanelEl,
    data: { assist: 'add-numbers' },
    children: [
      createElement({
        tag: 'div',
        text: 'Add Numbers',
        classArr: ['game-screen__assists-btn-text'],
      }),

      createElement({
        tag: 'div',
        text: '10/10',
        id: 'add-numbers-counter',
        classArr: ['game-screen__assists-btn-counter'],
      }),
    ],
  });

  createElement({
    tag: 'button',
    classArr: ['game-screen__assists-btn', 'button'],
    parent: assistsPanelEl,
    data: { assist: 'shuffle' },
    children: [
      createElement({
        tag: 'div',
        text: 'Shuffle',
        classArr: ['game-screen__assists-btn-text'],
      }),

      createElement({
        tag: 'div',
        text: '5/5',
        id: 'shuffle-counter',
        classArr: ['game-screen__assists-btn-counter'],
      }),
    ],
  });

  createElement({
    tag: 'button',
    classArr: ['game-screen__assists-btn', 'button'],
    parent: assistsPanelEl,
    data: { assist: 'eraser' },
    children: [
      createElement({
        tag: 'div',
        text: 'Eraser',
        classArr: ['game-screen__assists-btn-text'],
      }),

      createElement({
        tag: 'div',
        text: '5/5',
        id: 'eraser-counter',
        classArr: ['game-screen__assists-btn-counter'],
      }),
    ],
  });

  const controller = {
    onReset: null,
    onSave: null,
    onSettings: null,
    onMainMenu: null,
    onAssistUse: null,
    onCellSelect: null,
  };

  function setupEventListeners() {
    screen.addEventListener('click', e => {
      const target = e.target;

      if (target.id === 'reset-game' || target.closest('#reset-game')) {
        controller.onReset?.();
        return;
      }

      if (target.id === 'save-game' || target.closest('#save-game')) {
        controller.onSave?.();
        return;
      }

      if (target.id === 'settings' || target.closest('#settings')) {
        controller.onSettings?.();
        return;
      }

      if (target.id === 'main-menu' || target.closest('#main-menu')) {
        controller.onMainMenu?.();
        return;
      }

      const assistBtn = target.closest('.game-screen__assists-btn');
      if (assistBtn) {
        const assistId = assistBtn.dataset.assist;
        controller.onAssistUse?.(assistId);
        return;
      }

      const gridCell = target.closest('.grid-game__cell');
      if (gridCell) {
        const number = parseInt(gridCell.dataset.number);
        const row = parseInt(gridCell.dataset.row);
        const col = parseInt(gridCell.dataset.col);

        controller.onCellSelect?.({
          cell: gridCell,
          number,
          row,
          col,
        });
        return;
      }
    });
  }

  function generateClassicGrid() {
    const classicGrid = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 1, 1, 2, 1, 3, 1, 4, 1],
      [5, 1, 6, 1, 7, 1, 8, 1, 9],
    ];

    classicGrid.forEach((row, rowIdx) => {
      const rowEl = createElement({
        tag: 'div',
        classArr: ['game-grid__row'],
        parent: gameGridEl,
      });

      row.forEach((number, colIdx) => {
        const cell = createElement({
          tag: 'button',
          classArr: ['game-grid__cell'],
          text: number.toString(),
          data: { number: number, row: rowIdx, col: colIdx },
          parent: rowEl,
        });
      });
    });
  }

  function initializeGrid() {
    const gameGridEl = screen.querySelector('#game-grid');
    gameGridEl.textContent = '';
    if (mode === 'classic') {
      generateClassicGrid();
    }
  }

  function onShow() {
    setupEventListeners();
    initializeGrid();
  }

  function onDestroy() {}

  return {
    element: screen,
    onShow,
    onDestroy,
  };
}
