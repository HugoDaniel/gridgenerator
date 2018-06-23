import countries_url from '../../assets/data/countries.json';
import { Token } from './token';

export class NetProduct {
	public hostname: string;
	private readonly postData: (url: string, data: object, token?: Token) => Promise<any>;
	private readonly getData: (url: string) => Promise<any>;
	constructor(hostname: string, get: (url: string) => Promise<any>, post: (url: string, data: object) => Promise<any>) {
		this.hostname = hostname;
		this.postData = post;
		this.getData = get;
	}
	public async getCountryLst() {
		return this.getData(this.hostname + countries_url)
		       .then((response) => response.json());
	}
}
