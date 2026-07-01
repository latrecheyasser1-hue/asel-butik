const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printSilent: (options) => ipcRenderer.invoke('print-silent', options)
});

// Add error logging via IPC
window.addEventListener('error', (event) => {
    try {
        ipcRenderer.send('log-error', (event.error ? event.error.stack : event.message || event.type || 'Unknown Error') + (event.target && event.target.src ? ' ' + event.target.src : '') + '\n');
    } catch(e) {}
}, true);
window.addEventListener('unhandledrejection', (event) => {
    try {
        ipcRenderer.send('log-error', (event.reason ? (event.reason.stack || event.reason) : event.reason) + '\n');
    } catch(e) {}
});
