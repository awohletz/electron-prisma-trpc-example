import {IElectronAPI, IpcRequest} from "../api";
import {contextBridge, ipcRenderer} from "electron";

const api: IElectronAPI = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    trpc: (req: IpcRequest) => ipcRenderer.invoke('trpc', req),
};
contextBridge.exposeInMainWorld('appApi', api)
