export enum RuntimeMediaSize {
  Normal = 1,
  // ^ Mobile
  NotSmall = 30,
  // ^ Tablets and some mobiles in portrait mode
  Large = 60
  // ^ Desktops
}

export interface IDeviceWindow {
  innerWidth: number;
  innerHeight: number;
  devicePixelRatio: number;
}

/** Device info, useful to access the width and height and orientation */
export class Device {
  public readonly mediaSize: RuntimeMediaSize;
  public readonly isShort: boolean;
  // ^ is there not enough vertical space for all inteded design elements ?
  public readonly width: number;
  public readonly height: number;
  public readonly isInPortrait: boolean;
  // ^ is height bigger than the width ?
  public isUsingMouse: boolean;
  // ^ touch/mouse events handling
  public dpr: number;
  constructor(
    w: IDeviceWindow = window,
    fontSize: number,
    shortWidth: number = 560,
    shortHeight: number = 560
  ) {
    this.width = w.innerWidth;
    this.height = w.innerHeight;
    this.isUsingMouse = true;
    this.dpr = Math.round(w.devicePixelRatio * 100);
    if (this.width > fontSize * RuntimeMediaSize.NotSmall) {
      this.mediaSize = RuntimeMediaSize.NotSmall;
      if (this.width > fontSize * RuntimeMediaSize.Large) {
        this.mediaSize = RuntimeMediaSize.Large;
      }
    } else {
      this.mediaSize = RuntimeMediaSize.Normal;
    }
    this.isInPortrait = this.width < this.height;
    this.isShort =
      (this.height < shortHeight && this.isInPortrait) ||
      (this.width < shortWidth && !this.isInPortrait);
  }
}
