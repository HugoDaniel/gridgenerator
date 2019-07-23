// import { fusebox } from "fuse-box";
import fs from 'fs-extra';
import nunjucks from 'nunjucks';
import chokidar from 'chokidar';
import klaw from 'klaw';

const env = nunjucks.configure('.', { noCache: true });
env.addFilter('take', function (str, count) {
	return str.slice(0, count || 5);
});

const renderPage = (page: string) => {
	env.render(`./pages/${page}`, {}, function (err: string, data: string) {
		if (err) {
			console.log(err);
		} else {
			const dest = `build/${page.split('.')[0]}.html`;
			fs.writeFile(dest, data, (err) => {
				if (err) throw err;
				else
					console.log('Wrote ', dest)
			});
		}
	});
}

let isWatching = false;
const watch = () => {
	if (isWatching) return;
	isWatching = true;
	chokidar.watch('.', { ignored: 'build' }).on('change', (event, path) => {
		renderPages()
	});
}

fs.copy('assets', 'build/assets');
const renderPages = () => {
	klaw('pages').on('data', item => {
		if (!item.stats.isDirectory()) {
			renderPage(item.path.split('/').pop());
		}
	}).on('end', watch)
}

renderPages()


/*
const fuse = fusebox({
	target: "browser",
	entry: "src/index.ts",
	webIndex: {
		template: "build/index.html"
	},
	cache: {
		root: ".cache",
		enabled: false
	},
	watch: true,
	hmr: true,
	devServer: true,
	logging: { level: "succinct" }
});
fuse.runDev();
fs.writeFile('build/index.html', index, () => {
});
*/
