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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static(path.resolve(dir)));

const init = function() {
	if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
	}
}();
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
	// Success callback
	// tslint:disable-next-line:no-console
	console.log(`Listening at http://localhost:${port}/`);
});

// Used to restart server by fuseBox
export async function shutdown() {
	server.close();
	server = undefined;
}
