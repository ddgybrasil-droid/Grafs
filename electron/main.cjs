const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1500,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#080a0e',
    icon: path.join(__dirname, '../dist/favicon.svg'),
    title: 'Relation Canvas',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  window.setMenuBarVisibility(false);
  window.once('ready-to-show', () => window.show());

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  void window.loadFile(path.join(__dirname, '../dist/index.html'));
};

app.setAppUserModelId('com.relationcanvas.desktop');

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
