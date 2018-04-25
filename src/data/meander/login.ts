export class MeanderLogin {
	public isLoading: boolean;
	public error: string | null;
	public success: string | null;
	public successTitle: string | null;
	public successEmail: string | null;
	public showRecover: boolean;
	constructor() {
		this.isLoading = false;
		this.error = null;
		this.success = null;
		this.successEmail = null;
		this.showRecover = false;
	}
}
