import {createTRPCProxyClient, httpBatchLink} from '@trpc/client';
import type {AppRouter} from "../server/router";
import {IpcRequest} from "../api";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',

      // custom fetch implementation that sends the request over IPC to Main process
      fetch: async (input, init) => {
        const req: IpcRequest = {
          url: input instanceof URL ? input.toString() : typeof input === 'string' ? input : input.url,
          method: input instanceof Request ? input.method : init?.method!,
          headers: input instanceof Request ? input.headers : init?.headers!,
          body: input instanceof Request ? input.body : init?.body!,
        };

        console.log("Sending request to Main process", req);
        const resp = await window.appApi.trpc(req);
        console.log("Got response from Main process", resp);

        return new Response(resp.body, {
          status: resp.status,
          headers: resp.headers,
        });
      }
    }),
  ],
});

const information = document.getElementById('info');

if (information) {
  information.innerText = `This app is using Chrome (v${window.appApi.chrome()}), Node.js (v${window.appApi.node()}), and Electron (v${window.appApi.electron()})`;
}

const loadUsers = async () => {
  const user = await trpc.users.query();
  const userId1 = await trpc.userById.query(1);
  const resp = document.getElementById('resp');
  if (resp) {
    resp.innerText = JSON.stringify(user, null, 2);
  }
}

loadUsers();

const addUser = async () => {
  const user = await trpc.userCreate.mutate('New User');
  const resp = document.getElementById('resp');
  if (resp) {
    resp.innerText = JSON.stringify(user, null, 2);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('add-user');
  if (btn) {
    btn.addEventListener('click', addUser);
  }
});
