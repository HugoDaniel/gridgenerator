/** An array of pre-processed random numbers. Uses the Crypto API. */
export class RandomArray {
  public readonly size: number;
  private values: Uint32Array;
  private at: number;
  constructor(len: number = 4096, values?: Uint32Array, at?: number) {
    this.size = len;
    this.values =
      values || (crypto.getRandomValues(new Uint32Array(len)) as Uint32Array);
    this.at = at || 0;
  }
  /** Gets a random number from the array of pre-processed
   * random numbers, if there is no more random numbers in
   * the array it generates a new array of fresh random
   * numbers to guarantee that it always returns at least
   * one random number
   **/
  public pop(): number {
    if (this.at < this.size - 1) {
      this.at += 1;
      return this.values[this.at];
    }
    // update
    this.values = window.crypto.getRandomValues(this.values) as Uint32Array;
    this.at = 1;
    return this.values[0];
  }
  /** Generate n random unique numbers, uses the `popExists` function. */
  public popManyUnique(exists: (n: number) => boolean, n: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this.popUnique(exists));
    }
    return result;
  }
  /** Returns a new random number if it doesn't exist.
   * The function to check if a number exists is passed
   * as argument. While the function returns true a new
   * different number is generated until a unique one is
   * found.
   **/
  public popUnique(exists: (n: number) => boolean): number {
    let rndNumber = this.pop();
    while (exists(rndNumber)) {
      rndNumber = this.pop();
    }
    return rndNumber;
  }
}
