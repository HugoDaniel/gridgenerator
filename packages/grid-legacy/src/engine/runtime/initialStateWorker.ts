import { State } from '../../data';
/** Keeps a copy of the initial state in a WebWorker for fast deep copy retrieval  */
export class InitialStateWorker {
	private worker: Worker;
	constructor() {
		const workerCode = new Blob([`
		let initialState = null;
		onmessage = function(e) {
			if (e.data === 'GET') {
				self.postMessage({ initialState });
			} else {
				// set the initial state
				initialState = e.data.initialState;
			}
		}
		`], {type: 'text/javascript'});
		this.worker = new Worker(window.URL.createObjectURL(workerCode));
	}
	public setInitialState(s: Readonly<State>) {
		this.worker.postMessage({ initialState: s.toJSON() });
	}
	public getInitialState(): Promise<State> {
		return new Promise((resolve, reject) => {
			this.worker.onmessage = null;
			this.worker.onmessage = (e) => {
				if (e.data.initialState) {
					resolve(State.revive(e.data.initialState));
				} else {
					reject('Could not find initialState');
				}
			};
			this.worker.postMessage('GET');
		});
	}
}
