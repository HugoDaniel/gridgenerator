require("dotenv").config();
const {
  FuseBox,
  Sparky,
  EnvPlugin,
  CSSPlugin,
  CopyPlugin,
  WebIndexPlugin,
  QuantumPlugin
} = require("fuse-box");
const transformInferno = require("ts-transform-inferno").default;

let fuse;
let isProduction = false;

// we can change the target when making a seperate bundle
let target = "browser@es6";

// bundle name needs to be changed too (as we are making an isolate build and
// and we need to bundle the API into it
const baseName = "gridgenerator-main";
let bundleName = baseName;

let instructions = "> main.tsx";

Sparky.task("config", () => {
  fuse = FuseBox.init({
    homeDir: "src",
    globals: { default: "*" }, // we need to expore index in our bundles
    target: target,
    output: "dist/$name.js",
    cache: !isProduction,
    hash: isProduction,
    transformers: {
      before: [transformInferno({ classwrap: true })]
    },
    sourceMaps: true,
    plugins: [
      EnvPlugin({
        PAYPAL_ENV: process.env.PAYPAL_ENV,
        PAYPAL_CLIENTID: process.env.PAYPAL_CLIENTID,
        NODE_ENV: isProduction ? "production" : "development",
        HOST: isProduction
          ? "https://gridgenerator.com"
          : "https://localhost:8080"
      }),
      CSSPlugin(),
      CopyPlugin({ files: ["*.svg", "*.png", "countries.json"] }),
      WebIndexPlugin({
        title: "Grid Generator",
        template: "src/app.html"
      }),
      isProduction &&
        QuantumPlugin({
          containedAPI: true,
          ensureES5: false,
          uglify: false,
          treeshake: true,
          bakeApiIntoBundle: bundleName
        })
    ]
  });
  bundle = fuse.bundle(bundleName).instructions(instructions);
});

Sparky.task("clean", () => {
  return Sparky.src("dist/").clean("dist/");
});

Sparky.task("copy-src", () =>
  Sparky.src("./**", { base: "./src" }).dest("dist/")
);
Sparky.task("copy-pkg", () => Sparky.src("./package.json").dest("dist/"));

Sparky.task("dev", ["clean", "config"], async () => {
  bundleName = `${baseName}.dev`;
  fuse
    .bundle("client/bundle")
    .target("browser@esnext")
    .watch("**")
    .hmr()
    .instructions(">main.tsx");
  fuse.dev({
    proxy: {
      "/auth/google": {
        target: "http://localhost:3333/",
        changeOrigin: false
      }
    }
  });
  await fuse.run();
});

Sparky.task("dist-min", async () => {
  isProduction = true;
  bundleName = `${baseName}.min`;
  await Sparky.resolve("config");
  await fuse.run();
});

Sparky.task("dist", ["clean", "copy-src", "copy-pkg", "dist-min"], () => {});

// Development
Sparky.task("default", ["dev", "config"], () => {
  fuse.run();
});
