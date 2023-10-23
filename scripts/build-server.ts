import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./server/main.ts"],
  platform: "node",
  bundle: true,
  outfile: "./build/server/main.js",
});
