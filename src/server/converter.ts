import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as util from 'util';
import path = require('path');
import { FatActionSets, FatState, IProjectExport, State } from '../data';
const { createConverter } = require('convert-svg-to-png');
const converter = createConverter();

const exec = util.promisify(require('child_process').exec);

async function ffmpeg(src, dest) {
	const cmd = `ffmpeg -framerate 7 -i ${src}/%04d.png -c:v libx264 -r 30 -pix_fmt yuv420p ${dest}`;
	console.log('RUNNING CMD', cmd);
	const { stdout, stderr } = await exec(cmd);
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}
// Create a new express application instance
const app: express.Application = express();
// The port the express app will listen on
const port: number = parseInt(process.env.PORT, 10) || 3000;
const dir = './tmp';
const writePNG = (dest, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(dest, data, function(err) {
			if (err) {
				reject(err);
			}
			resolve(dest);
		});
	});
};

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/static', express.static(path.resolve(dir)));

const init = () => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
};
/*
const server = http.createServer((req, res) => {
        if (req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => {
                        body += chunk.toString(); // convert Buffer to string
                });
                req.on('end', () => {
                        // console.log(body);
                        converter.convert(body).then((result) => {
                                res.end(result, 'binary');
                        }, (fail) => console.log('FAIL', fail));
                });
        }
});
*/

// Serve the application at the given port
let server = app.listen(port, () => {
	init();
	// Success callback
	// tslint:disable-next-line:no-console
	console.log(`Listening at http://localhost:${port}/`);
	app.post('/convert/png', function(req, res) {
		// 1. TODO: Validate data in req
		const { width, height } = req.body.dimensions;
		const userId = req.body.userId;
		const svg = `
			<svg width="${width}" height="${height}" viewBox="${req.body.viewbox.join(' ')}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			${req.body.svg}
			</svg>`;
		converter.convert(svg).then((result) => {
			writePNG(`${dir}/${userId}_${width}x${height}_${req.body.hash}.png`, result).then((file) => {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({ file }));
				res.end();
			}, (error) => {
				console.log('ERROR IN FILE', error);
			});
		});
	});
	app.post('/convert/mp4', async function(req, res) {
		// 1. TODO: Validate data in req
		const { width, height } = req.body.dimensions;
		const data: IProjectExport = req.body.data;
		const userId = req.body.userId;
		// check if parts directory exists
		const partsDir = `${dir}/parts_${userId}_${req.body.hash}`;
		if (!fs.existsSync(partsDir)) {
			fs.mkdirSync(partsDir);
		}
		// revive the art state:
		const initialState = State.revive(JSON.parse(data.initialState));
		const fatState = FatState.revive(JSON.parse(data.fatState), initialState);
		// prepare the actions for the video
		const fas = new FatActionSets();
		const actions = fas.sitePlayerActions;
		fatState.restoreTo(0, State.revive(JSON.parse(data.initialState)));
		// create the SVG's for each frame:
		const frames = [];
		while (fatState.version !== fatState.maxVersion) {
			const { svg, viewbox } = fatState.current.createSVG();
			frames.push(`
			<svg width="${width}" height="${height}" viewBox="${viewbox.join(' ')}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			${svg}
			</svg>`);
			fatState.fastRestoreFwd(actions);
		}
		console.log('GOT FRAMES', frames.length);
		const pngFrames = [];
		for (let i = 0; i < frames.length; i++) {
			pngFrames.push(
				await converter.convert(frames[i])
			);
		}
		console.log('GOT PNGS', pngFrames.length);
		Promise.all(pngFrames.map((result, i) =>
			writePNG(`${partsDir}/${('0000' + i).substr(-4, 4)}.png`, result)
		)).then((files) => {
			// console.log('GOT FILES', files);
			ffmpeg(partsDir, `${dir}/${userId}_${req.body.hash}.mp4`).then((result) => {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({ file: `${userId}_${req.body.hash}.mp4` }));
				res.end();
			});
		});
	});
});

// Used to restart server by fuseBox
export async function shutdown() {
	server.close();
	server = undefined;
}
