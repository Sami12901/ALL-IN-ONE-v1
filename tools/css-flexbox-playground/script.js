// CSS Flexbox Playground Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
  // Container State
  const containerState = {
    direction: 'row',
    justify: 'flex-start',
    alignItems: 'stretch',
    wrap: 'nowrap',
    gap: 12
  };

  // Items State
  let items = [
    { id: 1, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' },
    { id: 2, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' },
    { id: 3, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' },
    { id: 4, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' }
  ];
  let nextItemId = 5;
  let selectedItemId = 1;

  // DOM Elements
  const stageCanvas = document.getElementById('stage-canvas');
  const gapSlider = document.getElementById('container-gap-slider');
  const gapVal = document.getElementById('gap-val');

  const addItemBtn = document.getElementById('add-item-btn');
  const removeItemBtn = document.getElementById('remove-item-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');

  const itemSelect = document.getElementById('item-select');
  const selectedItemLabel = document.getElementById('selected-item-label');
  const itemGrowSlider = document.getElementById('item-grow');
  const itemGrowVal = document.getElementById('item-grow-val');
  const itemShrinkSlider = document.getElementById('item-shrink');
  const itemShrinkVal = document.getElementById('item-shrink-val');
  const itemBasisInput = document.getElementById('item-basis');
  const itemOrderInput = document.getElementById('item-order');
  const itemAlignSelfSelect = document.getElementById('item-align-self');
  const resetItemBtn = document.getElementById('reset-item-btn');

  const cssOutput = document.getElementById('css-output');
  const htmlOutput = document.getElementById('html-output');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const copyHtmlBtn = document.getElementById('copy-html-btn');

  // Option Button Groups
  const propGroups = {
    direction: document.getElementById('btn-group-direction'),
    justify: document.getElementById('btn-group-justify'),
    alignItems: document.getElementById('btn-group-align-items'),
    wrap: document.getElementById('btn-group-wrap')
  };

  // Attach button group listeners
  Object.keys(propGroups).forEach((propKey) => {
    const groupEl = propGroups[propKey];
    if (!groupEl) return;
    groupEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;

      const val = btn.dataset.val;
      containerState[propKey] = val;

      // Toggle active classes
      groupEl.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      applyContainerStyles();
      updateOutputs();
    });
  });

  // Gap slider listener
  gapSlider.addEventListener('input', () => {
    containerState.gap = parseInt(gapSlider.value, 10);
    gapVal.textContent = `${containerState.gap}px`;
    applyContainerStyles();
    updateOutputs();
  });

  // Apply Container Styles to Stage Canvas
  function applyContainerStyles() {
    stageCanvas.style.flexDirection = containerState.direction;
    stageCanvas.style.justifyContent = containerState.justify;
    stageCanvas.style.alignItems = containerState.alignItems;
    stageCanvas.style.flexWrap = containerState.wrap;
    stageCanvas.style.gap = `${containerState.gap}px`;
  }

  // Populate Item Selector Dropdown
  function populateItemSelect() {
    itemSelect.innerHTML = '';
    items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `Item ${item.id}`;
      if (item.id === selectedItemId) {
        opt.selected = true;
      }
      itemSelect.appendChild(opt);
    });
  }

  // Sync Item Control Panel with Selected Item State
  function syncItemControls() {
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    selectedItemLabel.textContent = `Item ${item.id}`;
    itemSelect.value = item.id;
    itemGrowSlider.value = item.grow;
    itemGrowVal.textContent = item.grow;
    itemShrinkSlider.value = item.shrink;
    itemShrinkVal.textContent = item.shrink;
    itemBasisInput.value = item.basis;
    itemOrderInput.value = item.order;
    itemAlignSelfSelect.value = item.alignSelf;
  }

  // Render Items onto Stage Canvas
  function renderStageItems() {
    stageCanvas.innerHTML = '';

    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = `flex-item item-${item.id}`;
      if (item.id === selectedItemId) {
        el.classList.add('active');
      }

      // Apply individual styles
      el.style.flexGrow = item.grow;
      el.style.flexShrink = item.shrink;
      el.style.flexBasis = item.basis;
      el.style.order = item.order;
      if (item.alignSelf !== 'auto') {
        el.style.alignSelf = item.alignSelf;
      } else {
        el.style.alignSelf = '';
      }

      // Inside badges
      const badge = document.createElement('span');
      badge.className = 'item-badge-pill';
      badge.textContent = 'Selected';
      el.appendChild(badge);

      const num = document.createElement('div');
      num.className = 'item-index-badge';
      num.textContent = item.id;
      el.appendChild(num);

      // Meta tag showing customized properties
      const meta = document.createElement('div');
      meta.className = 'item-meta-tag';
      const metaParts = [];
      if (item.grow !== 0) metaParts.push(`g:${item.grow}`);
      if (item.shrink !== 1) metaParts.push(`s:${item.shrink}`);
      if (item.basis !== 'auto') metaParts.push(`b:${item.basis}`);
      if (item.order !== 0) metaParts.push(`ord:${item.order}`);
      if (item.alignSelf !== 'auto') metaParts.push(item.alignSelf);
      meta.textContent = metaParts.length > 0 ? metaParts.join(' | ') : 'default';
      el.appendChild(meta);

      // Click to select
      el.addEventListener('click', () => {
        selectedItemId = item.id;
        syncItemControls();
        renderStageItems();
      });

      stageCanvas.appendChild(el);
    });
  }

  // Update Code Outputs
  function updateOutputs() {
    // CSS Output
    let css = `.flex-container {\n`;
    css += `  display: flex;\n`;
    css += `  flex-direction: ${containerState.direction};\n`;
    css += `  justify-content: ${containerState.justify};\n`;
    css += `  align-items: ${containerState.alignItems};\n`;
    css += `  flex-wrap: ${containerState.wrap};\n`;
    css += `  gap: ${containerState.gap}px;\n`;
    css += `}\n`;

    // Check for custom item styles
    const customizedItems = items.filter(i => 
      i.grow !== 0 || i.shrink !== 1 || i.basis !== 'auto' || i.order !== 0 || i.alignSelf !== 'auto'
    );

    if (customizedItems.length > 0) {
      css += `\n/* Child Items */\n`;
      customizedItems.forEach((item) => {
        css += `.item-${item.id} {\n`;
        if (item.grow !== 0 || item.shrink !== 1 || item.basis !== 'auto') {
          css += `  flex: ${item.grow} ${item.shrink} ${item.basis};\n`;
        }
        if (item.order !== 0) {
          css += `  order: ${item.order};\n`;
        }
        if (item.alignSelf !== 'auto') {
          css += `  align-self: ${item.alignSelf};\n`;
        }
        css += `}\n`;
      });
    }

    cssOutput.textContent = css;

    // HTML Output
    let html = `<div class="flex-container">\n`;
    items.forEach((item) => {
      html += `  <div class="flex-item item-${item.id}">${item.id}</div>\n`;
    });
    html += `</div>`;

    htmlOutput.textContent = html;
  }

  // Helper: Get active item object
  function getActiveItem() {
    return items.find(i => i.id === selectedItemId);
  }

  // Item Form Listeners
  itemSelect.addEventListener('change', () => {
    selectedItemId = parseInt(itemSelect.value, 10);
    syncItemControls();
    renderStageItems();
  });

  itemGrowSlider.addEventListener('input', () => {
    const item = getActiveItem();
    if (!item) return;
    item.grow = parseInt(itemGrowSlider.value, 10);
    itemGrowVal.textContent = item.grow;
    renderStageItems();
    updateOutputs();
  });

  itemShrinkSlider.addEventListener('input', () => {
    const item = getActiveItem();
    if (!item) return;
    item.shrink = parseInt(itemShrinkSlider.value, 10);
    itemShrinkVal.textContent = item.shrink;
    renderStageItems();
    updateOutputs();
  });

  itemBasisInput.addEventListener('input', () => {
    const item = getActiveItem();
    if (!item) return;
    item.basis = itemBasisInput.value.trim() || 'auto';
    renderStageItems();
    updateOutputs();
  });

  itemOrderInput.addEventListener('input', () => {
    const item = getActiveItem();
    if (!item) return;
    item.order = parseInt(itemOrderInput.value, 10) || 0;
    renderStageItems();
    updateOutputs();
  });

  itemAlignSelfSelect.addEventListener('change', () => {
    const item = getActiveItem();
    if (!item) return;
    item.alignSelf = itemAlignSelfSelect.value;
    renderStageItems();
    updateOutputs();
  });

  resetItemBtn.addEventListener('click', () => {
    const item = getActiveItem();
    if (!item) return;
    item.grow = 0;
    item.shrink = 1;
    item.basis = 'auto';
    item.order = 0;
    item.alignSelf = 'auto';
    syncItemControls();
    renderStageItems();
    updateOutputs();
  });

  // Stage Action Buttons
  addItemBtn.addEventListener('click', () => {
    if (items.length >= 24) {
      alert('Maximum of 24 items allowed.');
      return;
    }
    const newItem = {
      id: nextItemId++,
      grow: 0,
      shrink: 1,
      basis: 'auto',
      order: 0,
      alignSelf: 'auto'
    };
    items.push(newItem);
    selectedItemId = newItem.id;
    populateItemSelect();
    syncItemControls();
    renderStageItems();
    updateOutputs();
  });

  removeItemBtn.addEventListener('click', () => {
    if (items.length <= 1) {
      alert('At least 1 item must remain in the flex container.');
      return;
    }
    // Remove the currently selected item
    items = items.filter(i => i.id !== selectedItemId);
    selectedItemId = items[items.length - 1].id;
    populateItemSelect();
    syncItemControls();
    renderStageItems();
    updateOutputs();
  });

  resetAllBtn.addEventListener('click', () => {
    containerState.direction = 'row';
    containerState.justify = 'flex-start';
    containerState.alignItems = 'stretch';
    containerState.wrap = 'nowrap';
    containerState.gap = 12;

    gapSlider.value = '12';
    gapVal.textContent = '12px';

    // Reset buttons active state
    Object.keys(propGroups).forEach((propKey) => {
      const groupEl = propGroups[propKey];
      if (!groupEl) return;
      groupEl.querySelectorAll('.option-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === containerState[propKey]);
      });
    });

    items = [
      { id: 1, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' },
      { id: 2, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' },
      { id: 3, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' },
      { id: 4, grow: 0, shrink: 1, basis: 'auto', order: 0, alignSelf: 'auto' }
    ];
    nextItemId = 5;
    selectedItemId = 1;

    applyContainerStyles();
    populateItemSelect();
    syncItemControls();
    renderStageItems();
    updateOutputs();
  });

  // Copy buttons
  async function copyText(btn, text) {
    try {
      await navigator.clipboard.writeText(text);
      const origText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = origText;
        btn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  copyCssBtn.addEventListener('click', () => copyText(copyCssBtn, cssOutput.textContent));
  copyHtmlBtn.addEventListener('click', () => copyText(copyHtmlBtn, htmlOutput.textContent));

  // Initialize
  applyContainerStyles();
  populateItemSelect();
  syncItemControls();
  renderStageItems();
  updateOutputs();
});