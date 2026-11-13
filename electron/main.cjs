const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow = null;

function resolveIconPath() {
  const distIcon = path.join(__dirname, '../dist/pwa-512x512.png');
  if (fs.existsSync(distIcon)) return distIcon;
  return path.join(__dirname, '../public/pwa-512x512.png');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 960,
    minHeight: 600,
    fullscreen: true,
    title: 'EcoGrow Mission',
    icon: resolveIconPath(),
    autoHideMenuBar: true,
    backgroundColor: '#1b1612',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  if (process.env.ELECTRON_DEV_URL) {
    mainWindow.loadURL(process.env.ELECTRON_DEV_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.on('app-quit', () => {
  app.quit();
});

ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
