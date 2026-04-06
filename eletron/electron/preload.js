/**
 * Preload: sampaikan IPC ke renderer tanpa expose ipcRenderer penuh.
 * context-menu-clicked dipancarkan dari main (electronShell.js) → renderer (App.js).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onContextMenuClick: (callback) => {
    ipcRenderer.on('context-menu-clicked', (_event, data) => {
      callback(data);
    });
  },
  removeContextMenuClickListener: () => {
    ipcRenderer.removeAllListeners('context-menu-clicked');
  },
});
