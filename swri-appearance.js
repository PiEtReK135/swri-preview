(() => {
  const root = document.documentElement;
  const toggles = [
    { attribute: 'theme', value: 'dark', defaultValue: 'dark', offValue: 'light', label: 'Tryb ciemny', text: 'Ciemny', icon: '☾' },
    { attribute: 'contrast', value: 'high', label: 'Wysoki kontrast', text: 'Kontrast', icon: '◐' },
  ];
  const fontSizes = new Map([
    ['small', 'Mała'],
    ['medium', 'Średnia'],
    ['large', 'Duża'],
  ]);
  const fontKey = 'swri-font-size';
  const defaultFontSize = 'medium';
  const storageKey = ({ attribute }) => 'swri-' + attribute;

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function save(key, value) {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // The controls still work for the current page without storage.
    }
  }

  function applyToggle({ attribute, value }, enabled) {
    if (enabled) {
      root.dataset[attribute] = value;
    } else {
      delete root.dataset[attribute];
    }
    for (const button of document.querySelectorAll('swri-appearance [data-option="' + attribute + '"]')) {
      button.setAttribute('aria-pressed', String(enabled));
    }
  }

  function restoreToggle(toggle) {
    const storedValue = read(storageKey(toggle)) ?? toggle.defaultValue;
    applyToggle(toggle, storedValue === toggle.value);
  }

  function applyFontSize(value) {
    const size = fontSizes.has(value) ? value : defaultFontSize;
    if (size === defaultFontSize) {
      delete root.dataset.fontSize;
    } else {
      root.dataset.fontSize = size;
    }
    for (const button of document.querySelectorAll('swri-appearance [data-font-size-option]')) {
      button.setAttribute('aria-pressed', String(button.dataset.fontSizeOption === size));
    }
  }

  for (const toggle of toggles) {
    restoreToggle(toggle);
  }
  applyFontSize(read(fontKey));

  window.addEventListener('storage', (event) => {
    for (const toggle of toggles) {
      if (event.key === null || event.key === storageKey(toggle)) {
        restoreToggle(toggle);
      }
    }
    if (event.key === null || event.key === fontKey) {
      applyFontSize(read(fontKey));
    }
  });

  function createToggle(toggle) {
    const { attribute, value, label, text, icon } = toggle;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.option = attribute;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(root.dataset[attribute] === value));

    const glyph = document.createElement('span');
    glyph.className = 'appearance-icon';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = icon;
    button.append(glyph, document.createTextNode(text));

    button.addEventListener('click', () => {
      const enabled = root.dataset[attribute] !== value;
      applyToggle(toggle, enabled);
      save(storageKey(toggle), enabled ? value : toggle.offValue ?? null);
    });
    return button;
  }

  function createFontSizeControl() {
    const group = document.createElement('div');
    group.className = 'appearance-font-buttons';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Rozmiar czcionki');

    const currentSize = root.dataset.fontSize || defaultFontSize;

    for (const [size, text] of fontSizes) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.fontSizeOption = size;
      button.textContent = 'Aa';
      button.setAttribute('aria-label', text + ' czcionka');
      button.setAttribute('aria-pressed', String(size === currentSize));

      button.addEventListener('click', () => {
        applyFontSize(size);
        save(fontKey, size === defaultFontSize ? null : size);
      });
      group.append(button);
    }

    return group;
  }

  class SwriAppearance extends HTMLElement {
    connectedCallback() {
      if (this.childElementCount) return;
      this.setAttribute('role', 'group');
      this.setAttribute('aria-label', 'Ustawienia wyglądu');
      this.append(...toggles.map(createToggle), createFontSizeControl());
    }
  }

  customElements.define('swri-appearance', SwriAppearance);
})();
