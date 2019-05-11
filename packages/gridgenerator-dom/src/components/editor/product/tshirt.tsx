import { linkEvent } from "inferno";
import { TShirtColor, TShirtSize, TShirtType } from "gridgenerator-data";
import { Button } from "../../base/buttons";
import { MockTShirtCenter } from "./mock_center";
export interface ITShirtProps {
  className?: string;
  onTypeChange: (newType: TShirtType) => void;
  onSizeChange: (newSize: TShirtSize) => void;
  onArtSizeChange: (e: Event) => void;
  onColorChange: (newSize: TShirtColor) => void;
  onAddToCart: () => void;
  tshirtType: TShirtType;
  tshirtSize: TShirtSize;
  tshirtColor: TShirtColor;
  tshirtDeltaX: number;
  tshirtDeltaY: number;
  tshirtPreviewW: number;
  tshirtPreviewH: number;
  artSize: number;
  svg: string;
  svgViewbox: [number, number, number, number];
  price: number;
}
// preview={`<circle cx="50" cy="50" r="40" stroke-width="8" stroke="red" fill="red"/>`}
export const TShirt = (props: ITShirtProps) => (
  <section className={`TShirt flex ${props.className || ""}`}>
    <div className="mock flex flex-column items-center justify-center">
      <MockTShirtCenter
        preview={props.svg}
        previewH={props.tshirtPreviewH}
        previewW={props.tshirtPreviewW}
        previewX={props.tshirtDeltaX}
        previewY={props.tshirtDeltaY}
        viewBox={props.svgViewbox.join(" ")}
        className="w4 h4 w5-ns h5-ns pa4 pb0"
      />
      <h2 className="f7 pa0 ma0">Art Size</h2>
      <input
        className="w3 w4-ns"
        type="range"
        min="0"
        max="1"
        step="0.01"
        defaultValue={`${props.artSize}`}
        onChange={props.onArtSizeChange}
      />
    </div>
    <div className="info">
      <h2 className="f7">Chose Format</h2>
      <div className="flex flex-column items-start justify-start gray">
        <a
          onClick={linkEvent(TShirtType.Unisex, props.onTypeChange)}
          className={`f7 link dim ttu dark-gray mh2 pointer ${
            props.tshirtType === TShirtType.Unisex ? "b underline" : ""
          }`}
        >
          Unisex
        </a>
        <a
          onClick={linkEvent(TShirtType.Man, props.onTypeChange)}
          className={`f7 link dim ttu dark-gray mh2 pointer ${
            props.tshirtType === TShirtType.Man ? "b underline" : ""
          }`}
        >
          Man
        </a>
        <a
          onClick={linkEvent(TShirtType.Woman, props.onTypeChange)}
          className={`f7 link dim ttu dark-gray mh2 pointer ${
            props.tshirtType === TShirtType.Woman ? "b underline" : ""
          }`}
        >
          Woman
        </a>
      </div>
      <h2 className="mt3 mb0 f7">Chose Size</h2>
      <div className="flex items-start justify-start flex-wrap gray">
        <a
          onClick={linkEvent(TShirtSize.S, props.onSizeChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtSize === TShirtSize.S
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          S
        </a>
        <a
          onClick={linkEvent(TShirtSize.M, props.onSizeChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtSize === TShirtSize.M
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          M
        </a>
        <a
          onClick={linkEvent(TShirtSize.L, props.onSizeChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtSize === TShirtSize.L
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          L
        </a>
        <a
          onClick={linkEvent(TShirtSize.XL, props.onSizeChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtSize === TShirtSize.XL
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          XL
        </a>
      </div>
      <h2 className="mt3 mb0 f7">Chose Color</h2>
      <div className="flex items-start justify-start flex-wrap gray">
        <a
          onClick={linkEvent(TShirtColor.White, props.onColorChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtColor === TShirtColor.White
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
          style={{ background: TShirtColor.White }}
        />
        <a
          onClick={linkEvent(TShirtColor.Black, props.onColorChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtColor === TShirtColor.Black
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
          style={{ background: TShirtColor.Black }}
        />
        <a
          onClick={linkEvent(TShirtColor.HeatherGray, props.onColorChange)}
          className={`flex items-center justify-center mt2 mr2 w1 h1 w2-ns h2-ns ba pa2 f7 link dim ttu dark-gray pointer ${
            props.tshirtColor === TShirtColor.HeatherGray
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
          style={{ background: TShirtColor.HeatherGray }}
        />
      </div>
      <h2 className="mt3 mb0 f7">Price</h2>
      <p className="ma0 pa0 f3 ttu b orange">€{props.price}</p>
      <Button
        id={"tshirt add"}
        className="mt4 mb2"
        label="Add to cart"
        onAction={props.onAddToCart}
      />
    </div>
  </section>
);
