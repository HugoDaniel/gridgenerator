import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import path = require('path');
const { createConverter } = require('convert-svg-to-png');
const converter = createConverter();

// Create a new express application instance
const app: express.Application = express();
// The port the express app will listen on
const port: number = parseInt(process.env.PORT, 10) || 3000;
const dir = './tmp';
const writePNG = (fname, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(`${dir}/${fname}.png`, data, function(err) {
			if (err) {
				reject(err);
			}
			resolve(`${dir}/${fname}.png`);
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
			console.log('writing file', `${userId}_${width}x${height}_${req.body.hash}`);
			writePNG(`${userId}_${width}x${height}_${req.body.hash}`, result).then((file) => {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({ file }));
				res.end();
			}, (error) => {
				console.log('ERROR IN FILE', error);
			});
		});
	});
});

// Used to restart server by fuseBox
export async function shutdown() {
	server.close();
	server = undefined;
}
