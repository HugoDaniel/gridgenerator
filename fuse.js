require('dotenv').config();
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
console.log(process.env);
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
            PAYPAL_ENV: process.env.PAYPAL_ENV,
            PAYPAL_CLIENTID: process.env.PAYPAL_CLIENTID,
            NODE_ENV: this.isProduction ? 'production' : 'development',
            HOST: this.isProduction
              ? 'https://gridgenerator.com'
              : 'https://localhost:8080'
          }),
          CSSPlugin(),
          CopyPlugin({ files: ['*.svg', '*.png', 'countries.json']}),
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
});

task('clean', _ => Sparky.src('dist/').clean('dist/').exec());
task('env', (ctx) => {
  ctx.isProduction = true;
});
task('client', async (ctx) => {
  const fuse = ctx.getConfig();
  fuse
     .bundle('client/bundle')
     .target('browser@esnext')
     .watch('**')
     .hmr()
     .instructions('>main.tsx');
  await fuse.run();
});
task('data', async (ctx) => {
  const fuse = ctx.getConfig();
  fuse
     .bundle('converter/data')
     .target('browser@esnext')
     .instructions('>data.ts');
  await fuse.run();
})
task('server', async (ctx) => {
  const fuse = ctx.getConfig();
  fuse
     .bundle('server/bundle')
     .watch('**')
     .target('server@esnext')
     .instructions('> [server/server.tsx]')
     .completed(proc => {
        proc.require({
           close: ({ FuseBox }) => FuseBox.import(FuseBox.mainFile).shutdown()
        });
     });
  await fuse.run();
});
task('converter', async (ctx) => {
  const fuse = ctx.getConfig();
  fuse
     .bundle('converter/index')
     .target('server@esnext')
     .instructions('> [server/converter.ts]')
     .completed(proc => {
        proc.require({
           close: ({ FuseBox }) => FuseBox.import(FuseBox.mainFile).shutdown()
        });
     });
  await fuse.run();
});
task('dev', ['clean', 'client', 'server'], async (ctx) => {
  const fuse = ctx.getConfig();
  fuse.dev({
    proxy: {
        '/auth/google': {
            target: 'http://localhost:3333/', 
            changeOrigin: false
            /*
            pathRewrite: {
                '^/api': '/', 
            },*/
        }
    }
  });
  await fuse.run();
});
task('prod', ['clean', 'env', 'client']);
