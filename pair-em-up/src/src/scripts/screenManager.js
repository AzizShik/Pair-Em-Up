export function createScreenManager(appElement) {
  let currentScreen = null;
  const screenConstructors = new Map();

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
        onDestroy: screen.onDestroy,
      };

      if (screen.onShow) {
        screen.onShow();
      }
    }
  }

  function getCurrentScreen() {
    return currentScreen?.name;
  }

  function getCurrentController() {
    return currentScreen?.controller;
  }

  return {
    registerScreen,
    showScreen,
    getCurrentScreen,
    getCurrentController,
  };
}
