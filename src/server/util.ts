import {WebContents} from "electron";
import {AppAction} from "../api";

export function sendToRenderer(contents: WebContents, event: AppAction) {
  console.log("Sending to renderer ", event);
  contents.send("app", event);
}
