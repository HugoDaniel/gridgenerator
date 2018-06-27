import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as util from 'util';
import path = require('path');
import { FatActionSets, FatState, IProjectExport, State } from '../data';
const { createConverter } = require('convert-svg-to-png');
const converter = createConverter();

const exec = util.promisify(require('child_process').exec);

async function ffmpegToMP4(src, dest) {
	const cmd = `ffmpeg -y -framerate 7 -i ${src}/%04d.png -c:v libx264 -r 30 -pix_fmt yuv420p ${dest}`;
	const { stdout, stderr } = await exec(cmd);
}
async function ffmpegToGIF(src, dest) {
	const cmd = `ffmpeg -y -i ${src} -vf scale=300:-1 -gifflags +transdiff -y ${dest}`;
	const { stdout, stderr } = await exec(cmd);
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
async function convertAnimation(req): Promise<{ mp4: string, gif: string }> {
	// 1. TODO: Validate data in req
	const { width, height } = req.body.dimensions;
	const data: IProjectExport = req.body.data;
	const userId = req.body.userId;
	const mp4FileName = `${userId}_${req.body.hash}.mp4`;
	const gifFileName = `${userId}_${req.body.hash}.gif`;
	const mp4File = `${dir}/${mp4FileName}`;
	const gifFile = `${dir}/${gifFileName}`;
	// check if the files already exist
	if (fs.existsSync(mp4File) && fs.existsSync(gifFile)) {
		// dont need to process, just return the intended file
		return ({ mp4: mp4FileName, gif: gifFileName });
	}
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
	const pngFrames = [];
	for (let i = 0; i < frames.length; i++) {
		pngFrames.push(
			await converter.convert(frames[i])
		);
	}
	Promise.all(pngFrames.map((result, i) =>
		writePNG(`${partsDir}/${('0000' + i).substr(-4, 4)}.png`, result)
	)).then((files) => {
		// console.log('GOT FILES', files);
		ffmpegToMP4(partsDir, mp4File).then((_mp4) =>
			ffmpegToGIF(mp4File, gifFile).then((_gif) => {
				const result = { mp4: mp4FileName, gif: gifFileName };
				return result;
			})
		);
	}, (fail) => {
		throw new Error(fail);
	});
}
	/*

	*/
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
			const pngFileName = `${userId}_${width}x${height}_${req.body.hash}.png`;
			writePNG(`${dir}/${pngFileName}`, result).then((file) => {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({ file: pngFileName }));
				res.end();
			}, (error) => {
				console.log('ERROR IN FILE', error);
			});
		});
	});
	app.post('/convert/mp4', async function(req, res) {
		convertAnimation(req).then((result) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ file: result.mp4 }));
			res.end();
		}, (error) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ error }));
			res.end();
		});
	});
	app.post('/convert/gif', async function(req, res) {
		convertAnimation(req).then((result) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ file: result.gif }));
			res.end();
		}, (error) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ error }));
			res.end();
		});
	});
});

// Used to restart server by fuseBox
export async function shutdown() {
	server.close();
	server = undefined;
}
