import { createElement, qsElement } from '../utils/dom.js';
import { openModal, closeCurrentModal } from '../utils/modal.js';

export function createGameOutcomeModal() {
  const modal = createElement({
    tag: 'div',
    classArr: ['modal', 'game-outcome-modal'],
  });

  const overlay = createElement({
    tag: 'div',
    classArr: ['modal__overlay'],
    parent: modal,
  });

  const content = createElement({
    tag: 'div',
    classArr: ['modal__content', 'game-outcome-modal__content'],
    parent: modal,
  });

  const header = createElement({
    tag: 'div',
    classArr: ['game-outcome-modal__header'],
    parent: content,
  });

  const title = createElement({
    tag: 'h2',
    classArr: ['game-outcome-modal__title'],
    text: 'Game',
    parent: header,
  });

  const subTitle = createElement({
    tag: 'h2',
    classArr: ['game-outcome-modal__subtitle'],
    parent: header,
  });

  const statsContainer = createElement({
    tag: 'div',
    classArr: ['game-outcome-modal__stats'],
    parent: content,
  });

  const scoreRow = createElement({
    tag: 'div',
    classArr: ['game-outcome-modal__stat-row'],
    parent: statsContainer,
  });

  createElement({
    tag: 'span',
    classArr: ['game-outcome-modal__stat-label'],
    text: 'Score:',
    parent: scoreRow,
  });

  const scoreValue = createElement({
    tag: 'span',
    classArr: ['game-outcome-modal__stat-value'],
    text: '0',
    parent: scoreRow,
  });

  const timeRow = createElement({
    tag: 'div',
    classArr: ['game-outcome-modal__stat-row'],
    parent: statsContainer,
  });

  createElement({
    tag: 'span',
    classArr: ['game-outcome-modal__stat-label'],
    text: 'Time:',
    parent: timeRow,
  });

  const timeValue = createElement({
    tag: 'span',
    classArr: ['game-outcome-modal__stat-value'],
    text: '00:00',
    parent: timeRow,
  });

  const modeRow = createElement({
    tag: 'div',
    classArr: ['game-outcome-modal__stat-row'],
    parent: statsContainer,
  });

  createElement({
    tag: 'span',
    classArr: ['game-outcome-modal__stat-label'],
    text: 'Mode:',
    parent: modeRow,
  });

  const modeValue = createElement({
    tag: 'span',
    classArr: ['game-outcome-modal__stat-value'],
    text: 'Classic Mode',
    parent: modeRow,
  });

  const buttonsContainer = createElement({
    tag: 'div',
    classArr: ['game-outcome-modal__buttons'],
    parent: content,
  });

  const playAgainBtn = createElement({
    tag: 'button',
    classArr: ['button', 'button--primary', 'game-outcome-modal__btn'],
    text: 'Play Again',
    parent: buttonsContainer,
  });

  const mainMenuBtn = createElement({
    tag: 'button',
    classArr: ['button', 'button--secondary', 'game-outcome-modal__btn'],
    text: 'Main Menu',
    parent: buttonsContainer,
  });

  const viewResultsBtn = createElement({
    tag: 'button',
    classArr: ['button', 'button--secondary', 'game-outcome-modal__btn'],
    text: 'View Results',
    parent: buttonsContainer,
  });

  const controller = {
    onPlayAgain: null,
    onMainMenu: null,
    onViewResults: null,
    show: null,
    hide: null,
    setOutcome: null,
  };

  function setupEventListeners() {
    playAgainBtn.addEventListener('click', () => {
      controller.onPlayAgain?.();
      hide();
    });

    mainMenuBtn.addEventListener('click', () => {
      controller.onMainMenu?.();
      hide();
    });

    viewResultsBtn.addEventListener('click', () => {
      controller.onViewResults?.();
    });

    overlay.addEventListener('click', () => {
      controller.onPlayAgain?.();
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
      time = '00:00',
      mode = 'Classic Mode',
      moves = 0,
    } = outcomeData;

    title.textContent = outcome === 'Win' ? 'You Win!' : 'You Loss';
    subTitle.textContent =
      outcome === 'Win' ? 'Congratulations' : 'Exceeding the 50 line limit!';

    scoreValue.textContent = score;
    timeValue.textContent = time;
    modeValue.textContent = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`;

    if (outcome === 'Win') {
      title.classList.add('game-outcome-modal__title--win');
      content.classList.add('game-outcome-modal__content--win');
      title.classList.remove('game-outcome-modal__title--loss');
      content.classList.remove('game-outcome-modal__content--loss');
    } else {
      title.classList.remove('game-outcome-modal__title--win');
      content.classList.remove('game-outcome-modal__content--win');
      title.classList.add('game-outcome-modal__title--loss');
      content.classList.add('game-outcome-modal__content--loss');
    }
  }

  controller.show = show;
  controller.hide = hide;
  controller.setOutcome = setOutcome;

  return {
    element: modal,
    controller,
  };
}
