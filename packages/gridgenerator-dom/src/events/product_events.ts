import {
  Cart,
  CartAt,
  FatState,
  PosterType,
  ProductAt,
  ProjectMap,
  TShirtColor,
  TShirtSize,
  TShirtType
} from "gridgenerator-data";
import {
  IProductMovementDetail,
  Movement,
  Net,
  Runtime
} from "gridgenerator-engine";
import { IEventHandler } from "../common";
import { Refresher } from "./refresher";

export class ProductEvents implements IEventHandler {
  public runtime: Runtime;
  public state: FatState;
  public cart: Cart;
  public refresher: Refresher;
  public net: Net;
  public projects: ProjectMap;
  public onAddToCart: () => void;
  public onCartIncQty: (index: number) => void;
  public onCartDecQty: (index: number) => void;
  public onCartRemove: (index: number, e: Event) => void;
  public onChangeToTShirt: () => void;
  public onChangeToPoster: () => void;
  public onPosterTypeChange: (t: PosterType) => void;
  public onTShirtTypeChange: (t: TShirtType) => void;
  public onTShirtSizeChange: (s: TShirtSize) => void;
  public onArtSizeChange: (e: Event) => void;
  public onTShirtColorChange: (c: TShirtColor) => void;
  public onViewCart: () => void;
  public onChangeCountry: () => void;
  public onCheckoutCart: () => void;
  public onShippingAddressDone: () => void;
  public onConfirmationDone: () => void;
  public onProductInit: () => void;
  // event handler:
  public onMouseDown: (e: MouseEvent) => void;
  public onMouseMove: (e: MouseEvent) => void;
  public onMouseUp: (e: MouseEvent) => void;
  public onTouchStart: (e: TouchEvent) => void;
  public onTouchMove: (e: TouchEvent) => void;
  public onTouchEnd: (e: TouchEvent) => void;
  public onTouchCancel: (e: TouchEvent) => void;
  constructor(
    rt: Runtime,
    state: FatState,
    cart: Cart,
    net: Net,
    refresher: Refresher,
    proj: ProjectMap
  ) {
    this.runtime = rt;
    this.state = state;
    this.refresher = refresher;
    this.net = net;
    this.projects = proj;
    this.cart = cart;
    this.onChangeToTShirt = () => {
      this.cart.product.at = ProductAt.TShirt;
      this.cart.product.setPrice(this.cart.prices);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onChangeToPoster = () => {
      this.cart.product.at = ProductAt.Poster;
      this.cart.product.setPrice(this.cart.prices);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onArtSizeChange = (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (t) {
        const value = parseFloat(t.value);
        if (!isNaN(value)) {
          this.cart.product.artSize = value;
          this.cart.product.zoom(value);
          this.refresher.refreshCartOnly(this.cart);
          this.refresher.refreshDOMOnly();
        }
      }
    };
    this.onPosterTypeChange = (t: PosterType) => {
      this.cart.product.posterType = t;
      this.cart.product.setPrice(this.cart.prices);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onTShirtTypeChange = (t: TShirtType) => {
      this.cart.product.tshirtType = t;
      this.cart.product.setPrice(this.cart.prices);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onTShirtSizeChange = (s: TShirtSize) => {
      this.cart.product.tshirtSize = s;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onTShirtColorChange = (c: TShirtColor) => {
      this.cart.product.tshirtColor = c;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onViewCart = () => {
      this.cart.at = CartAt.InCart;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onCheckoutCart = () => {
      // fetch countries
      this.net.product.getCountryLst().then(
        v => {
          this.cart.at = CartAt.ShippingAddress;
          this.cart.address.countries = v.countries;
          this.refresher.refreshCartOnly(this.cart);
          this.refresher.refreshDOMOnly();
        },
        fail => {
          console.log("COULD NOT GET COUNTRIES", fail);
        }
      );
    };
    this.onChangeCountry = () => {
      const countryElem = document.getElementById(
        "address-country"
      ) as HTMLSelectElement;
      if (!countryElem) {
        // error
      } else {
        this.cart.address.country = countryElem.value;
        // get list of states
        this.cart.address.states = null;
        for (let i = 0; i < this.cart.address.countries.length; i++) {
          const c = this.cart.address.countries[i];
          if (c.code === countryElem.value && c.states !== null) {
            this.cart.address.states = c.states;
          }
        }
        this.refresher.refreshCartOnly(this.cart);
        this.refresher.refreshDOMOnly();
      }
    };
    this.onShippingAddressDone = () => {
      // update address
      const nameElem = document.getElementById(
        "address-name"
      ) as HTMLInputElement;
      if (!nameElem) {
        // error
      } else {
        this.cart.address.name = nameElem.value;
      }
      const countryElem = document.getElementById(
        "address-country"
      ) as HTMLSelectElement;
      if (!countryElem) {
        // error
      } else {
        this.cart.address.country = countryElem.value;
      }
      const stateElem = document.getElementById(
        "address-state"
      ) as HTMLSelectElement;
      if (!stateElem) {
        // error
      } else {
        this.cart.address.state = stateElem.value;
      }
      const addressElem = document.getElementById(
        "address-address"
      ) as HTMLInputElement;
      if (!addressElem) {
        // error
      } else {
        this.cart.address.address = addressElem.value;
      }
      const postalElem = document.getElementById(
        "address-postal"
      ) as HTMLInputElement;
      if (!postalElem) {
        // error
      } else {
        this.cart.address.postalCode = postalElem.value;
      }
      const cityElem = document.getElementById(
        "address-city"
      ) as HTMLInputElement;
      if (!cityElem) {
        // error
      } else {
        this.cart.address.city = cityElem.value;
      }
      // console.log(this.cart.address);
      // move on to confirmation
      this.cart.at = CartAt.Confirmation;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onConfirmationDone = () => {
      // TODO: Enter paypal
      this.cart.at = CartAt.Confirmation;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onProductInit = () => {
      // render the current project into svg
      const art = this.state.current.createSVG();
      // set it in the cart product
      this.cart.product.withArt(art);
      this.cart.product.init();
      this.cart.product.setPrice(this.cart.prices);
      this.cart.at = CartAt.Product;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onMouseDown = e => {
      this.onDown(e.clientX, e.clientY);
      return;
    };
    this.onMouseUp = e => {
      this.onUp();
      return;
    };
    this.onMouseMove = e => {
      this.onMove(e.clientX, e.clientY);
      return;
    };
    this.onTouchStart = e => {
      const t = e.touches.item(0);
      if (t) {
        this.onDown(t.clientX, t.clientY);
      }
      return;
    };
    this.onTouchMove = e => {
      const t = e.touches.item(0);
      if (t) {
        this.onMove(t.clientX, t.clientY);
      }
      return;
    };
    this.onTouchEnd = e => {
      this.onUp();
      return;
    };
    this.onTouchCancel = e => {
      this.onUp();
      return;
    };
    this.onAddToCart = () => {
      this.cart.addToCart();
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onCartIncQty = (index: number) => {
      this.cart.incQty(index);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onCartDecQty = (index: number) => {
      this.cart.decQty(index);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
    this.onCartRemove = (index: number, e: Event) => {
      e.preventDefault();
      this.cart.inside.splice(index, 1);
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    };
  }
  private onPosterDown(x: number, y: number) {
    let posterArea = this.runtime.rects.posterArea;
    if (!posterArea) {
      posterArea = this.runtime.rects.posterAreaRect();
    }
    if (this.runtime.rects.isInside(x, y, posterArea)) {
      // set the poster art movement starting point
      const detail = {
        startDeltaX: this.cart.product.posterDeltaX,
        startDeltaY: this.cart.product.posterDeltaY
      };
      if (this.runtime.movement) {
        this.runtime.movement.start(x, y);
        this.runtime.movement.setDetail(detail);
      } else {
        this.runtime.movement = new Movement(x, y, true, detail);
      }
      this.refresher.refreshRuntimeOnly(this.runtime);
    }
  }
  private onTShirtDown(x: number, y: number) {
    let tshirtArea = this.runtime.rects.tshirtArea;
    if (!tshirtArea) {
      tshirtArea = this.runtime.rects.tshirtAreaRect();
    }
    if (this.runtime.rects.isInside(x, y, tshirtArea)) {
      // set the tshirt art movement starting point
      const detail = {
        startDeltaX: this.cart.product.tshirtDeltaX,
        startDeltaY: this.cart.product.tshirtDeltaY
      };
      if (this.runtime.movement) {
        this.runtime.movement.start(x, y);
        this.runtime.movement.setDetail(detail);
      } else {
        this.runtime.movement = new Movement(x, y, true, detail);
      }
      this.refresher.refreshRuntimeOnly(this.runtime);
    }
  }
  private onDown(x: number, y: number) {
    if (this.cart.at === CartAt.Product) {
      if (this.cart.product.at === ProductAt.TShirt) {
        this.onTShirtDown(x, y);
      } else {
        this.onPosterDown(x, y);
      }
    }
  }
  private onPosterMove(
    deltaX: number,
    deltaY: number,
    d: IProductMovementDetail
  ) {
    if (
      deltaX !== this.cart.product.posterDeltaX ||
      deltaY !== this.cart.product.posterDeltaY
    ) {
      this.cart.product.posterDeltaX = d.startDeltaX + deltaX;
      this.cart.product.posterDeltaY = d.startDeltaY + deltaY;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    }
  }
  private onTShirtMove(
    deltaX: number,
    deltaY: number,
    d: IProductMovementDetail
  ) {
    if (
      deltaX !== this.cart.product.tshirtDeltaX ||
      deltaY !== this.cart.product.tshirtDeltaY
    ) {
      this.cart.product.tshirtDeltaX = d.startDeltaX + deltaX;
      this.cart.product.tshirtDeltaY = d.startDeltaY + deltaY;
      this.refresher.refreshCartOnly(this.cart);
      this.refresher.refreshDOMOnly();
    }
  }
  private onMove(x: number, y: number) {
    if (
      !this.runtime.movement ||
      !this.runtime.movement.isMoving ||
      !this.runtime.movement.detail
    ) {
      return;
    }
    const deltaX = x - this.runtime.movement.startX;
    const deltaY = y - this.runtime.movement.startY;
    if (this.cart.product.at === ProductAt.TShirt) {
      this.onTShirtMove(deltaX, deltaY, this.runtime.movement
        .detail as IProductMovementDetail);
    } else {
      this.onPosterMove(deltaX, deltaY, this.runtime.movement
        .detail as IProductMovementDetail);
    }
  }
  private onUp() {
    // unset the tshirt art movement starting point
    if (this.runtime.movement) {
      this.runtime.movement.end();
      this.refresher.refreshRuntimeOnly(this.runtime);
    }
  }
}
