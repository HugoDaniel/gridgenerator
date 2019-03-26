/** Bounding Client Rectangles - Only calls `getBoundingClientRect()` once per name. Returns a cached response for further use. */
export class Rects {
  private readonly elements: Map<string, DOMRect | ClientRect>;
  constructor() {
    this.elements = new Map();
  }
  /** Returns the classname element bounding rect (cached if it exists). The `name` arg is the string without the '.' */
  public className(name: string, index: number = 0): DOMRect | ClientRect {
    const indexedName = `.${name}_${index}`;
    let rect = this.elements.get(indexedName);
    if (!rect) {
      const possibleElems = document.getElementsByClassName(name);
      if (possibleElems.length < index + 1) {
        throw new Error(
          `Cannot get bounding rect: .${name} element not found for index ${index}`
        );
      }
      rect = possibleElems[index].getBoundingClientRect();
      this.elements.set(indexedName, rect);
    }
    return rect;
  }
  /** Returns the id element bounding rect (cached if it exists). The `name` arg is the string without the '#' */
  public id(name: string): DOMRect | ClientRect {
    const idName = `#${name}`;
    let rect = this.elements.get(idName);
    if (!rect) {
      const elem = document.getElementById(name);
      if (!elem) {
        throw new Error(
          `Cannot get bounding rect: #${name} element not found.`
        );
      }
      rect = elem.getBoundingClientRect();
      this.elements.set(idName, rect);
    }
    return rect;
  }
}
