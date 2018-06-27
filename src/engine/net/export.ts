import { IProjectExport } from '../../data';
import { Token } from './token';

export class NetExport {
	public hostname: string;
	private readonly postData: (url: string, data: object, token?: Token) => Promise<any>;
	private readonly getData: (url: string, token?: Token) => Promise<any>;
	constructor(hostname: string, get: (url: string, token?: Token) => Promise<any>, post: (url: string, data: object) => Promise<any>) {
		this.hostname = hostname;
		this.postData = post;
		this.getData = get;
	}
	public async getExportFile(t: Token, file: string) {
		const headers = new Headers();
		headers.append('Authorization', `Bearer ${t.jwt}`);
		fetch('/products/exported/' + file, {
			credentials: 'include', // include, same-origin, *omit
			headers
		}).then((response) => {
			console.log('GOT RESPONSE', response);
			response.blob().then((blob) => {
				const url = window.URL.createObjectURL(blob);
				console.log('GOT URL');
				const a = document.createElement('a');
				document.body.appendChild(a);
				a.style = 'display: none';
				a.href = url;
				a.download = '';
				a.click();
			})
			/*
			const blob = new Blob([response], {type: 'video/mp4'});
			console.log('GOT BLOB');
			// const downloadUrl = URL.createObjectURL(response);
			console.log('GOT URL', url);
			const a = document.createElement('a');
			document.body.appendChild(a);
			a.style = 'display: none';
			a.href = url;
			a.download = '';
			a.click();
			*/
		});
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
		return this.postData(this.hostname + '/products/convert/png', { hash, res, pattern }, t)
		       .then((response) => response.json());
	}
	public async postExportMP4(t: Token, hash: number, res: { width: number, height: number, offsetX: number, offsetY: number }) {
		return this.postData(this.hostname + '/products/convert/mp4', { hash, res }, t)
					.then((response) => response.json());
	}
}
