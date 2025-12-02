import { createUI } from './ui.js';
import {
  gameState,
  getSaveData,
  loadGameState,
  resetGameState,
} from './gameState.js';
import { createStorage } from './storage.js';
import { GRID_COLS, MAX_LINES, TARGET_SCORE } from './constants.js';
import { createElement } from './utils/dom.js';
import { formatTime } from './utils/formatTime.js';
import { playSound } from './audio.js';

export function createGame(screenManager) {
  const ui = createUI();
  const storage = createStorage();
  let currentSettings = storage.loadSettings();
  const cellClassTimeout = 300;
  const toastMessageTimeout = 1000;
  let gameTimer = null;

  function init() {
    const screenNames = ui.getAllScreenNames();
    screenNames.forEach(name => {
      const ctor = ui.getScreenConstructor(name);
      if (ctor) screenManager.registerScreen(name, ctor);
    });

    if (storage.loadSavedGame()) {
      gameState.savedGame = storage.loadSavedGame();
    }

    applyTheme(currentSettings.theme || 'light');
    setupModals();
    showStartScreen();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function setupModals() {
    const settingsModal = ui.getSettingsModal();
    if (settingsModal.controller) {
      settingsModal.controller.onThemeChange = (
        theme,
        playSoundFlag = true
      ) => {
        currentSettings.theme = theme;
        applyTheme(theme);
        storage.saveSettings(currentSettings);

        if (playSoundFlag) {
          playSound('select');
        }
      };
      settingsModal.controller.onAudioToggle = (
        enabled,
        playSoundFlag = true
      ) => {
        currentSettings.isAudioEnabled = enabled;
        storage.saveSettings(currentSettings);

        if (playSoundFlag) {
          playSound('select');
        }
      };
      settingsModal.controller.onReset = () => {
        currentSettings = { theme: 'light', isAudioEnabled: true };
        storage.saveSettings(currentSettings);
        applyTheme('light');
        playSound('select');
      };
    }
  }

  function showStartScreen() {
    screenManager.showScreen('start');

    const controller = screenManager.getCurrentController();
    if (!controller) return;

    controller.onModeSelect = mode => {
      gameState.mode = mode;
      resetGameState();
      showGameScreen(mode);
      playSound('select');
    };

    controller.onContinue = () => {
      const savedGame = storage.loadSavedGame().gameState;
      loadGameState(savedGame);

      if (!savedGame) {
        controller.disableContinue();
        return;
      }

      showGameScreen('game', {
        mode: savedGame.mode,
        savedState: savedGame,
      });
      playSound('select');
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
    screenManager.showScreen('game', { mode, savedState });

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

    Object.keys(gameState.assists).forEach(assistId => {
      updateAssistUI(assistId);
    });

    controller.onCellSelect = cellData => {
      handleCellClick(cellData);
    };

    controller.onReset = () => {
      resetGameState();
      showGameScreen(gameState.mode);
      saveCurrentGame();
      playSound('select');
    };

    controller.onSave = () => {
      saveCurrentGame();
      playSound('select');
    };

    controller.onSettings = () => {
      ui.getSettingsModal().controller.show();
    };

    controller.onMainMenu = () => {
      stopGameTimer();
      showStartScreen();
      saveCurrentGame();
      playSound('select');
    };

    controller.onAssistUse = assistId => {
      handleAssistUse(assistId);
      saveCurrentGame();
      playSound('assist');
    };
  }

  function saveCurrentGame() {
    const gameData = {
      gameState: getSaveData(),
      timestamp: Date.now(),
    };

    const data = storage.loadData();
    data.savedGame = gameData;
    storage.saveData(data);
  }

  function updateMovesLeftUI() {
    const hintsCounter = document.querySelector('#hints-counter');
    const availableMoves = findAvailablePairs().length;
    const movesText = availableMoves > 5 ? '5+' : availableMoves.toString();
    hintsCounter.textContent = movesText;
    gameState.hint = availableMoves;
  }

  function handleCellClick(cellData) {
    const { element, number, row, col } = cellData;

    toggleCellSelection(element, number, row, col);

    if (gameState.selectedCells.length < 2) {
      playSound('select');
    }

    if (gameState.selectedCells.length === 2) {
      checkSelectedPair();
    }
  }

  function toggleCellSelection(cell, number, row, col) {
    const existingIndex = gameState.selectedCells.findIndex(
      selected => selected.row === row && selected.col === col
    );

    if (existingIndex > -1) {
      gameState.selectedCells.splice(existingIndex, 1);
      cell.classList.remove('game-grid__cell--selected');
    } else {
      gameState.selectedCells.push({
        element: cell,
        number: number,
        row: row,
        col: col,
      });
      cell.classList.add('game-grid__cell--selected');
    }

    updateEraserButtonState();
  }

  function checkSelectedPair() {
    const [cell1, cell2] = gameState.selectedCells;

    if (isValidPair(cell1, cell2)) {
      gameState.moveHistory.push(gameState.selectedCells);

      removeCellsFromGrid([cell1, cell2]);
      applyValidationClasses([cell1, cell2], 'valid');
      setTimeout(() => {
        clearSelection();
      }, cellClassTimeout);

      updateScoreGameState(cell1, cell2);
      saveCurrentGame();
      playSound('valid');
      checkWinCondition();
      updateScoreUI();
      updateMovesLeftUI();
    } else {
      playSound('invalid');
      applyValidationClasses([cell1, cell2], 'invalid');
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
    const scoreDisplay = document.querySelector('#score-dispay');
    if (scoreDisplay) {
      scoreDisplay.textContent = `${gameState.score} / ${TARGET_SCORE}`;
    }

    const progressFill = document.querySelector('#progress-fill');
    if (progressFill) {
      const progress = (gameState.score / TARGET_SCORE) * 100;
      progressFill.style.width = `${Math.min(progress, 100)}%`;
    }
  }

  function applyValidationClasses(cells, action) {
    cells.forEach(cell => {
      if (cell.element) {
        if (action === 'valid') {
          cell.element.classList.add('game-grid__cell--valid');
        }

        if (action === 'invalid') {
          cell.element.classList.add('game-grid__cell--invalid');
        }
      }
    });
  }

  function removeCellsFromGrid(cells) {
    const move = {
      removedCells: cells,
      previousScore: gameState.score,
      previousGrid: JSON.parse(JSON.stringify(gameState.grid)),
      timestamp: Date.now(),
    };

    gameState.moveHistory.push(move);

    gameState.assists.revert.used = 0;
    updateRevertButtonState();

    cells.forEach(cell => {
      if (cell.element) {
        cell.element.textContent = '';
        cell.element.classList.add('game-grid__cell--empty');
        cell.element.disabled = true;
        gameState.grid[cell.row][cell.col] = null;
      }
    });
  }

  function clearSelection() {
    gameState.selectedCells = [];
    const selectedCells = document.querySelectorAll(
      '.game-grid__cell--selected'
    );
    selectedCells.forEach(cell => {
      cell.classList.remove('game-grid__cell--selected');
      cell.classList.remove('game-grid__cell--valid');
      cell.classList.remove('game-grid__cell--invalid');
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

    if (
      areRowBoundaryCells(row1, col1, row2, col2) ||
      areRowBoundaryCells(row2, col2, row1, col1)
    ) {
      return (
        isRowBoundaryPathClear(row1, col1, row2, col2) ||
        isRowBoundaryPathClear(row2, col2, row1, col1)
      );
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

    return (
      (col1 === lastColRow1 && row2 === row1 + 1) ||
      (col1 === firstColRow1 && row2 === row1 - 1)
    );
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
    if (
      cellElement &&
      cellElement.classList.contains('game-grid__cell--empty')
    ) {
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
      case 'revert':
        useRevert();
        break;
      case 'add-numbers':
        useAddNumbers();
        break;
      case 'shuffle':
        useShuffle();
        break;
      case 'eraser':
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

        if (
          isValidNumberPair(cell1.number, cell2.number) &&
          areCellsConnected(cell1, cell2)
        ) {
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
      '.game-grid__cell:not(.game-grid__cell--empty)'
    );

    cellElements.forEach(cell => {
      allCells.push({
        element: cell,
        number: parseInt(cell.dataset.number),
        row: parseInt(cell.dataset.row),
        col: parseInt(cell.dataset.col),
      });
    });

    return allCells;
  }

  function useRevert() {
    if (gameState.assists.revert.used >= gameState.assists.revert.max) {
      showMessage('Revert already used!');
      return;
    }

    if (gameState.moveHistory.length === 0) {
      showMessage('No moves to revert!');
      return;
    }

    const lastMove = gameState.moveHistory.pop();
    revertMove(lastMove);

    gameState.assists.revert.used = 1;

    updateAssistCounters();
    gameState.score = lastMove.previousScore;
    updateRevertButtonState();
    showMessage('Last move reverted');
  }

  function updateRevertButtonState() {
    const revertButton = document.querySelector('[data-assist="revert"]');
    const revertCounter = document.querySelector('#revert-counter');

    if (!revertButton || !revertCounter) return;

    const hasMovesToRevert = gameState.moveHistory.length > 0;
    const hasNotUsedRevert =
      gameState.assists.revert.used < gameState.assists.revert.max;

    revertButton.disabled = !hasMovesToRevert || !hasNotUsedRevert;

    if (revertButton.disabled) {
      revertButton.classList.add('button--disabled');
    } else {
      revertButton.classList.remove('button--disabled');
    }

    const remaining =
      gameState.assists.revert.max - gameState.assists.revert.used;
    revertCounter.textContent = `${remaining}/${gameState.assists.revert.max}`;
  }

  function revertMove(move) {
    move.removedCells.forEach(cell => {
      if (cell.element) {
        cell.element.textContent = cell.number;
        cell.element.classList.remove('game-grid__cell--empty');
        cell.element.disabled = false;
        gameState.grid[cell.row][cell.col] = cell.number;
      }
    });

    gameState.score = move.previousScore;
    updateScoreUI();

    clearSelection();
  }

  function useAddNumbers() {
    if (!useAssist('addNumbers')) {
      showMessage('No more number additions available!');
      return;
    }

    addNewLineToGrid();
    updateAssistCounters();
    checkLoseCondition();

    showMessage('New numbers added to grid');
  }

  function addNewLineToGrid() {
    let gameGridFlat = gameState.grid.flat();

    let matrix = createGridMatrixFromArr(gameGridFlat.filter(Boolean));

    // console.log(matrix)

    const gameGridEl = document.querySelector('#game-grid');
    if (gameGridEl) {
      renderNewMatrix(matrix, gameState.grid.length - 1, gameGridEl);
    }

    const isMatrixFull = matrix.every(row => row.length === GRID_COLS);
    const isGameStateGridFull = gameState.grid.every(
      row => row.length === GRID_COLS
    );

    if (isMatrixFull || isGameStateGridFull) {
      matrix.forEach(arr => {
        gameState.grid.push(arr);
      });
    } else {
      const lastGridArr = gameState.grid[gameState.grid.length - 1];
      const cellLeftToFullRow = GRID_COLS - lastGridArr.length;
      const leftToFillLastRowArr = matrix.flat().slice(0, cellLeftToFullRow);
      const newMatrix = createGridMatrixFromArr(
        matrix.flat().slice(cellLeftToFullRow)
      );
      leftToFillLastRowArr.forEach(number => {
        gameState.grid[gameState.grid.length - 1].push(number);
      });
      newMatrix.forEach(arr => {
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
      row => row.length === GRID_COLS
    );

    if (isGameStateGridFull) {
      renderFromNewLine(matrix, rowIndex, gridElement);
    } else {
      const lastdRowEl = gridElement.querySelector(
        '.game-grid__row:last-child'
      );
      const lastdRowCellsAmount =
        lastdRowEl.querySelectorAll('.game-grid__cell').length;
      const emptyCellsAmount = GRID_COLS - lastdRowCellsAmount;
      const fillEmptyArr = matrix.flat().slice(0, emptyCellsAmount);
      const newMatrix = createGridMatrixFromArr(
        matrix.flat().slice(emptyCellsAmount)
      );
      fillEmptyArr.forEach((number, idx) => {
        const colIndex = lastdRowCellsAmount + idx + 1;
        const cell = createElement({
          tag: 'button',
          text: number,
          data: { number: number, row: rowIndex, col: colIndex },
          classArr: ['game-grid__cell'],
        });

        lastdRowEl.appendChild(cell);
      });
      renderFromNewLine(newMatrix, rowIndex, gridElement);
    }
  }

  function renderFromNewLine(matrix, rowIndex, gridElement) {
    matrix.forEach((row, idx) => {
      const rowEl = createElement({
        tag: 'div',
        classArr: ['game-grid__row'],
      });

      const newRowIdx = idx + rowIndex + 1;
      row.forEach((number, colIndex) => {
        const cell = createElement({
          tag: 'button',
          text: number,
          data: { number: number, row: newRowIdx, col: colIndex },
          classArr: ['game-grid__cell'],
        });

        rowEl.appendChild(cell);
      });

      gridElement.appendChild(rowEl);
    });
  }

  function useShuffle() {
    if (!useAssist('shuffle')) {
      showMessage('No more shuffles available!');
      return;
    }

    shuffleGrid();
    updateAssistCounters();
    showMessage('Grid shuffled');
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
    const gameGridEl = document.querySelector('#game-grid');
    if (!gameGridEl) return;

    gameGridEl.textContent = '';

    gameState.grid.forEach((row, rowIndex) => {
      const rowEl = createElement({ tag: 'div', classArr: ['game-grid__row'] });

      row.forEach((number, colIndex) => {
        if (number === null) {
          const emptyCell = createElement({
            tag: 'div',
            text: '',
            classArr: ['game-grid__cell', 'game-grid__cell--empty'],
          });
          rowEl.appendChild(emptyCell);
        } else {
          const cell = createElement({
            tag: 'button',
            text: number,
            data: { number: number, row: rowIndex, col: colIndex },
            classArr: ['game-grid__cell'],
          });

          rowEl.appendChild(cell);
        }
      });

      gameGridEl.appendChild(rowEl);
    });
  }

  function useEraser() {
    if (!useAssist('eraser')) {
      showMessage('No more eraser uses available!');
      return;
    }

    if (gameState.selectedCells.length !== 1) {
      showMessage('Please select exactly one number to erase');
      return;
    }

    const cellToErase = gameState.selectedCells[0];
    eraseCell(cellToErase);
    updateAssistCounters();
    showMessage('Number removed');
  }

  function eraseCell(cell) {
    const { element, row, col } = cell;

    element.textContent = '';
    element.classList.add('game-grid__cell--empty');
    element.disabled = true;
    gameState.grid[row][col] = null;

    clearSelection();
    updateEraserButtonState();
  }

  function updateEraserButtonState() {
    const eraserButton = document.querySelector('[data-assist="eraser"]');
    if (eraserButton) {
      const hasSingleSelection = gameState.selectedCells.length === 1;
      const hasUsesLeft = getAssistUses('eraser') > 0;

      eraserButton.disabled = !hasSingleSelection || !hasUsesLeft;

      if (eraserButton.disabled) {
        eraserButton.classList.add('button--disabled');
      } else {
        eraserButton.classList.remove('button--disabled');
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
    Object.keys(gameState.assists).forEach(assistId => {
      const counterElement = document.querySelector(`#${assistId}-counter`);
      const assistButton = document.querySelector(
        `[data-assist="${assistId}"]`
      );

      if (counterElement && assistButton) {
        const assist = gameState.assists[assistId];
        const remaining = assist.max - assist.used;

        if (assistId === 'eraser') {
          const hasSingleSelection = gameState.selectedCells.length === 1;
          assistButton.disabled = !hasSingleSelection || remaining <= 0;
        } else if (assistId === 'revert') {
          const hasMovesToRevert = gameState.moveHistory.length > 0;
          const hasNotUsedRevert = remaining > 0;
          assistButton.disabled = !hasMovesToRevert || !hasNotUsedRevert;
        } else {
          assistButton.disabled = remaining <= 0;
        }

        if (assistButton.disabled) {
          assistButton.classList.add('button--disabled');
        } else {
          assistButton.classList.remove('button--disabled');
        }
      }
    });
  }

  function updateAssistUI(assistId) {
    if (assistId === 'revert' || assistId === 'hints') return;
    let assistInfo;
    let elementId;

    const addNumbersMaxLineEl = document.getElementById(
      'add-numbers-max-lines'
    );

    if (assistId === 'add-numbers') {
      assistInfo = gameState.assists['addNumbers'];
      elementId = assistId;
      addNumbersMaxLineEl.textContent = `${gameState.grid.length}/${MAX_LINES}`;
    } else {
      assistInfo = gameState.assists[assistId];
      elementId = assistId;
    }

    if (assistId === 'addNumbers') {
      elementId = 'add-numbers';
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
      tag: 'div',
      text: message,
      classArr: ['toast-message'],
    });

    const isToastedAdded = !!document.querySelector('.toast-message');

    if (!isToastedAdded) {
      document.body.append(el);
      setTimeout(() => {
        if (document.querySelector('.toast-message')) {
          document.querySelector('.toast-message').remove();
        }
      }, toastMessageTimeout);
    } else {
      document.querySelector('.toast-message').remove();
      document.body.append(el);
      setTimeout(() => {
        if (document.querySelector('.toast-message')) {
          document.querySelector('.toast-message').remove();
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
    }, 1000);
  }

  function updateTimerUI() {
    const timerDisplay = document.querySelector('#timer-display');
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
      showGameOutcomeModal('Win');
      playSound('win');
      const resultsObj = {
        mode: gameState.mode,
        score: gameState.score,
        time: formatTime(gameState.elapsedTime),
        moves: gameState.moveHistory.length,
        result: 'Win',
      };

      saveGameResults(resultsObj);
    }
  }

  function checkLoseCondition() {
    if (gameState.grid.length >= MAX_LINES) {
      gameState.isGameActive = false;
      stopGameTimer();
      showGameOutcomeModal('Lose');
      playSound('lose');

      const resultsObj = {
        mode: gameState.mode,
        score: gameState.score,
        time: formatTime(gameState.elapsedTime),
        moves: gameState.moveHistory.length,
        result: 'Lose',
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
      outcome: outcome,
      score: gameState.score,
      time: formatTime(gameState.elapsedTime),
      mode: gameState.mode,
      moves: gameState.moveHistory.length,
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
      modal.element.addEventListener('click', e => {
        const target = e.target;
        if (
          target.closest('.modal__overlay') ||
          target.closest('.modal__close-btn')
        ) {
          resetGameState();
          showGameScreen(gameState.mode);
        }
      });
    };

    outcomeModal.controller.show({
      outcome: outcome,
      score: gameState.score,
      time: formatTime(gameState.elapsedTime),
      mode: gameState.mode,
      moves: gameState.moveHistory.length,
    });
  }

  return { init };
}
