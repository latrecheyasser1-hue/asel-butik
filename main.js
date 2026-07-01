const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Asel Butik',
        icon: path.join(__dirname, 'images/logo-192.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // We load the admin index.html by default, since this is for the cashier/manager.
    // mainWindow.webContents.openDevTools();
    
    mainWindow.loadFile(path.join(__dirname, 'admin/index.html'));
    
    // Remove default menu to make it look like a pure app
    mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(async () => {
    try {
        // Clear HTTP cache on startup to ensure latest assets are always loaded
        await session.defaultSession.clearCache();
        // Force clear any cached Service Worker database to prevent hijacking of local file:// requests
        await session.defaultSession.clearStorageData({
            storages: ['serviceworkers', 'cachestorage']
        });
    } catch (err) {
        console.error('Failed to clear service workers storage/cache:', err);
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handler to get list of printers
ipcMain.handle('get-printers', async (event) => {
    if (!mainWindow) return [];
    return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.on('log-error', (event, msg) => {
    require('fs').appendFileSync('renderer_error.log', new Date().toISOString() + ' ' + msg + '\n');
});

const activePrintWindows = new Set();

// IPC handler for silent printing
ipcMain.handle('print-silent', async (event, options) => {
    if (!mainWindow) return { success: false, error: 'No main window' };
    
    // If options.html is provided, print from a hidden window
    if (options.html) {
        return new Promise((resolve) => {
            const hiddenWin = new BrowserWindow({ 
                show: false,
                webPreferences: { 
                    nodeIntegration: false,
                    paintWhenInitiallyHidden: true
                }
            });
            activePrintWindows.add(hiddenWin);

            hiddenWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(options.html));
            hiddenWin.webContents.on('did-finish-load', () => {
                setTimeout(() => {
                    const printOptions = {
                        silent: true,
                        printBackground: true,
                        margins: { marginType: 'none' }
                    };
                    if (options.deviceName && options.deviceName.trim() !== '') {
                        printOptions.deviceName = options.deviceName.trim();
                    }

                    hiddenWin.webContents.print(
                        printOptions,
                        (success, failureReason) => {
                            hiddenWin.close();
                            activePrintWindows.delete(hiddenWin);
                            resolve({ success, error: failureReason });
                        }
                    );
                }, 500);
            });
        });
    }

    // Otherwise, print the current window
    return new Promise((resolve, reject) => {
        const printOptions = {
            silent: true,
            printBackground: true,
            margins: { marginType: 'none' }
        };
        if (options.deviceName && options.deviceName.trim() !== '') {
            printOptions.deviceName = options.deviceName.trim();
        }

        mainWindow.webContents.print(
            printOptions, 
            (success, failureReason) => {
                resolve({ success, error: failureReason });
            }
        );
    });
});
