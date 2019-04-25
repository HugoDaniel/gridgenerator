import { CartAddress } from "./cart/address";
import { CartProduct, ProductAt } from "./cart/product";
export enum CartAt {
  Product = 100,
  InCart,
  ShippingAddress,
  Confirmation
}
export interface IPrices {
  tshirtMan: number;
  tshirtWoman: number;
  tshirtUnisex: number;
  posterA1: number;
  posterA2: number;
  posterA3: number;
}
export class Cart {
  public at: CartAt;
  public product: CartProduct;
  public prices: IPrices;
  public inside: CartProduct[];
  public address: CartAddress;
  constructor() {
    this.at = CartAt.Product;
    this.product = new CartProduct();
    this.inside = [];
    this.prices = {
      tshirtMan: 30,
      tshirtWoman: 30,
      tshirtUnisex: 35,
      posterA1: 15,
      posterA2: 10,
      posterA3: 8
    };
    this.address = new CartAddress();
  }
  /**
   * Adds the current product to cart, places it in the "inside" array attribute
   * Goes to Cart after putting the product inside.
   */
  public addToCart() {
    this.inside.push(this.product);
    this.product = new CartProduct();
    this.at = CartAt.InCart;
  }
  public incQty(index: number) {
    this.inside[index].quantity++;
  }
  public decQty(index: number) {
    this.inside[index].quantity--;
  }
}
