/** DOM Capabilities: It determines if something is available in the DOM or not */
export class RuntimeDOMCaps {
  public readonly hasSystemColorPicker: boolean;
  // ^ is there support for <input type=color ?
  constructor() {
    this.hasSystemColorPicker = RuntimeDOMCaps.hasSystemColorPicker();
  }
  public static hasSystemColorPicker(): boolean {
    const i = document.createElement("input");
    i.setAttribute("type", "color");
    return i.type !== "text";
  }
}
