import { NetBilling } from "./net/billing";
import { NetExport } from "./net/export";
import { NetLogin } from "./net/login";
import { NetProduct } from "./net/product";
import { NetProfile } from "./net/profile";
import { NetPublish } from "./net/publish";
import { Token } from "./net/token";

export interface IGraphQLResponse {
  errors?: Array<{
    message: string;
    locations: Array<{ line: number; column: number }>;
  }>;
  data?: any;
}
export class Net {
  public login: NetLogin;
  public profile: NetProfile;
  public publish: NetPublish;
  public billing: NetBilling;
  public product: NetProduct;
  public export: NetExport;
  public readonly hostname: string;
  public graphql: (queryStr: string, token?: Token) => Promise<any>;
  public postData: (url: string, data: object, token?: Token) => Promise<any>;
  public getData: (url: string, token?: Token) => Promise<any>;
  constructor() {
    // @ts-ignore
    this.hostname = process.env.HOST; // from fuse-box EnvPlugin (in fuse.js)
    this.graphql = (queryStr, token) => {
      return new Promise((resolve, reject) =>
        this.httpData("/graphql/", { query: queryStr }, "POST", token).then(
          response => {
            if (response.ok) {
              resolve(response.json());
            } else if (response.status === 401) {
              // unauthorized, reject with 'Unauthorized';
              reject("Unauthorized");
            } else {
              response.json().then(msg => reject(Net.graphqlErrorMsg(msg)));
            }
          },
          reject
        )
      );
    };
    this.postData = (url, data, token) => {
      return this.httpData(url, data, "POST", token);
    };
    this.getData = (url, token) => {
      return this.httpData(url, null, "GET", token);
    };
    this.login = new NetLogin(this.hostname, this.getData, this.postData);
    this.profile = new NetProfile(this.hostname, this.graphql, this.getData);
    this.publish = new NetPublish(this.hostname, this.graphql, this.postData);
    this.billing = new NetBilling(this.hostname, this.getData, this.postData);
    this.product = new NetProduct(this.hostname, this.getData, this.postData);
    this.export = new NetExport(this.hostname, this.getData, this.postData);
  }
  public static isUnauthorized(error) {
    return error === "Unauthorized";
  }
  public static graphqlErrorMsg(response: IGraphQLResponse): string {
    let result = "Ooops. There was an error. ";
    if (response.errors) {
      result += "Please contact us with these details: ";
      response.errors.map(error => {
        result += error.message;
        if (error.locations) {
          error.locations.map(
            l => (result += `[line: ${l.line}; col: ${l.column}]`)
          );
        }
      });
    }
    return result;
  }
  private httpData(url: string, data: any, method: string, token?: Token) {
    const headers = new Headers();
    headers.append("Content-type", "application/json");
    if (token) {
      headers.append("Authorization", `Bearer ${token.jwt}`);
    }
    // Default options are marked with *
    return fetch(url, {
      body: method !== "GET" ? JSON.stringify(data) : undefined, // must match 'Content-Type' header
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "include", // include, same-origin, *omit
      headers,
      method,
      // mode: 'cors', // no-cors, cors, *same-origin
      redirect: "follow", // *manual, follow, error
      referrer: "no-referrer" // *client, no-referrer
    });
  }
}
/*
		this.checkTokenExpiration = (msg) => {
			const checkExpiration = (e: { errors: Array<{ message: string }>}) => {
				return (e.errors.filter( (err) => err.message === 'jwt expired' ).length > 0);
			};
			if (msg.errors && isArray(msg.errors)) {
				return checkExpiration(msg);
			}
			return false;
		};
*/
