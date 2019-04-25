export interface IState {
  code: string;
  name: string;
}
export interface ICountry {
  code: string;
  name: string;
  states: IState[] | null;
}
export interface ICartAddressReviver {
  name: string | null;
  address: string | null;
  country: string | null;
  postalCode: string | null;
  city: string | null;
  state: string | null;
}
export class CartAddress {
  public name: string | null;
  public country: string | null;
  public address: string | null;
  public postalCode: string | null;
  public city: string | null;
  public state: string | null;
  public countries: ICountry[];
  public states: IState[] | null;
  constructor() {
    this.name = null;
    this.country = "PT";
    this.address = null;
    this.postalCode = null;
    this.city = null;
    this.state = null;
    this.countries = [];
    this.states = null;
  }
  public toJSON(): ICartAddressReviver {
    return {
      name: this.name,
      country: this.country,
      address: this.address,
      postalCode: this.postalCode,
      city: this.city,
      state: this.state
    };
  }
  public static revive(r: ICartAddressReviver): CartAddress {
    const revived = new CartAddress();
    revived.name = r.name;
    revived.country = r.country;
    revived.address = r.address;
    revived.postalCode = r.postalCode;
    revived.city = r.city;
    revived.state = r.state;
    return revived;
  }
}
