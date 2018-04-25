export enum RecoverState { Idle = 100, Recovering, Success, Failed }
export class MeanderRecover {
	public state: RecoverState;
	public message: string | null;
	public error: string | null;
	constructor() {
		this.state = RecoverState.Idle;
		this.message = null;
		this.error = null;
	}
	get isLoading() {
		return this.state === RecoverState.Recovering;
	}
}
