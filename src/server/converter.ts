import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as util from 'util';
import path = require('path');
import { FatActionSets, FatState, IProjectExport, State } from '../data';
const { createConverter } = require('convert-svg-to-png');
const converter = createConverter();

const exec = util.promisify(require('child_process').exec);

async function ffmpegToMP4(src: string, dest: string, maxDim: number, isWidthBiggest: boolean) {
	let scale = '-vf scale='; // 640:-2';
	if (isWidthBiggest) {
		scale += `${maxDim}:-2`;
	} else {
		scale += `-2:${maxDim}`;
	}
	const cmd = `ffmpeg -y -framerate 7 -i ${src}/%04d.png -c:v libx264 -r 30 -pix_fmt yuv420p ${scale} ${dest}`;
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
const publishDir = `${dir}/published`;
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
async function convertMp4(work, w, h, dest): Promise<{ mp4: string}> {
	const data = work;
	const mp4FileName = `${dest}/${work.id}.mp4`;
	// console.log('CONVERTING MP4 TO', mp4FileName);
	// check if parts directory exists
	const partsDir = `${dir}/${work.id}_parts_lowres`;
	if (!fs.existsSync(partsDir)) {
		fs.mkdirSync(partsDir);
	}
	// revive the art state:
	// console.log('PARSING INITIAL STATE');
	const initialState = State.revive(data.initialState);
	// console.log('PARSING fat STATE');
	const fatState = FatState.revive(data.fatState, initialState);
	// console.log('3 parsed state', fatState.version, fatState.maxVersion);
	// prepare the actions for the video
	const fas = new FatActionSets();
	const actions = fas.sitePlayerActions;
	fatState.restoreTo(0, State.revive(data.initialState));
	// console.log('4 restored state', fatState.version, fatState.maxVersion);
	// create the SVG's for each frame:
	const frames = [];
	while (fatState.version !== fatState.maxVersion) {
		const { svg, viewbox } = fatState.current.createSVG();
		frames.push(`
		<svg width="${w}" height="${h}" viewBox="${viewbox.join(' ')}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			${svg}
		</svg>`);
		fatState.fastRestoreFwd(actions);
	}
	// console.log('5 got ' + frames.length + ' frames');
	const pngFrames = [];
	for (let i = 0; i < frames.length; i++) {
		const frame = await converter.convert(frames[i]);
		pngFrames.push( frame );
	}
	// console.log('6 converted frames to PNG', pngFrames.length);
	const files = await pngFrames.map((pngData, i) =>
		writePNG(`${partsDir}/${('0000' + i).substr(-4, 4)}.png`, pngData)
	);
	// console.log('7 wrote PNG frames to DISK');
	// console.log('GOT FILES', files);
	// prepare for video creation:
	let maxDim = w;
	let isWidthBiggest = true;
	if (w < h) {
		maxDim = h;
		isWidthBiggest = false;
	}
	await ffmpegToMP4(partsDir, mp4FileName, maxDim, isWidthBiggest);
	const result = { mp4: mp4FileName };
	// console.log('8 Called FFMPEG', result);
	return result;
}
async function convertAnimation(req): Promise<{ mp4: string, gif: string }> {
	// 1. TODO: Validate data in req
	const { width, height } = req.body.dimensions;
	const data: IProjectExport = req.body.data;
	const userId = req.body.userId;
	const mp4FileName = `${userId}_${req.body.hash}.mp4`;
	const gifFileName = `${userId}_${req.body.hash}.gif`;
	const mp4File = `${dir}/${mp4FileName}`;
	const gifFile = `${dir}/${gifFileName}`;
	console.log('1 Convertin animation');
	// check if the files already exist
	if (fs.existsSync(mp4File) && fs.existsSync(gifFile)) {
		// dont need to process, just return the intended file
		console.log('EXISTS');
		return ({ mp4: mp4FileName, gif: gifFileName });
	}
	// check if parts directory exists
	const partsDir = `${dir}/parts_${userId}_${req.body.hash}`;
	if (!fs.existsSync(partsDir)) {
		fs.mkdirSync(partsDir);
	}
	console.log('2 tmp dir created');
	// revive the art state:
	const initialState = State.revive(JSON.parse(data.initialState));
	const fatState = FatState.revive(JSON.parse(data.fatState), initialState);
	console.log('3 parsed state', fatState.version, fatState.maxVersion);
	// prepare the actions for the video
	const fas = new FatActionSets();
	const actions = fas.sitePlayerActions;
	fatState.restoreTo(0, State.revive(JSON.parse(data.initialState)));
	console.log('4 restored state', fatState.version, fatState.maxVersion);
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
	console.log('5 got ' + frames.length + ' frames');
	const pngFrames = [];
	for (let i = 0; i < frames.length; i++) {
		const frame = await converter.convert(frames[i]);
		pngFrames.push( frame );
	}
	console.log('6 converted frames to PNG', pngFrames.length);
	const files = await pngFrames.map((result, i) =>
		writePNG(`${partsDir}/${('0000' + i).substr(-4, 4)}.png`, result)
	);
	console.log('7 wrote PNG frames to DISK');
	// console.log('GOT FILES', files);
	// prepare info for video creation:
	let maxDim = width;
	let isWidthBiggest = true;
	if (width < height) {
		maxDim = height;
		isWidthBiggest = false;
	}
	await ffmpegToMP4(partsDir, mp4File, maxDim, isWidthBiggest);
	await ffmpegToGIF(mp4File, gifFile);
	const result = { mp4: mp4FileName, gif: gifFileName };
	console.log('8 Called FFMPEG', result);
	return result;
}
function convertImage(destFile, w, h, svgBody, viewbox) {
	let svgviewbox;
	if (viewbox.length === 4) {
		svgviewbox = viewbox;
	} else {
		svgviewbox = [0, 0, viewbox[0], viewbox[1]];
	}
	console.log(`CONVERTING WITH ${w}*${h}, and viewbox`, svgviewbox);
	const svg = `
		<svg width="${w}" height="${h}" viewBox="${svgviewbox.join(' ')}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
			${svgBody}
		</svg>`;
	return new Promise((resolve, reject) => {
		converter.convert(svg).then((result) => {
			writePNG(destFile, result).then((file) => {
				resolve(result);
			}, (error) => {
				reject({ error, in: 'writePNG'});
			});
		}, (error) => {
			reject({ error, in: 'convertImage'});
		});
	});
}
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json({limit: '256mb'}));
app.use('/static', express.static(path.resolve(dir)));

