const {
  FuseBox,
  Sparky,
  EnvPlugin,
  CSSPlugin,
  CopyPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box');
const transformInferno = require('ts-transform-inferno').default;
const transformClasscat = require('ts-transform-classcat').default;
let fuse, app;
let isProduction = false;
let isStaging = false;

Sparky.task('config', _ => {
  fuse = new FuseBox({
    homeDir: 'src',
    hash: isProduction || isStaging,
    output: 'dist/$name.js',
    experimentalFeatures: true,
    cache: !isProduction,
    sourceMaps: !isProduction || isStaging,
    transformers: {
      before: [ transformInferno({ classwrap: true }) ],
    },
    plugins: [
      EnvPlugin({
				NODE_ENV: isProduction ? 'production' : isStaging ? 'staging' : 'development',
				HOST: isProduction ? 'https://gridgenerator.com'
				    : isStaging ? 'https://dev.gridgenerator.com'
				    : 'https://localhost:8080'
			}),
      CSSPlugin(),
      CopyPlugin({ files: ['*.svg', '*.png']}),
      WebIndexPlugin({
        title: 'Grid Generator',
        template: 'src/index.html',
      }),
      (isProduction || isStaging) &&
      QuantumPlugin({
        bakeApiIntoBundle: 'app',
        treeshake: true,
        uglify: true
      }),
    ],
  });
  app = fuse.bundle('app').instructions('>main.tsx');
});
Sparky.task('clean', _ => Sparky.src('dist/').clean('dist/'));
Sparky.task('env', _ => (isProduction = true));
Sparky.task('stage', _ => (isStaging = true));
Sparky.task('dev', ['clean', 'config'], _ => {
  fuse.dev({
  		socketURI: "ws://localhost:4444",
//		  httpOnly: false
	});
  app.hmr().watch();
  return fuse.run();
});
Sparky.task('prod', ['clean', 'env', 'config'], _ => {
  return fuse.run();
});
Sparky.task('staging', ['clean', 'stage', 'config'], _ => {
  return fuse.run();
});
