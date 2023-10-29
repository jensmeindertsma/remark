import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./server/main.ts"],
  platform: "node",
  format: "esm",
  outfile: "./build/server/main.js",
});
