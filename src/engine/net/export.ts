import { IProjectExport } from '../../data';
import { Token } from './token';

export class NetExport {
	public hostname: string;
	private readonly postData: (url: string, data: object, token?: Token) => Promise<any>;
	private readonly getData: (url: string) => Promise<any>;
	constructor(hostname: string, get: (url: string) => Promise<any>, post: (url: string, data: object) => Promise<any>) {
		this.hostname = hostname;
		this.postData = post;
		this.getData = get;
	}
	public async postExportPayment(t: Token, payment: any, data: IProjectExport) {
		return this.postData(this.hostname + '/products/export', { payment, data }, t)
		       .then((response) => response.json());
	}
}
