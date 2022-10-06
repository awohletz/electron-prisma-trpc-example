## Purpose
This repo demonstrates:
- Using tRPC over IPC to communicate between the main and renderer processes.
- Using Prisma with an SQLite database.
- Building, signing, notarizing, and publishing an Electron app with electron-builder.

electron-prisma-trpc-example intends to provide a clean proof-of-concept that you can pick-and-choose from and integrate into your own Electron app.

This is the next generation of https://github.com/awohletz/electron-prisma-template, trimmed down and updated for the latest Electron and other dependencies.

## Getting started
1. Clone this repo. Then in the project root directory, do the following:
2. Run `npm install`.
4. Edit electron-builder.yml to fill in productName, appId, copyright, and publisherName.
5. Follow the instructions in https://www.electron.build/code-signing to set up code signing certificates for your platform.
5. Edit package.json to fill in your project details. Set the `repository` property to a Github repo where you will publish releases. When you run `npm run dist`, the app will be packaged and published to the Github repo.
   1. Create a Github repo for your app releases. See https://www.electron.build/configuration/publish#githuboptions
   2. Create an access token for your Github repo. See https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
6. Create a `.env` file that looks like this:
```
# If you are signing and notarizing the app on Mac
APPLE_ID=your apple id
APPLE_ID_PASSWORD=your apple password
APPLE_TEAM_ID=your apple team ID
# If you want to publish releases to Github
GITHUB_TOKEN=your github access token
```
5. Now you can run `npm start` to start in dev mode and check out the example app. If you want to test building and publishing a release, see the below sections.

## Scripts
### `npm run build` 
Builds the project code and places it in `dist`. There are two steps to building: 
  1. Use Vite to transpile the frontend TypeScript code in `src/client` and move it to `dist`. 
  2. Use the TypeScript compiler (`tsc`) to 1. check types in `src/client` (Vite does not check types) and 2. build the backend TypeScript code in `src/server` and place the output in `dist/server`.

### `npm start` 
Build and start the app without packaging.

### `npm run pack`
Build, pack, sign, and notarize the app for the current platform. The packed app will be output to `packed` directory. This is a fast way to test packing, signing, and notarizing. It does not publish the app to Github.

Once packed, you can test the outputted app in the `packed` directory. E.g. on Mac M1, open `packed/mac-arm64` in Finder and double-click on ElectronPrismaTrpcExample to run the app.

### `npm run dist`
Build, pack, sign, and notarize the app for production. The only difference between `npm run dist` and `npm run publish` is that `npm run dist` does not publish the app to Github.

### `npm run publish`
Build, pack, sign, notarize, and publish the app. Run this to publish a release to Github. The app will be published to the Github repo specified in `package.json`.


## tRPC usage
The tRPC integration allows Renderer to communicate to Main and get responses back. From tRPC's perspective, the Renderer is a client and the Main process is a server. It does not know that it is communicating over IPC.

In `src/client/renderer.ts` I've provided a custom `fetch` implementation to tRPC client to send the requests over IPC. 

In `src/server/main.ts`, `ipcMain` listens for those IPC requests and fowards them to the tRPC server. To enable this, I built a `ipcRequestHandler` function, which is a customized version of [tRPC's fetchRequestHandler](https://trpc.io/docs/v10/fetch). Instead of sending fetch API Request and Response objects, which cannot be serialized over IPC, it sends plain JSON objects and converts them to Response objects in the Renderer code.

## Prisma usage
electron-prisma-trpc-example uses Prisma to manage the SQLite database. To enable this, I had to leave the Prisma binaries out of app.asar. They do not work when packed inside app.asar. To leave them out, I specified them as excluded files in electron-builder.yml and as extraResources. Then I pass the query engine and migration engine paths from extraResources into the Prisma client constructor and the Prisma migrate command.  

To create a universal build on Mac M1 and Mac Intel, the build and install scripts pack both sets of Prisma binaries. 

## Signing, notarizing, and publishing
The `electron-builder.yml` file has configuration to sign and notarize the app for Mac, Windows, and Linux. You'll have to customize this file to enter your own publisher and app info.

See https://github.com/awohletz/electron-prisma-trpc-example-releases for an example repo that holds the releases for this app. I publish releases to that repo using the `npm run publish` script.
