const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  quit: () => ipcRenderer.send('app-quit'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
});
