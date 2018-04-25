import { Token } from './token';

interface EmailAuth {
	j: string;
	c: string;
}
export class NetLogin {
	public hostname: string;
	private readonly postData: (url: string, data: object, token?: Token) => Promise<any>;
	private readonly getData: (url: string) => Promise<any>;
	constructor(hostname: string, get: (url: string) => Promise<any>, post: (url: string, data: object) => Promise<any>) {
		this.hostname = hostname;
		this.postData = post;
		this.getData = get;
	}
	public async verifyEmail(searchLink: string) {
		return this.getData(this.hostname + '/auth/verify' + searchLink)
		       .then((response) => response.json());
	}
	public async recover(uname: string) {
		const d = { j: uname };
		return this.postData(this.hostname + '/auth/email/recover', d)
		.then((response) => response.json());
	}
	public async resetPassword(newPass: string, searchLink: string) {
		const d = { c: newPass };
		return this.postData(this.hostname + '/auth/email/recover' + searchLink, d)
		.then((response) => response.json());
	}
	public async emailRegister(uname: string, p: string) {
		const d: EmailAuth = {
			j: uname,
			c: p
		};
		return this.postData(this.hostname + '/auth/email/create', d)
		.then((response) => response.json());
	}
	public async emailLogin(uname: string, p: string) {
		const d: EmailAuth = {
			j: uname,
			c: p
		};
		return this.postData(this.hostname + '/auth/email/login', d)
		.then((response) => response.json());
	}
}
