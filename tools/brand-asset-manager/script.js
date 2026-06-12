document.addEventListener('DOMContentLoaded', () => {
  // Config
  localforage.config({
    name: 'ALL_IN_ONE',
    storeName: 'brand_asset_manager'
  });

  // State
  let currentFolder = 'logos'; // logos | graphics | colors
  let assets = {
    logos: [],
    graphics: [],
    colors: []
  };

  // DOM Elements
  const folderItems = document.querySelectorAll('.folder-item');
  const currentFolderTitle = document.getElementById('current-folder-title');
  const btnUpload = document.getElementById('btn-upload');
  const btnUploadText = document.getElementById('btn-upload-text');
  const fileInput = document.getElementById('file-input');
  const colorInput = document.getElementById('color-input');
  const assetGrid = document.getElementById('asset-grid');

  // Load Data
  async function loadData() {
    try {
      const stored = await localforage.getItem('brand_assets');
      if (stored) {
        assets = stored;
      }
      renderGrid();
    } catch (e) {
      console.error('Error loading assets', e);
    }
  }

  // Save Data
  async function saveData() {
    try {
      await localforage.setItem('brand_assets', assets);
    } catch (e) {
      console.error('Error saving assets', e);
      alert('Storage quota exceeded or error saving.');
    }
  }

  // Handle Folder Switching
  folderItems.forEach(item => {
    item.addEventListener('click', () => {
      folderItems.forEach(f => f.classList.remove('active'));
      item.classList.add('active');
      
      currentFolder = item.getAttribute('data-folder');
      currentFolderTitle.textContent = item.textContent.trim();
      
      if (currentFolder === 'colors') {
        btnUploadText.textContent = 'Add Color';
        // Reset inputs
        fileInput.value = '';
      } else {
        btnUploadText.textContent = 'Upload File';
      }
      
      renderGrid();
    });
  });

  // Handle Upload / Add Button
  btnUpload.addEventListener('click', () => {
    if (currentFolder === 'colors') {
      colorInput.click();
    } else {
      fileInput.click();
    }
  });

  // Handle Color Add
  colorInput.addEventListener('input', async (e) => {
    const hex = e.target.value;
    if (!assets.colors) assets.colors = [];
    assets.colors.push({
      id: Date.now().toString(),
      hex: hex,
      date: new Date().toLocaleDateString()
    });
    await saveData();
    renderGrid();
  });

  // Handle File Upload
  fileInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    btnUploadText.textContent = 'Saving...';
    btnUpload.disabled = true;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Convert to base64
      const reader = new FileReader();
      
      const filePromise = new Promise((resolve) => {
        reader.onload = (evt) => {
          resolve(evt.target.result);
        };
        reader.readAsDataURL(file);
      });

      const base64 = await filePromise;
      
      // Get dimensions roughly
      let metaInfo = (file.size / 1024).toFixed(1) + ' KB';
      
      if (!assets[currentFolder]) assets[currentFolder] = [];
      
      assets[currentFolder].push({
        id: Date.now().toString() + i,
        name: file.name,
        type: file.type,
        size: metaInfo,
        data: base64,
        date: new Date().toLocaleDateString()
      });
    }

    await saveData();
    
    // Reset
    fileInput.value = '';
    btnUploadText.textContent = 'Upload File';
    btnUpload.disabled = false;
    
    renderGrid();
  });

  // Delete Action
  window.deleteAsset = async function(id) {
    if (!confirm('Delete this asset permanently?')) return;
    
    assets[currentFolder] = assets[currentFolder].filter(a => a.id !== id);
    await saveData();
    renderGrid();
  };

  // Download Action
  window.downloadAsset = function(id) {
    const item = assets[currentFolder].find(a => a.id === id);
    if (!item) return;
    
    const a = document.createElement('a');
    a.href = item.data;
    a.download = item.name;
    a.click();
  };

  // Copy Color Action
  window.copyColor = function(hex) {
    navigator.clipboard.writeText(hex).then(() => {
      alert('Copied ' + hex);
    });
  };

  // Render
  function renderGrid() {
    assetGrid.innerHTML = '';
    const currentList = assets[currentFolder] || [];

    if (currentList.length === 0) {
      assetGrid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
            <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>No assets found in this folder.<br>Click the button above to add some.</p>
        </div>
      `;
      return;
    }

    if (currentFolder === 'colors') {
      currentList.forEach(c => {
        const div = document.createElement('div');
        div.className = 'color-card';
        div.style.backgroundColor = c.hex;
        div.onclick = (e) => {
          // If clicked delete, don't copy
          if(e.target.closest('.delete-color')) return;
          window.copyColor(c.hex);
        };
        
        div.innerHTML = `
          <div class="color-hex">${c.hex}</div>
          <button class="btn-icon delete-color" style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; padding: 0; background: rgba(0,0,0,0.5); color: white; border: none;" onclick="deleteAsset('${c.id}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        `;
        assetGrid.appendChild(div);
      });
    } else {
      currentList.forEach(asset => {
        const div = document.createElement('div');
        div.className = 'asset-card';
        
        div.innerHTML = `
          <div class="asset-preview">
            <img src="${asset.data}" alt="${asset.name}" loading="lazy">
          </div>
          <div class="asset-info">
            <div class="asset-name" title="${asset.name}">${asset.name}</div>
            <div class="asset-meta">
              <span>${asset.type.split('/')[1] ? asset.type.split('/')[1].toUpperCase() : 'FILE'}</span>
              <span>${asset.size}</span>
            </div>
            <div class="asset-actions">
              <button class="btn-icon" onclick="downloadAsset('${asset.id}')" title="Download">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
              <button class="btn-icon delete" onclick="deleteAsset('${asset.id}')" title="Delete">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;
        assetGrid.appendChild(div);
      });
    }
  }

  // Init
  loadData();
});
