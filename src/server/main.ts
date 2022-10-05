import {appRouter} from "./router";
import {app, BrowserWindow, ipcMain, protocol} from 'electron';
import path from "path";
import {ipcRequestHandler} from "./ipcRequestHandler";
import {IpcRequest} from "../api";

const createWindow = () => {

  // The Vite build of the client code uses src URLs like "/assets/main.1234.js" and we need to
  // intercept those requests and serve the files from the dist folder.
  protocol.interceptFileProtocol("file", (request, callback) => {
    const parsedUrl = path.parse(request.url);

    if (parsedUrl.dir.includes("assets")) {
      const webAssetPath = path.join(__dirname, "..", "assets", parsedUrl.base);
      callback({path: webAssetPath})
    } else {
      callback({url: request.url});
    }
  });

  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('trpc', (event, req: IpcRequest) => {
    return ipcRequestHandler({
      endpoint: "/trpc",
      req,
      router: appRouter,
      createContext: async () => {
        return {};
      }
    });
  })

  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.openDevTools()
};

app.whenReady().then(() => {
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
