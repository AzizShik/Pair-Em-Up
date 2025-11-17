import { createElement, qsElement } from '../utils/dom.js';
import { openModal, closeCurrentModal } from '../utils/modal.js';
import { STORAGE_KEY } from '../constants.js';

export function createResultsModal() {
  const modal = createElement({
    tag: 'div',
    classArr: ['modal', 'results-modal'],
  });

  const overlay = createElement({
    tag: 'div',
    classArr: ['modal__overlay'],
    parent: modal,
  });

  const content = createElement({
    tag: 'div',
    classArr: ['modal__content'],
    parent: modal,
  });

  const header = createElement({
    tag: 'div',
    classArr: ['modal__header'],
    parent: content,
    children: [
      createElement({
        tag: 'h2',
        classArr: ['modal__title'],
        text: 'Game Results',
      }),
      createElement({
        tag: 'button',
        classArr: ['modal__close-btn'],
        text: 'x',
        id: 'modal-close',
      }),
    ],
  });

  const settingsContainer = createElement({
    tag: 'div',
    classArr: ['modal__body'],
    parent: content,
  });

  const resultsTable = createElement({
    tag: 'div',
    classArr: ['results-table'],
    parent: settingsContainer,
  });

  const resultsTableHeaderTitles = ['Mode', 'Score', 'Time', 'Results'];

  const resultsTableHeader = createElement({
    tag: 'div',
    classArr: ['results-table__header'],
    parent: resultsTable,
  });

  resultsTableHeaderTitles.forEach(title => {
    createElement({
      tag: 'h3',
      classArr: ['results-table__header-title'],
      text: title,
      parent: resultsTableHeader,
    });
  });

  const resultsTableBody = createElement({
    tag: 'div',
    classArr: ['results-table__body'],
    parent: resultsTable,
  });

  function render(results) {
    resultsTableBody.textContent = '';

    if (!results || results.length === 0) {
      createElement({
        tag: 'div',
        classArr: ['results-table__empty'],
        text: 'No games played yet',
        parent: resultsTableBody,
      });
      return;
    }

    results.forEach(result => {
      const row = createElement({
        tag: 'div',
        classArr: ['results-table__row'],
        parent: resultsTableBody,
      });

      createElement({
        tag: 'div',
        classArr: ['results-table__cell'],
        text: result.mode,
        parent: row,
      });

      createElement({
        tag: 'div',
        classArr: ['results-table__cell'],
        text: result.score,
        parent: row,
      });

      createElement({
        tag: 'div',
        classArr: ['results-table__cell'],
        text: result.time,
        parent: row,
      });

      createElement({
        tag: 'div',
        classArr: ['results-table__cell'],
        text: result.result,
        parent: row,
      });
    });
  }

  const controller = {
    onClose: null,
    show: null,
    hide: null,
  };

  function setupEventListeners() {
    const closeBtn = qsElement('#modal-close', modal);
    if (closeBtn) closeBtn.addEventListener('click', hide);

    overlay.addEventListener('click', hide);
  }

  function show() {
    openModal(modal);
    setupEventListeners();
  }

  function hide() {
    closeCurrentModal();
  }

  controller.show = show;
  controller.hide = hide;

  return {
    element: modal,
    controller,
    render,
  };
}
