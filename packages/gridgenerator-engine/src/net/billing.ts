import { Token } from "./token";

export class NetBilling {
  private readonly hostname: string;
  private readonly postData: (
    url: string,
    data: object,
    token?: Token
  ) => Promise<any>;
  private readonly getData: (url: string, token?: Token) => Promise<any>;
  constructor(
    hostname: string,
    doGet: (url: string, token?: Token) => Promise<any>,
    doPost: (url: string, data: object, token?: Token) => Promise<any>
  ) {
    this.postData = doPost;
    this.getData = doGet;
    this.hostname = hostname;
  }
  public getClientToken(t: Token) {
    return this.postData(this.hostname + "/payments/token", {}, t).then(
      response => response.text()
    );
  }
  public getBillingData(t: Token) {
    return this.getData(this.hostname + "/payments/billingInfo", t);
  }
  public postNonce(
    t: Token,
    nonce: any,
    paymentType: string,
    billingInfo: any
  ) {
    return this.postData(
      this.hostname + "/payments/checkout",
      { nonce, paymentType, billingInfo },
      t
    ).then(response => response.json());
  }
  public getInvoiceHistory(t: Token) {
    return this.getData(this.hostname + "/payments/invoiceHistory", t).then(
      response => response.json()
    );
  }
}
