export class Collective {
	public isLoading: boolean;
	public error: string | null;
	public success: string | null;
	public successTitle: string | null;
	public successEmail: string | null;
	constructor() {
		this.isLoading = false;
		this.error = null;
		this.success = null;
		this.successEmail = null;
	}
}
