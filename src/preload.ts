// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

// declare the window.electronAPI, nor the font-end can't access electronAPI
contextBridge.exposeInMainWorld('raceAPI', {
    desktop: true,
    startMonitor: ipcRenderer.send,
    stopMonitor: ipcRenderer.send,
    selectFile: ipcRenderer.send,
    onFileSelected: (callback: any) => {
        console.log('onFileSelected');
        ipcRenderer.on('file-selected', (_event, value) => callback(value))
    },
    onFolderSelected: (callback: any) => ipcRenderer.on('folder-selected', (_event, value) => callback(value)),
});
