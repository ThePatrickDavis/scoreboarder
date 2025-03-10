/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

declare global {
  interface Window {
    raceAPI: any;
  }
}


console.log('👋 This message is being logged by "renderer.ts", included via Vite');
const start: HTMLButtonElement = document.getElementById("startbtn") as HTMLButtonElement;
const stop = document.getElementById("stopbtn") as HTMLButtonElement;
const xmlPath = document.getElementById("xmlpath") as HTMLInputElement;
const folderPath = document.getElementById("outputfolder") as HTMLInputElement;
const selectFile = document.getElementById("selectfile") as HTMLButtonElement;
const selectFolder = document.getElementById("selectfolder")  as HTMLButtonElement;

stop.disabled = true;

function setDisabled(value: boolean) {
  start.disabled = value;
  stop.disabled = !value;
  selectFile.disabled = value;
  selectFolder.disabled = value;
  xmlPath.disabled = value;
  folderPath.disabled = value;
}

start.addEventListener("click", () => {
  setDisabled(true);
  window.raceAPI.startMonitor("start-monitor", { 
      xmlPath: xmlPath.value, 
      folderPath: folderPath.value,
   });
});

stop.addEventListener("click", () => {
  setDisabled(false);
  window.raceAPI.startMonitor("stop-monitor", { 
   });
});

selectFile.addEventListener("click", async () => {
  const result = await window.raceAPI.selectFile("select-file", { 
      xmlPath: xmlPath.value,
   });
   console.log(result);
});

selectFolder.addEventListener("click", () => {
  window.raceAPI.selectFile("select-folder", { 
      xmlPath: xmlPath.value,
   });
});

export function setXmlPath(path: string) {
  console.log('setXmlPath', path);
  xmlPath.value = path;
}

export function setFolderPath(path: string) {
  folderPath.value = path;
}

window.raceAPI.onFileSelected((value: any) => {

  console.log('onFileSelected', value);
  setXmlPath(value.xmlPath);
});

window.raceAPI.onFolderSelected((value: any) => {
  console.log(value);
  setFolderPath(value.folderPath);
});