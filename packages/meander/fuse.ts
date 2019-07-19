// import { fusebox } from "fuse-box";
import nunjucks from "nunjucks-watch";

nunjucks.watch({
	src: './index.njk',
	dest: 'build/index.html'
})

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
