import {defineConfig} from "umi";

export default defineConfig({
  routes: [
    {path: "/", component: "index"},
  ],
  alias: {
    "@": "./example",
  },
  mfsu: {
    exclude:['manny']
  },
  npmClient: 'npm',
  cacheDirectoryPath: '/node_modules/.cache',
});
