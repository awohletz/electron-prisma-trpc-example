import {IElectronAPI, IpcRequest} from "../api";
import {contextBridge, ipcRenderer} from "electron";

const api: IElectronAPI = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    trpc: (req: IpcRequest) => ipcRenderer.invoke('trpc', req),
    receive: (channel: string, func: Function) => {
        const validChannels = ["app"];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.removeAllListeners(channel);
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
};
contextBridge.exposeInMainWorld('appApi', api)
