// @ts-ignore
import frame_icon from "../../../assets/icons/product-frame.svg";
// @ts-ignore
import shirt_icon from "../../../assets/icons/product-shirt.svg";
import { Cart, CartAt, ProductAt } from "gridgenerator-data";
import { ProductEvents } from "../../events/product_events";
import { Button } from "../base/buttons";
import { Input } from "../base/form";
import { InCartProduct } from "./product/in_cart_product";
import { Poster } from "./product/poster";
import { TotalPrice } from "./product/total";
import { TShirt } from "./product/tshirt";
export interface IProductProps {
  className?: string;
  events: ProductEvents;
  data: Cart;
  height?: number;
  onExit: () => void;
}
function selectProductComponent(props: IProductProps) {
  switch (props.data.product.at) {
    case ProductAt.Poster:
      return (
        <Poster
          posterType={props.data.product.posterType}
          posterDeltaX={props.data.product.posterDeltaX}
          posterDeltaY={props.data.product.posterDeltaY}
          posterPreviewH={props.data.product.posterPreviewH}
          posterPreviewW={props.data.product.posterPreviewW}
          onAddToCart={props.events.onAddToCart}
          onArtSizeChange={props.events.onArtSizeChange}
          onTypeChange={props.events.onPosterTypeChange}
          artSize={props.data.product.artSize}
          svg={props.data.product.artSVG || ""}
          svgViewbox={props.data.product.artViewbox || [0, 0, 0, 0]}
          price={props.data.product.price}
        />
      );
    default:
      return (
        <TShirt
          price={props.data.product.price}
          onTypeChange={props.events.onTShirtTypeChange}
          onSizeChange={props.events.onTShirtSizeChange}
          onArtSizeChange={props.events.onArtSizeChange}
          onColorChange={props.events.onTShirtColorChange}
          onAddToCart={props.events.onAddToCart}
          tshirtType={props.data.product.tshirtType}
          tshirtSize={props.data.product.tshirtSize}
          tshirtColor={props.data.product.tshirtColor}
          tshirtDeltaX={props.data.product.tshirtDeltaX}
          tshirtDeltaY={props.data.product.tshirtDeltaY}
          tshirtPreviewH={props.data.product.tshirtPreviewH}
          tshirtPreviewW={props.data.product.tshirtPreviewW}
          artSize={props.data.product.artSize}
          svg={props.data.product.artSVG || ""}
          svgViewbox={props.data.product.artViewbox || [0, 0, 0, 0]}
        />
      );
  }
}
function renderAddress(props: IProductProps) {
  const inputcx = "input-reset f6 ba b--black-20 br1 pa2 mb2 ml2 db w5";
  const labelcx = "f6 b pa2 db tl";
  return (
    <div
      style={{ height: props.height }}
      className={`ProductEditor ${props.className || ""}
			flex justify-center items-center editormw editor-shadow sans-serif h-100`}
    >
      <section className="w-100 flex flex-column items-center justify-center">
        <h2 className="">Shipping Address</h2>
        <div className="form">
          <label className={labelcx}>Name</label>
          <Input
            className={inputcx}
            type="text"
            name="address-name"
            id="address-name"
            required
            value={props.data.address ? props.data.address.name : ""}
          />
          <label className={labelcx}>Country</label>
          <select
            className={inputcx}
            id="address-country"
            onChange={props.events.onChangeCountry}
          >
            {props.data.address.countries.map(c => (
              <option
                value={c.code}
                selected={c.code === props.data.address.country}
              >
                {c.name}
              </option>
            ))}
          </select>
          <label className={labelcx}>
            Address{" "}
            <span className="f6 gray">
              (Street, house number, building number, apt...)
            </span>
          </label>
          <Input
            className={inputcx}
            type="text"
            name="address-address"
            id="address-address"
            required
            value={props.data.address ? props.data.address.address : ""}
          />
          <div className="flex">
            <div>
              <label className={labelcx}>Postal Code</label>
              <Input
                className={inputcx}
                type="text"
                name="address-postal"
                id="address-postal"
                required
                value={props.data.address ? props.data.address.postalCode : ""}
              />
            </div>
            <div>
              <label className={labelcx}>City</label>
              <Input
                className={inputcx}
                type="text"
                name="address-city"
                id="address-city"
                required
                value={props.data.address ? props.data.address.city : ""}
              />
            </div>
          </div>
          <label className={labelcx}>State / Province / Region</label>
          {props.data.address.states ? (
            <select className={inputcx} id="address-state">
              {props.data.address.states.map(s => (
                <option
                  value={s.code}
                  selected={s.code === props.data.address.state}
                >
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <Input
              className={inputcx}
              type="text"
              name="address-state"
              id="address-state"
              required
              value={props.data.address ? props.data.address.state : ""}
            />
          )}
        </div>
        <hr className="mt4 w5 bb bw1 b--black-10" />
        <TotalPrice products={props.data.inside} />
        <div className="mt4 flex items-center justify-center">
          <Button
            className="mh2"
            bg="transparent"
            color="dark-gray"
            label="Cancel"
            onAction={props.onExit}
          />
          <Button
            id={props.data}
            className="mh2"
            label="Continue"
            onAction={props.events.onShippingAddressDone}
          />
        </div>
      </section>
    </div>
  );
}
function renderConfirmation(props: IProductProps) {
  return (
    <div
      style={{ height: props.height }}
      className={`ProductEditor ${props.className || ""}
			flex justify-center items-center editormw editor-shadow sans-serif h-100`}
    >
      <section className="w-100 flex flex-column items-center justify-center">
        <h2 className="">Confirm your order</h2>
        <hr className="mt4 w5 bb bw1 b--black-10" />
        <TotalPrice products={props.data.inside} />
        <div className="mt4 flex items-center justify-center">
          <Button
            className="mh2"
            bg="transparent"
            color="dark-gray"
            label="Cancel"
            onAction={props.onExit}
          />
          <Button
            id={props.data}
            className="mh2"
            label="Checkout"
            onAction={props.events.onAddToCart}
          />
        </div>
      </section>
    </div>
  );
}
function buildProducts(props: IProductProps) {
  const result = props.data.inside.map((p, i) => (
    <InCartProduct key={i} index={i} product={p} events={props.events} />
  ));
  result.push(
    <Button
      className="mt3"
      bg="transparent"
      color="dark-gray"
      label="Add New Product"
      onAction={props.onExit}
    />
  );
  return result;
}
function renderCart(props: IProductProps) {
  return (
    <div
      style={{ height: props.height }}
      className={`ProductEditor ${props.className || ""}
		flex justify-center items-center editormw editor-shadow sans-serif h-100`}
    >
      <section className="w-100 flex flex-column items-center justify-center">
        <h2 className="">In Cart</h2>
        <nav>{buildProducts(props)}</nav>
        <hr className="mt4 w5 bb bw1 b--black-10" />
        <TotalPrice products={props.data.inside} />
        <div className="mt4 flex items-center justify-center">
          <Button
            className="mh2"
            bg="transparent"
            color="dark-gray"
            label="Cancel"
            onAction={props.onExit}
          />
          <Button
            id={props.data}
            className="mh2"
            label="Checkout"
            onAction={props.events.onCheckoutCart}
          />
        </div>
      </section>
    </div>
  );
}
function renderProduct(props: IProductProps) {
  return (
    <div
      style={{ height: props.height }}
      className={`ProductEditor ${props.className || ""}
		flex justify-center items-center editormw editor-shadow sans-serif h-100`}
    >
      <section className="w-100 flex flex-column items-center justify-center">
        <h2 className="">Bring it to life</h2>
        <div className="flex items-center justify-center gray">
          <a
            className={`pv2 ph4 ${
              props.data.product.at === ProductAt.Poster
                ? "z-1 br bl bt b--gray bg-white black bold"
                : "bg-transparent gray"
            } flex f6 link dim ttu pointer`}
            onClick={props.events.onChangeToPoster}
          >
            <img className="mr2 w1 h1" src={frame_icon} />
            Poster
          </a>
          <a
            className={`pv2 ph4 ${
              props.data.product.at === ProductAt.TShirt
                ? "z-1 br bl bt b--gray bg-white black bold"
                : "bg-transparent gray"
            } flex f6 link dim ttu pointer`}
            onClick={props.events.onChangeToTShirt}
          >
            <img className="mr2 w1 h1" src={shirt_icon} />
            T-Shirt
          </a>
        </div>
        <div
          className="bt b--gray bg-white w-100"
          style={{
            "box-shadow": "inset -5px 0 2px -1px #ccc",
            transform: "translateY(-1px)"
          }}
        >
          {selectProductComponent(props)}
        </div>
        <hr className="mt4 w5 bb bw1 b--black-10" />
        <TotalPrice products={props.data.inside} />
        {props.data.inside.length > 0 ? (
          <div className="mt4 flex items-center justify-center">
            <Button
              className="mh2"
              bg="transparent"
              color="dark-gray"
              label="Cancel"
              onAction={props.onExit}
            />
            <Button
              className="mh2"
              bg="transparent"
              color="dark-gray"
              label="View Cart"
              onAction={props.events.onViewCart}
            />
            <Button
              id={props.data}
              className="mh2"
              label="Checkout"
              onAction={props.events.onAddToCart}
            />
          </div>
        ) : (
          <div className="mt4 w5 flex items-center justify-center">
            <Button
              className="mh2"
              bg="transparent"
              color="dark-gray"
              label="Cancel"
              onAction={props.onExit}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export const Product = (props: IProductProps) => {
  switch (props.data.at) {
    case CartAt.Product:
      return renderProduct(props);
    case CartAt.InCart:
      return renderCart(props);
    case CartAt.ShippingAddress:
      return renderAddress(props);
    case CartAt.Confirmation:
      return renderConfirmation(props);
  }
};
