import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["./src/TraktorZ1MK2.ts"],
    format: "esm",
    target: "es2020",
    outputOptions: {
      dir: undefined,
      file: "dist/Traktor-Z1-MK2.script.js",
    },
  },
  {
    entry: ["./src/TraktorX1MK3.ts"],
    format: "esm",
    target: "es2020",
    outputOptions: {
      dir: undefined,
      file: "dist/Traktor-X1-MK3.script.js",
    },
  },
]);