const init = () => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	if (!fs.existsSync(publishDir)) {
		fs.mkdirSync(publishDir);
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
			console.log('9 GOT MP4', result);
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
	app.post('/convert/publish', async function(req, res) {
		let w = req.body.width;
		let h = req.body.height;
		const workId = req.body.id;
		console.log('PUBLISHING WORK', workId);
		// 1. create a 800xh PNG
		convertImage(`${publishDir}/${workId}.png`, w, h, req.body.svg, req.body.svgviewbox).then(
			(imgData) => {
				// image done, prepare the low res MP4
				w = Math.ceil(w / 1.5);
				h = Math.ceil(h / 1.5);
				try {
				convertMp4(req.body, w, h, publishDir).then((mp4Response) => {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify(mp4Response));
					res.end();
				}, (mp4Error) => {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({ error: mp4Error, at: 'mp4' }));
					res.end();
				});
			} catch(e) {
				console.log('GOT MP4 CONVERT ERROR', e);
			}
			}, (imgError) => {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({ error: imgError, at: 'png' }));
				res.end();
			}
		);
		// 2. create a 640xh MP4
		// 3. respond with ok and url's
		/*
		convertAnimation(req).then((result) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ file: result.gif }));
			res.end();
		}, (error) => {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({ error }));
			res.end();
		});
		*/
	});
});

// Used to restart server by fuseBox
export async function shutdown() {
	server.close();
	server = undefined;
}
