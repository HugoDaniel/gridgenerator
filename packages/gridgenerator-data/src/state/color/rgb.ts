export interface RGBColorReviver {
  r: number;
  g: number;
  b: number;
  a: number;
}
export class RGBColor {
  public r: number;
  public g: number;
  public b: number;
  public a: number;
  constructor(r: number, g: number, b: number, a: number = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  public toJSON(): RGBColorReviver {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    };
  }
  public static revive(obj: RGBColorReviver) {
    return new RGBColor(obj.r, obj.g, obj.b, obj.a);
  }
  /** Returns an array for the color where each component is between 0.0 and 1.0 */
  public toGL(): number[] {
    return [this.r / 255, this.g / 255, this.b / 255, this.a];
  }
  public static randomHering(
    sat: number,
    light: number,
    rndNum: number = 0.5
  ): RGBColor {
    const angle = rndNum * (Math.PI * 2);
    return RGBColor.fromHsl(RGBColor.heringHue(angle), sat, light);
  }
  public toString(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    // return RGBColor.toHex(this);
  }
  public static toHex(c: RGBColor): string {
    return (
      "#" + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)
    );
  }
  public static hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }
  // assumes '#' at position 0
  public static fromHex(hex: string): RGBColor {
    return new RGBColor(
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    );
  }
  public static fromHering(angle: number, l: number, s: number): string {
    return RGBColor.toHex(RGBColor.fromHsl(RGBColor.heringHue(angle), s, l));
  }
  public static heringHue(angle: number): number {
    const v = Math.abs(Math.sin(angle));
    const red = 0;
    const yellow = 60;
    const green = 120;
    const blue = 240;
    const rightRed = 360;
    let hue1;
    let hue2;
    if (angle >= 0 && angle < Math.PI / 2) {
      hue1 = yellow;
      hue2 = red;
    } else if (angle >= Math.PI / 2 && angle < Math.PI) {
      hue1 = yellow;
      hue2 = green;
    } else if (angle >= Math.PI && angle < (3 * Math.PI) / 2) {
      hue1 = blue;
      hue2 = green;
    } else {
      hue1 = blue;
      hue2 = rightRed;
    }
    const result = hue1 * v + hue2 * (1 - v);
    return result;
  }
  public static heringFromHue(_hue: number): number {
    let hue1;
    let hue2;
    let angleF = (a: number): number => a;
    const hue = 360 * _hue;
    const red = 0;
    const yellow = 60;
    const green = 120;
    const blue = 240;
    const rightRed = 360;
    if (hue >= red && hue < yellow) {
      // 4th q
      hue1 = yellow;
      hue2 = red;
    } else if (hue >= yellow && hue < green) {
      // 3rd q
      hue1 = yellow;
      hue2 = green;
      // angleF = Math.PI;
      angleF = a => Math.PI / 2 + Math.PI / 2 - a;
    } else if (hue >= green && hue < blue) {
      // 2nd q
      hue1 = blue;
      hue2 = green;
      angleF = a => Math.PI + a;
    } else if (hue >= blue && hue < rightRed) {
      // 1st q
      hue1 = blue;
      hue2 = rightRed;
      angleF = a => (3 * Math.PI) / 2 + (Math.PI / 2 - a);
    }
    const v = (hue - hue2) / (hue1 - hue2);
    const angle = angleF(Math.asin(v));
    // console.log("HUE", hue, "ANGLE", angle, "V", v, "asin", Math.asin(v));
    return angle;
  }

  public static rgbToHsl(r: number, g: number, b: number): number[] {
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = l;
    let s = l;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  public static hslToRgb(h: number, s: number, l: number): RGBColor {
    let r;
    let g;
    let b;
    if (s === 0) {
      r = l;
      g = l;
      b = l; // achromatic
    } else {
      function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) {
          t += 1;
        }
        if (t > 1) {
          t -= 1;
        }
        if (t < 1 / 6) {
          return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
          return q;
        }
        if (t < 2 / 3) {
          return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
      }

      const _q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const _p = 2 * l - _q;
      r = hue2rgb(_p, _q, h + 1 / 3);
      g = hue2rgb(_p, _q, h);
      b = hue2rgb(_p, _q, h - 1 / 3);
    }
    const result = new RGBColor(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
    return result;
  }
  public static fromHsl(h: number, s: number, l: number): RGBColor {
    return RGBColor.hslToRgb(h / 360, s, l);
  }
}
