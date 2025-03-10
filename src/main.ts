import { app, BrowserWindow, ipcMain , dialog, ipcRenderer } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs, { FSWatcher } from 'node:fs';
import { processXml } from './xmlMonitor';
let watcher: FSWatcher | undefined = undefined;
let xmlPath: string | undefined = undefined;
let folderPath: string | undefined = undefined;
let configPath: string | undefined = undefined;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }


  // Get path for config file 
  const userDataPath = app.getPath("userData");
  configPath = path.join(userDataPath, 'config.json');

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ xmlPath: '', folderPath: '' }));
    console.log(`Created config file at ${configPath}`);
  }
   
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    xmlPath = config.xmlPath;
    folderPath = config.folderPath;
  }

  // On Renderer loaded
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('file-selected', { xmlPath });
    mainWindow.webContents.send('folder-selected', { folderPath });
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  ipcMain.on("start-monitor", (event, args) => {
    xmlPath = args.xmlPath;
    folderPath = args.folderPath;
    processXml(xmlPath, folderPath);
    watcher = fs.watch(args.xmlPath, {
      encoding: 'buffer',
    }, (eventType, filename) => {
      console.log(`Event type is: ${eventType}`);
      if (filename) {
        console.log(`filename provided: ${filename}`);
        try {
          processXml(xmlPath, folderPath);
          console.log(`Processed XML: ${xmlPath}`);
        } catch (err) { 
          console.log(`Error processing XML: ${err}`);
        }
        
      } else {
        console.log('filename not provided');
      }
    });
  });


  ipcMain.on("select-file", async (event, args) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'XML Files', extensions: ['xml'] },
        ]
      });
      if (!result.canceled) {
        console.log(`Setting xmlPath to ${result.filePaths[0]}`);
        xmlPath = result.filePaths[0];
        fs.writeFileSync(configPath, JSON.stringify({ xmlPath, folderPath}));
        mainWindow.webContents.send('file-selected', { xmlPath: xmlPath });
        return result.filePaths[0];
      }
    } catch (err) {
      console.log(err);
    }
  });

  ipcMain.on("select-folder", (event, args) => {
    dialog.showOpenDialog({
      properties: ['openDirectory'],
    }).then((result) => {
      if (!result.canceled) {
        folderPath = result.filePaths[0];
        console.log(`Setting folderPath to ${folderPath}`);
        fs.writeFileSync(configPath, JSON.stringify({ xmlPath, folderPath}));
        mainWindow.webContents.send('folder-selected', { folderPath: folderPath });
      }
    }).catch((err) => {
      console.log(err);
    });
  });

  ipcMain.on("stop-monitor", (event, args) => {
    console.log("Stopping monitor...");
    if (watcher) {
      watcher.close();
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
