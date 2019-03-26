import { ShaderBuffer } from '../../context';
import { HelpersGL } from './helpersgl';
import { Locations } from './locations';

export const enum AnimationDirection { Normal = 1, Reverse }
export class ShaderAnimation {
	public isRunning: boolean;
	private readonly duration: number;
	private revDuration: number;
	private startTime: number;
	private deltaTime: number;
	private currentTime: number;
	private runningTime: number;
	private runningFunction: FrameRequestCallback;
	private update: FrameRequestCallback;
	private runningId: number;
	public buffers: ShaderBuffer[];
	public readonly id: number;
	public direction: AnimationDirection;
	public maxDelay: number;
	private finished: boolean;
	public onEnd: ((runOnEnd: boolean) => void) | null;
	private reverseTime: ((dir: AnimationDirection, t: number, duration: number, revDur: number) => number);
	constructor(duration: number, id: number, reverseTime: ((dir: AnimationDirection, t: number, duration: number, revDur: number) => number)) {
		this.duration = duration;
		this.revDuration = duration;
		this.startTime = 0;
		this.deltaTime = 0;
		this.currentTime = 0;
		this.runningTime = 0;
		this.runningId = 0;
		this.isRunning = false;
		this.maxDelay = 0;
		this.finished = true;
		this.id = id;
		this.direction = AnimationDirection.Normal;
		this.onEnd = null;
		this.reverseTime = reverseTime;
		this.update = (t: number) => {
			this.play(t); // move the animation
			// check if the animation has finished
			let d = this.duration;
			if (this.direction === AnimationDirection.Reverse) {
				d = this.revDuration;
			}
			if (this.duration !== 0 && this.runningTime > (d + this.maxDelay)) {
				this.finish();
			} else {
				this.runningId = requestAnimationFrame(this.update);
				this.runningFunction(t);
			}
		};
	}
	public static linearRev = (dir: AnimationDirection, runningT: number, newDuration: number, oldDuration: number) => {
		// return duration - Math.min(runningT, duration);
		const param = Math.min(runningT, oldDuration) / oldDuration;
		return newDuration - param * newDuration;
	}
	public static AnimationVars =
	`
	uniform float      PI;
	uniform float      iTime;
	// uniform float      iTimeDelta;
	uniform float      iDuration;
	// uniform float      iAnimationId;
	uniform float      iAnimationDirection;
	attribute float    aShapeIndex;
	attribute float    aShapeDelay;
	attribute float    aShapeRevDelay;`;

	public static initBuffers(gl: WebGLRenderingContext, shapeIds: number[], delays: number[]) {
		// translate shapeIds into a buffer
		const shapeIdsBuffer = HelpersGL.buffer(gl, shapeIds, shapeIds.length, 1);
		// same for shapeDelays
		const shapeDelaysBuffer = HelpersGL.buffer(gl, delays, delays.length, 1);
		// same for shapeDelays
		const rev = delays.copyWithin(0, 0);
		const shapeRevDelaysBuffer = HelpersGL.buffer(gl, rev, rev.length, 1);
		return [shapeIdsBuffer, shapeDelaysBuffer, shapeRevDelaysBuffer];
	}
	public static Locations(gl: WebGLRenderingContext, p: WebGLProgram, loc: Locations): Locations {
		loc.locateUniform(gl, p, 'PI');
		loc.locateUniform(gl, p, 'iTime');
		// loc.locateUniform(gl, p, 'iTimeDelta');
		loc.locateUniform(gl, p, 'iDuration');
		// loc.locateUniform(gl, p, 'iAnimationId');
		loc.locateUniform(gl, p, 'iAnimationDirection');
		loc.locateAttrib(gl, p, 'aShapeIndex');
		loc.locateAttrib(gl, p, 'aShapeDelay');
		loc.locateAttrib(gl, p, 'aShapeRevDelay');
		return loc;
	}
	private setUniforms(gl: WebGLRenderingContext, loc: Locations) {
		loc.set1Uniform(gl, 'PI', Math.PI);
		loc.set1Uniform(gl, 'iTime', this.runningTime * 0.001);
		// loc.set1Uniform(gl, 'iTimeDelta', this.deltaTime * 0.001);
		// loc.set1Uniform(gl, 'iAnimationId', this.id);
		loc.set1Uniform(gl, 'iAnimationDirection', this.direction);
		loc.set1Uniform(gl, 'iDuration',
			this.direction === AnimationDirection.Normal
			? this.duration * 0.001
			: this.revDuration * 0.001);
	}
	private run(f: FrameRequestCallback) {
		if (!this.finished) {
			let dur = this.duration;
			let revDur = this.revDuration;
			if (this.direction === AnimationDirection.Reverse) {
				dur = this.revDuration;
				revDur = this.duration;
			}
			this.runningTime = this.reverseTime(this.direction, this.runningTime, dur, revDur);
		} else {
			this.runningTime = 0;
		}
		this.isRunning = true;
		this.finished = false;
		this.deltaTime = 0;
		this.runningFunction = f;
		this.startTime = performance.now();
		this.currentTime = performance.now();
		this.runningId  = requestAnimationFrame(this.update);
	}
	public start(f: FrameRequestCallback) {
		this.direction = AnimationDirection.Normal;
		this.run(f);
	}
	public startReverse(f: FrameRequestCallback) {
		this.direction = AnimationDirection.Reverse;
		this.run(f);
	}
	public play(t) {
			this.deltaTime = t - this.currentTime;
			this.currentTime = t;
			this.runningTime += this.deltaTime;
	}
	private finish() {
		this.finished = true;
		this.stop();
	}
	public stop(runOnEnd: boolean = true) {
		cancelAnimationFrame(this.runningId);
		this.startTime = 0;
		this.isRunning = false;
		if (this.finished) {
			this.runningTime = 0;
		}
		this.deltaTime = 0;
		this.currentTime = 0;
		if (this.onEnd) {
			this.onEnd(runOnEnd);
		}
	}
	public draw(gl: WebGLRenderingContext, loc: Locations, shapeIdsBuffer: ShaderBuffer, shapeDelaysBuffer: ShaderBuffer, shapeDelaysRevBuffer: ShaderBuffer) {
		this.setUniforms(gl, loc);
		gl.bindBuffer(gl.ARRAY_BUFFER, shapeIdsBuffer.buffer);
		gl.vertexAttribPointer(loc.attrib('aShapeIndex'),
			shapeIdsBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, shapeDelaysBuffer.buffer);
		gl.vertexAttribPointer(loc.attrib('aShapeDelay'),
			shapeDelaysBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, shapeDelaysRevBuffer.buffer);
		gl.vertexAttribPointer(loc.attrib('aShapeRevDelay'),
			shapeDelaysRevBuffer.itemSize, gl.FLOAT, false, 0, 0);
	}
}
