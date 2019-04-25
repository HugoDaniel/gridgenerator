import { IPrices } from "../cart";

export enum ProductAt {
  TShirt = 100,
  Poster
}
export enum PosterType {
  A1 = "A1",
  A2 = "A2",
  A3 = "A3"
}
export const PosterSizes = {
  A1: [59.4, 84.1],
  A2: [42, 59.4],
  A3: [29.7, 42]
};
export enum TShirtType {
  Man = "Man",
  Woman = "Woman",
  Unisex = "Unisex"
}
export enum TShirtSize {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL"
}
export enum TShirtColor {
  Black = "#25282B",
  White = "#FFFFFF",
  HeatherGray = "#ADBDBF"
}
export class CartProduct {
  public at: ProductAt;
  public quantity: number;
  public price: number;
  public artSVG: string | null;
  public artViewbox: [number, number, number, number] | null;
  private originalViewbox: [number, number, number, number] | null;
  public artSize: number;
  public tshirtType: TShirtType;
  public tshirtSize: TShirtSize;
  public tshirtColor: TShirtColor;
  public tshirtPreviewW: number;
  public tshirtPreviewH: number;
  // position/movement x,y:
  public tshirtDeltaX: number;
  public tshirtDeltaY: number;
  public posterDeltaX: number;
  public posterDeltaY: number;
  // poster:
  public posterType: PosterType;
  public posterPreviewW: number;
  public posterPreviewH: number;
  constructor() {
    this.at = ProductAt.TShirt;
    this.tshirtType = TShirtType.Unisex;
    this.tshirtSize = TShirtSize.M;
    this.tshirtColor = TShirtColor.White;
    this.tshirtDeltaX = 0;
    this.tshirtDeltaY = 0;
    this.tshirtPreviewH = 352;
    this.tshirtPreviewW = 264;
    this.artSize = 1;
    this.posterType = PosterType.A3;
    this.posterPreviewH = 500;
    this.posterPreviewW = 354;
    this.posterDeltaX = 0;
    this.posterDeltaY = 0;
    this.price = 0;
    this.quantity = 1;
  }
  public withArt(art: {
    svg: string;
    viewbox: [number, number, number, number];
  }) {
    this.artSVG = art.svg;
    this.artViewbox = art.viewbox;
    this.originalViewbox = art.viewbox.slice(0) as [
      number,
      number,
      number,
      number
    ];
  }
  public zoom(z: number) {
    if (this.originalViewbox && this.artViewbox) {
      const r = this.originalViewbox[3] / this.originalViewbox[4];
      const iz = 1.0 - z;
      const maxW = this.originalViewbox[2];
      const maxH = this.originalViewbox[3];
      const dw = iz * maxW * 2;
      const dh = iz * maxH * 2;
      const newvb = [-dw / 2, -dh / 2, maxW + dw, maxH + dh] as [
        number,
        number,
        number,
        number
      ];
      this.artViewbox = newvb;
      this.center();
    }
  }
  private center() {
    this.centerTShirt();
    this.centerPoster();
  }
  private centerRect(
    w: number,
    h: number
  ): { w: number; h: number; x: number; y: number } {
    if (!this.artViewbox || !this.artSVG) {
      this.tshirtDeltaX = 0;
      this.tshirtDeltaY = 0;
      return { w, h, x: 0, y: 0 };
    }
    const wt = w;
    const ht = h;
    const rt = w / h;
    const wi = this.artViewbox[2] + -1 * this.artViewbox[0];
    const hi = this.artViewbox[3] + -1 * this.artViewbox[1];
    const ri = wi / hi;
    let rectW = wt;
    let rectH = (hi * wt) / wi;
    if (rt > ri) {
      rectW = (wi * ht) / hi;
      rectH = ht;
    }
    return { y: (ht - rectH) / 2, x: (wt - rectW) / 2, w: rectW, h: rectH };
  }
  public productType() {
    switch (this.at) {
      case ProductAt.Poster:
        return "Poster";
      case ProductAt.TShirt:
        return "T-Shirt";
    }
  }
  private centerPoster() {
    const { w, h, x, y } = this.centerRect(354, 500);
    this.posterDeltaY = y;
    this.posterDeltaX = x;
    this.posterPreviewW = w;
    this.posterPreviewH = h;
  }
  private centerTShirt() {
    const { w, h, x, y } = this.centerRect(264, 352);
    this.tshirtDeltaY = y;
    this.tshirtDeltaX = x;
    this.tshirtPreviewW = w;
    this.tshirtPreviewH = h;
  }
  public setPrice(p: IPrices) {
    let price = 0;
    if (this.at === ProductAt.TShirt) {
      switch (this.tshirtType) {
        case TShirtType.Man:
          price = p.tshirtMan;
          break;
        case TShirtType.Woman:
          price = p.tshirtWoman;
          break;
        case TShirtType.Unisex:
          price = p.tshirtUnisex;
          break;
      }
    } else {
      switch (this.posterType) {
        case PosterType.A1:
          price = p.posterA1;
          break;
        case PosterType.A2:
          price = p.posterA2;
          break;
        case PosterType.A3:
          price = p.posterA3;
          break;
      }
    }
    this.price = price;
  }
  public init() {
    // calculate the deltaX and deltaY based on the viewbox
    // (to center the art on the t-shirt)
    this.center();
    this.artSize = 1;
  }
}
