import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "Traktor-Z1-MK2": "./src/TraktorZ1MK2.ts",
    "Traktor-X1-MK3": "./src/TraktorX1MK3.ts",
  },
  format: "esm",
  target: "es2020",
  outDir: "dist",
  outputOptions: {
    entryFileNames: "[name].script.js",
  },
});
