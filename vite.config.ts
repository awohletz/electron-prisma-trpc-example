import {defineConfig} from "vite";

export default defineConfig({
  build: {
    // sourcemaps have to be inline due to https://github.com/electron/electron/issues/22996
    sourcemap: "inline",
  },
});
