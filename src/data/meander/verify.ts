export enum VerifyingState { Verifying = 100, Success, AlreadyVerified, Failed }
export class MeanderVerify {
	public state: VerifyingState;
	public user: string | null;
	constructor() {
		this.state = VerifyingState.Verifying;
		this.user = null;
	}
}
