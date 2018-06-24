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
	public async postCanExport(t: Token, hash: number) {
		return this.postData(this.hostname + '/products/canExport', { hash }, t)
		       .then((response) => response.json());
	}
	public async postExportPNG(t: Token, hash: number, res: { width: number, height: number, offsetX: number, offsetY: number }, pattern: number) {
		console.log('EXPORINT RES', res);
		return this.postData(this.hostname + '/products/convert/png', { hash, res, pattern }, t)
		       .then((response) => response.json());
	}
}
