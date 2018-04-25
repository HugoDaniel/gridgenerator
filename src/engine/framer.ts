import { State } from '../data';
import { Runtime } from './runtime';
export class Framer {
	private currentFrame: Set<(rt: Runtime, state: State, t?: number) => void>;
	private nextFrame: Set<(rt: Runtime, state: State, t?: number) => void>;
	private runtime: Runtime;
	private state: State;
	private isFrameRequested: boolean;
	private runAnother: boolean;
	private frame: (t: number) => void;
	constructor() {
		this.currentFrame = new Set();
		this.nextFrame = new Set();
		this.isFrameRequested = false;
		this.runAnother = false;
		this.frame = (t) => {
			for (const action of this.currentFrame) {
				action(this.runtime, this.state, t);
			}
			this.isFrameRequested = false;
			if (this.runAnother) {
				this.runWith(this.runtime, this.state);
			}
		};
	}
	public action(f: (e: Runtime, s: State) => void) {
		this.nextFrame.add(f);
		// ^ replaces current f if already present
	}
	public runWith(e: Runtime, s: State): void {
		// update the env and state
		this.runtime = e;
		this.state = s;
		// lock
		if (this.isFrameRequested) {
			this.runAnother = true;
			return;
		} else {
			this.isFrameRequested = true;
			this.runAnother = false;
		}
		// switch current frame with next frame
		this.currentFrame.clear();
		const tmp = this.currentFrame;
		this.currentFrame = this.nextFrame;
		this.nextFrame = tmp;
		// run the frame
		requestAnimationFrame(this.frame);
	}
}
