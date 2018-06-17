const {
  FuseBox,
  Sparky,
  EnvPlugin,
  CSSPlugin,
  CopyPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box');
const { src, task, exec, context } = require("fuse-box/sparky");
const transformInferno = require('ts-transform-inferno').default;
const transformClasscat = require('ts-transform-classcat').default;
let fuse;

context(class {
  getConfig() {
      return FuseBox.init({
        homeDir: 'src',
        hash: this.isProduction,
        output: 'dist/$name.js',
        experimentalFeatures: true,
        cache: !this.isProduction,
        sourceMaps: !this.isProduction,
        transformers: {
          before: [ transformInferno({ classwrap: true }) ],
        },
        plugins: [
          EnvPlugin({
            NODE_ENV: this.isProduction ? 'production' : 'development',
            HOST: this.isProduction
              ? 'https://gridgenerator.com'
              : 'https://localhost:8080'
          }),
          CSSPlugin(),
          CopyPlugin({ files: ['*.svg', '*.png']}),
          WebIndexPlugin({
            title: 'Grid Generator',
            template: 'src/index.html'
          }),
          this.isProduction &&
          QuantumPlugin({
            bakeApiIntoBundle: 'client',
            treeshake: true,
            uglify: true
          })
        ]
      });
  }
})
const options = {

};
const clientOptions = {
  ...options,
  plugins: [

  ]
}

Sparky.task('config', _ => {
  fuse = FuseBox.init(options);
  fuse.dev();
});
Sparky.task('clean', _ => Sparky.src('dist/').clean('dist/').exec());
Sparky.task("client", () => {
  fuse.options = clientOptions;
  fuse
     .bundle('client')
     .target('browser@es6')
     .watch('**')
     .hmr()
     .instructions('>main.tsx');
});
Sparky.task('dev', ['clean', 'config', 'client'], _ => {
  return fuse.run();
});
Sparky.task('prod', ['clean', 'config'], _ => {
  return fuse.run();
});
Sparky.task('staging', ['clean', 'stage', 'config'], _ => {
  return fuse.run();
});
