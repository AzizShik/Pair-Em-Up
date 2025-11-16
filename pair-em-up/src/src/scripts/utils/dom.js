export function createElement(options) {
  const {
    tag = 'div',
    text = '',
    parent,
    children = [],
    classArr = [],
    id = '',
    data = {},
    attr = {},
    src = '',
    href = '',
  } = options;

  const element = document.createElement(tag);
  element.textContent = text;

  if (classArr.length > 0) {
    element.classList.add(...classArr);
  }

  if (parent != null) {
    parent.appendChild(element);
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

export function qsElement(selector, root = document) {
  return root.querySelector(selector);
}
