import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./server/main.ts"],
  platform: "node",
  format: "esm",
  bundle: true,
  outfile: "./build/server/main.js",
  loader: {
    ".node": "file",
  },
});
