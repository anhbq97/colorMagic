const { app, BrowserWindow, ipcMain} = require('electron')
const { autoUpdater } = require('electron-updater');
const path = require("path");

let mainWindow, loginWindow;

function initLoginWindow () {
    loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: !app.isPackaged,
        }
    });
    loginWindow.loadFile('view/login.html');
    loginWindow.on('closed', function () {
        loginWindow = null;
    });
    loginWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
    loginWindow.webContents.openDevTools()
}

function initMainWindow () {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: !app.isPackaged,
        }
    });
    mainWindow.loadFile('view/main.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    mainWindow.once('ready-to-show', () => {
        // autoUpdater.checkForUpdatesAndNotify();
    });
    mainWindow.focus();
    mainWindow.webContents.openDevTools()
}

app.on('ready', () => {
    initLoginWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (loginWindow === null) {
        initLoginWindow();
    }
});


ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
    loginWindow.webContents.send('update_available');
  });
autoUpdater.on('download-progress', (obj) => {
    loginWindow.webContents.send('update-progress', { progress: obj.percent});
});

autoUpdater.on('update-downloaded', () => {
    loginWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('getPath_app', (event) => {
    event.sender.send('getPath_app', { path: __dirname });
});

ipcMain.on('getPath_root', (event) => {
let myInstalledDir = path.join(app.getAppPath(),"..",".."); // root installation path
    event.sender.send('getPath_root', { path: myInstalledDir });
});

ipcMain.on('initMain', () => {
    initMainWindow();
    loginWindow.hide();
});
