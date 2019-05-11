import { linkEvent } from "inferno";
import { IPrices, PosterSizes, PosterType } from "gridgenerator-data";
import { Button } from "../../base/buttons";
import { MockPosterCenter } from "./mock_center";
export interface IPosterProps {
  className?: string;
  onTypeChange: (newType: PosterType) => void;
  onArtSizeChange: (e: Event) => void;
  onAddToCart: () => void;
  posterType: PosterType;
  posterDeltaX: number;
  posterDeltaY: number;
  posterPreviewW: number;
  posterPreviewH: number;
  artSize: number;
  svg: string;
  svgViewbox: [number, number, number, number];
  price: number;
}
export const Poster = (props: IPosterProps) => (
  <section className={`Poster flex ${props.className || ""}`}>
    <div className="mock flex flex-column items-center justify-center ml3 w4 w5-ns">
      <MockPosterCenter
        preview={props.svg}
        previewH={props.posterPreviewH}
        previewW={props.posterPreviewW}
        previewX={props.posterDeltaX}
        previewY={props.posterDeltaY}
        viewBox={props.svgViewbox.join(" ")}
        ratio={
          PosterSizes[props.posterType][0] / PosterSizes[props.posterType][1]
        }
        className="pa3" // "w4 h4 w5-ns h5-ns pa3 pb0"
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
      <h2 className="mt3 mb0 f7">Chose Size</h2>
      <div className="flex items-start justify-start flex-wrap gray">
        <a
          onClick={linkEvent(PosterType.A1, props.onTypeChange)}
          className={`flex items-center justify-center mt2 mr2 w2 h2 ba pa2 f7 link dim ttu dark-gray pointer ${
            props.posterType === PosterType.A1
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          A1
        </a>
        <a
          onClick={linkEvent(PosterType.A2, props.onTypeChange)}
          className={`flex items-center justify-center mt2 mr2 w2 h2 ba pa2 f7 link dim ttu dark-gray pointer ${
            props.posterType === PosterType.A2
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          A2
        </a>
        <a
          onClick={linkEvent(PosterType.A3, props.onTypeChange)}
          className={`flex items-center justify-center mt2 mr2 w2 h2 ba pa2 f7 link dim ttu dark-gray pointer ${
            props.posterType === PosterType.A3
              ? "bw2 b--blue black"
              : "gray b--gray"
          }`}
        >
          A3
        </a>
      </div>
      <h2 className="mt3 mb0 f7">
        {`Printable Area of ${PosterSizes[props.posterType][0]}x${
          PosterSizes[props.posterType][1]
        }cm`}
      </h2>
      <h2 className="mt3 mb0 f7">Price</h2>
      <p className="ma0 pa0 f3 ttu b orange">€{props.price}</p>
      <Button
        id={"poster add"}
        className="mt4 mb2"
        label="Add to cart"
        onAction={props.onAddToCart}
      />
    </div>
  </section>
);
