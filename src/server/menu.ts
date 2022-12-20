import {BrowserWindow, Menu, shell} from "electron";
import log from "electron-log";
import {sendToRenderer} from "./util";

const isMac = process.platform === "darwin";

export const MenuBuilder = function (mainWindow: BrowserWindow, appName: string) {
  // https://electronjs.org/docs/api/menu#main-process
  const defaultTemplate = function () {
    return [
      ...(isMac
        ? [
          {
            label: appName,
            submenu: [
              {
                role: "about",
                label: "About",
                click: async () => {
                  sendToRenderer(mainWindow.webContents, {
                    action: "about"
                  });
                }
              },
              {
                type: "separator"
              },
              {
                role: "services",
                label: "Services"
              },
              {
                type: "separator"
              },
              {
                role: "hide",
                label: "Hide"
              },
              {
                role: "hideothers",
                label: "Hide Others"
              },
              {
                role: "unhide",
                label: "Unhide"
              },
              {
                type: "separator"
              },
              {
                role: "quit",
                label: "Quit"
              }
            ]
          }
        ]
        : []),
      {
        label: "File",
        submenu: [
          {
            label: "View logs",
            click: async () => {
              shell.showItemInFolder(log.transports.file.findLogPath());
            }
          },
          {
            type: "separator"
          },

          isMac
            ? {
              role: "close",
              label: "Quit"
            }
            : {
              role: "quit",
              label: "Exit"
            },

        ]
      },
      {
        label: "Edit",
        submenu: [
          {
              role: "undo",
              label: "Undo"
          },
          {
              role: "redo",
              label: "Redo"
          },
          {
              type: "separator"
          },
          {
            role: "cut",
            label: "Cut"
          },
          {
            role: "copy",
            label: "Copy"
          },
          {
            role: "paste",
            label: "Paste"
          },
          ...(isMac
            ? [
              {
                role: "pasteAndMatchStyle",
                label: "Paste and Match Style"
              },
              {
                role: "delete",
                label: "Delete"
              },
              {
                role: "selectAll",
                label: "Select All"
              },
              {
                type: "separator"
              },
              {
                label: "Speech",
                submenu: [
                  {
                    role: "startspeaking",
                    label: "Start Speaking"
                  },
                  {
                    role: "stopspeaking",
                    label: "Stop Speaking"
                  }
                ]
              }
            ]
            : [
              {
                role: "delete",
                label: "Delete"
              },
              {
                type: "separator"
              },
              {
                role: "selectAll",
                label: "Select All"
              }
            ])
        ]
      },
      // { role: "viewMenu" }
      {
        label: "View",
        submenu: [
          {
            role: "reload",
            label: "Reload"
          },
          {
            role: "forcereload",
            label: "Force Reload"
          },
          {
            role: "toggledevtools",
            label: "Toggle Developer Tools"
          },
          {
            type: "separator"
          },
          {
            role: "resetzoom",
            label: "Reset Zoom"
          },
          {
            role: "zoomin",
            label: "Zoom In"
          },
          {
            role: "zoomout",
            label: "Zoom Out"
          },
          {
            type: "separator"
          },
          {
            role: "togglefullscreen",
            label: "Toggle Fullscreen"
          }]
      },
      {
        label: "Window",
        submenu: [
          {
            role: "minimize",
            label: "Minimize"
          },
          ...(isMac
            ? [
              {
                type: "separator"
              },
              {
                role: "front",
                label: "Front"
              },
              {
                type: "separator"
              },
              {
                role: "window",
                label: "Window"
              }
            ]
            : [
              {
                role: "close",
                label: "Close"
              }
            ])
        ]
      },
      {
        role: "help",
        label: "Help",
        submenu: [
          {
            label: "Help",
            click: async () => {
              sendToRenderer(mainWindow.webContents, {
                action: "help",
              });
            }
          },
          {
            label: "About",
            click: async () => {
              sendToRenderer(mainWindow.webContents, {
                action: "about"
              });
            }
          },
        ]
      }
    ];
  };

  return {
    buildMenu: function () {
      const menu = Menu.buildFromTemplate(defaultTemplate() as any);
      Menu.setApplicationMenu(menu);

      return menu;
    }
  };
};

