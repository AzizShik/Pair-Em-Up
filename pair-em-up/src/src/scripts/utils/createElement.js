export default function createElement(options) {
  const {
    tag = 'div',
    text = '',
    parent,
    children = [],
    classes = [],
    data = {},
    attr = {},
    src = '',
  } = options;

  const element = document.createElement(tag);
  element.textContent = text;

  if (classes.length > 0) {
    element.classList.add(...classes);
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
