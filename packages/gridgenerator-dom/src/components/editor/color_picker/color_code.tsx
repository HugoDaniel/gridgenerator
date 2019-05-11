import { Component, linkEvent } from "inferno";
import { RGBColor } from "gridgenerator-data";
import { Button } from "../../base/buttons";
import { Input } from "../../base/form";

export interface IColorCodeProps {
  className?: string;
  style?: object;
  color: RGBColor;
  onDone: (hex: string) => void;
}
export class ColorCode extends Component<any, any> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      r: props.color.r,
      g: props.color.g,
      b: props.color.b,
      hex: RGBColor.toHex(props.color)
    };
  }
  public handleR(that, e: Event) {
    const target = e.target as HTMLInputElement;
    const t = target.value;
    const newR = parseInt(t, 10);
    if (!isNaN(newR)) {
      const hex = RGBColor.toHex(
        new RGBColor(newR, that.state.g, that.state.b)
      );
      that.setState({ r: newR, g: that.state.g, b: that.state.b, hex });
    }
  }
  public handleG(that, e: Event) {
    const target = e.target as HTMLInputElement;
    const t = target.value;
    const newG = parseInt(t, 10);
    if (!isNaN(newG)) {
      const hex = RGBColor.toHex(
        new RGBColor(that.state.r, newG, that.state.b)
      );
      that.setState({ r: that.state.r, g: newG, b: that.state.b, hex });
    }
  }
  public handleB(that, e: Event) {
    const target = e.target as HTMLInputElement;
    const t = target.value;
    const newB = parseInt(t, 10);
    if (!isNaN(newB)) {
      const hex = RGBColor.toHex(
        new RGBColor(that.state.r, that.state.g, newB)
      );
      that.setState({ r: that.state.r, g: that.state.g, b: newB, hex });
    }
  }
  public handleHex(that, e: Event) {
    const target = e.target as HTMLInputElement;
    let t = target.value;
    const hasHash = t[0] === "#";
    let c;
    if (t.length === 6 && !hasHash) {
      c = RGBColor.fromHex(`#${t}`);
    } else if (t.length === 7 && hasHash) {
      c = RGBColor.fromHex(t);
    } else {
      // 0 pad to the right until the correct length is found
      const correctLen = 6;
      let colorT = t;
      do {
        colorT = colorT + "0";
      } while (colorT.length < correctLen);
      // convert to color
      if (hasHash) {
        c = RGBColor.fromHex(colorT);
      } else {
        c = RGBColor.fromHex(`#${colorT}`);
      }
    }
    if (c) {
      that.setState({ r: c.r, g: c.g, b: c.b, hex: t });
    }
  }
  public componentWillReceiveProps(props) {
    this.state = {
      r: props.color.r,
      g: props.color.g,
      b: props.color.b,
      hex: RGBColor.toHex(props.color)
    };
  }
  public render() {
    const props = this.props as IColorCodeProps;
    return (
      <div
        className={`ColorCode bg-near-white top-0 absolute ${props.className ||
          ""}`}
        style={props.style}
      >
        <div className="flex flex-column items-start justify-center mt5">
          <div className="flex">
            <p className="sans-serif mh3">RGB</p>
            <input
              onInput={linkEvent(this, this.handleR)}
              value={this.state.r}
              defaultValue={`${props.color.r}`}
              className="f4 sans-serif w3 pa1"
              maxLength={3}
              placeholder="R"
            />
            <input
              onInput={linkEvent(this, this.handleG)}
              value={this.state.g}
              defaultValue={`${props.color.g}`}
              className="f4 sans-serif w3 pa1"
              maxLength={3}
              placeholder="G"
            />
            <input
              onInput={linkEvent(this, this.handleB)}
              value={this.state.b}
              defaultValue={`${props.color.b}`}
              className="f4 sans-serif w3 pa1"
              maxLength={3}
              placeholder="B"
            />
          </div>
          <div className="flex mt2 items-center">
            <p className="sans-serif mh3">HEX</p>
            <input
              onInput={linkEvent(this, this.handleHex)}
              value={this.state.hex}
              defaultValue={RGBColor.toHex(props.color)}
              className="f4 sans-serif w4 pa1"
              maxLength={7}
            />
            <div
              className="ml3 br-100 w2 h2"
              style={{ background: this.state.hex }}
            />
          </div>
        </div>
        <Button
          id={RGBColor.toHex(
            new RGBColor(this.state.r, this.state.g, this.state.b)
          )}
          className="ml5 mt2"
          label="Done"
          onAction={props.onDone}
        />
      </div>
    );
  }
}
