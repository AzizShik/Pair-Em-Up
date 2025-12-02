import { createStorage } from '../storage.js';
import { createElement, qsElement } from '../utils/dom.js';
import { openModal, closeCurrentModal } from '../utils/modal.js';

export function createSettingsModal() {
  const modal = createElement({
    tag: 'div',
    classArr: ['modal', 'settings-modal'],
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

  createElement({
    tag: 'div',
    classArr: ['modal__header'],
    parent: content,
    children: [
      createElement({
        tag: 'h2',
        classArr: ['modal__title'],
        text: 'Settings',
      }),
      createElement({
        tag: 'button',
        classArr: ['modal__close-btn'],
        id: 'modal-close',
        children: [
          createElement({ tag: 'span', classArr: ['modal__close-btn__span'] }),
          createElement({ tag: 'span', classArr: ['modal__close-btn__span'] }),
        ],
      }),
    ],
  });

  const settingsContainer = createElement({
    tag: 'div',
    classArr: ['modal__body'],
    parent: content,
  });

  const audioSection = createElement({
    tag: 'div',
    classArr: ['settings-section'],
    parent: settingsContainer,
  });

  createElement({
    tag: 'h3',
    classArr: ['settings-section__title'],
    text: 'Audio',
    parent: audioSection,
  });

  createElement({
    tag: 'label',
    classArr: ['settings-toggle'],
    parent: audioSection,
    children: [
      createElement({
        tag: 'span',
        classArr: ['settings-toggle__label'],
        text: 'Sound Effects',
      }),
      createElement({
        tag: 'label',
        classArr: ['settings-toggle__switch'],
        children: [
          createElement({
            tag: 'input',
            classArr: ['settings-toggle__switch-input'],
            id: 'audio-toggle',
            attr: { type: 'checkbox' },
          }),
          createElement({
            tag: 'span',
            classArr: ['settings-toggle__slider'],
          }),
        ],
      }),
    ],
  });

  const themeSection = createElement({
    tag: 'div',
    classArr: ['settings-section'],
    parent: settingsContainer,
  });

  createElement({
    tag: 'h3',
    classArr: ['settings-section__title'],
    text: 'Theme',
    parent: themeSection,
  });

  const themeOptions = createElement({
    tag: 'div',
    classArr: ['settings-theme-options'],
    parent: themeSection,
  });

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
  ];

  themes.forEach(theme => {
    createElement({
      tag: 'label',
      classArr: ['settings-theme-option'],
      attr: { for: `theme-${theme.id}` },
      parent: themeOptions,
      children: [
        createElement({
          tag: 'input',
          id: `theme-${theme.id}`,
          attr: {
            type: 'radio',
            name: 'theme',
            value: theme.id,
          },
        }),
        createElement({
          tag: 'span',
          classArr: ['settings-theme-option__preview'],
          text: `${theme.icon}${theme.name}`,
        }),
      ],
    });
  });

  createElement({
    tag: 'div',
    classArr: ['modal__footer'],
    parent: content,
    children: [
      createElement({
        tag: 'button',
        classArr: ['button', 'button--secondary'],
        text: 'Reset to Defaults',
        id: 'settings-reset',
      }),
    ],
  });

  const controller = {
    onClose: null,
    onThemeChange: null,
    onAudioToggle: null,
    onReset: null,
    show: null,
    hide: null,
    setSettings: null,
  };

  const storage = createStorage();
  let currentSettings = storage.loadSettings();

  function setupEventListeners() {
    const closeBtn = qsElement('#modal-close', modal);
    if (closeBtn) closeBtn.addEventListener('click', hide);

    overlay.addEventListener('click', hide);

    const resetBtn = qsElement('#settings-reset', modal);
    if (resetBtn)
      resetBtn.addEventListener('click', () => {
        resetToDefaults();
        if (controller.onReset) controller.onReset();
      });

    const audioCheckbox = qsElement('#audio-toggle', modal);
    if (audioCheckbox)
      audioCheckbox.addEventListener('change', e => {
        currentSettings.isAudioEnabled = e.target.checked;
        if (controller.onAudioToggle)
          controller.onAudioToggle(e.target.checked);
      });

    const themeRadios = modal.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
      radio.addEventListener('change', e => {
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

  function setSettings(settings) {
    if (!settings) return;
    currentSettings = { ...currentSettings, ...settings };
    updateUI();
  }

  function resetToDefaults() {
    currentSettings = { isAudioEnabled: true, theme: 'light' };
    updateUI();

    if (controller.onAudioToggle)
      controller.onAudioToggle(currentSettings.isAudioEnabled, false);
    if (controller.onThemeChange)
      controller.onThemeChange(currentSettings.theme, false);
  }

  function updateUI() {
    const audioCheckbox = qsElement('#audio-toggle', modal);
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
    getCurrentSettings,
  };
}
