import {appRouter} from "./router";
import {app, BrowserWindow, ipcMain, protocol} from 'electron';
import path from "path";
import {ipcRequestHandler} from "./ipcRequestHandler";
import {IpcRequest} from "../api";
import fs from "fs";
import {dbPath, dbUrl, isDev, latestMigration, Migration} from "./constants";
import log from "electron-log";
import {prisma, runPrismaCommand} from "./prisma";
import {MenuBuilder} from "./menu";

const createWindow = async () => {

  let needsMigration;
  const dbExists = fs.existsSync(dbPath);
  if (!dbExists) {
    needsMigration = true;
    // prisma for whatever reason has trouble if the database file does not exist yet.
    // So just touch it here
    fs.closeSync(fs.openSync(dbPath, 'w'));
  } else {
    try {
      const latest: Migration[] = await prisma.$queryRaw`select * from _prisma_migrations order by finished_at`;
      needsMigration = latest[latest.length-1]?.migration_name !== latestMigration;
    } catch (e) {
      log.error(e);
      needsMigration = true;
    }
  }

  if (needsMigration) {
    try {
      const schemaPath = path.join(
        app.getAppPath().replace('app.asar', 'app.asar.unpacked'),
        'prisma',
        "schema.prisma"
      );
      log.info(`Needs a migration. Running prisma migrate with schema path ${schemaPath}`);

      // first create or migrate the database! If you were deploying prisma to a cloud service, this migrate deploy
      // command you would run as part of your CI/CD deployment. Since this is an electron app, it just needs
      // to run every time the production app is started. That way if the user updates the app and the schema has
      // changed, it will transparently migrate their DB.
      await runPrismaCommand({
        command: ["migrate", "deploy", "--schema", schemaPath],
        dbUrl
      });
      log.info("Migration done.")

      // seed
      // log.info("Seeding...");
      // await seed(prisma);

    } catch (e) {
      log.error(e);
      process.exit(1);
    }
  } else {
    log.info("Does not need migration");
  }

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

  const menuBuilder = MenuBuilder(win, app.name);
  menuBuilder.buildMenu();

  if (isDev) {
    // in dev mode, load the vite dev server
    await win.loadURL("http://localhost:5173");
  } else {
    await win.loadFile(path.join(__dirname, '..', 'index.html'));
  }
  win.webContents.openDevTools()
};

app.whenReady().then(() => {
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
