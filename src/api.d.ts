export interface AboutMenuAction {
  action: "about";
}

export interface HelpMenuAction {
  action: "help";
}

export type AppAction = AboutMenuAction
  | HelpMenuAction;

export type IpcRequest = {
  body: any;
  headers: any;
  method: string;
  url: string;
};

export type IpcResponse = {
  body: any;
  headers: any;
  status: number;
}

export interface IElectronAPI {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  receive: (channel: "app", func: (event: AppAction) => void) => void;
  trpc: (req: IpcRequest) => Promise<IpcResponse>;
}

declare global {
  interface Window {
    appApi: IElectronAPI;
  }
}
