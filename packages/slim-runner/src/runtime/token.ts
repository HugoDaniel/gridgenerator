/** Simple JWT Token */
export class Token {
  public readonly id: string;
  public readonly caps: Readonly<string[]>;
  public readonly role: string;
  /** The JWT original string */
  public readonly jwt: string;
  constructor(token: string) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error(`Invalid token: has ${parts.length} parts`);
    }
    try {
      const tobj = JSON.parse(atob(parts[1]));
      this.id = tobj.id;
      this.caps = tobj.caps;
      this.role = tobj.role;
      this.jwt = token;
    } catch (e) {
      throw new Error(`Cannot parse Token ${e}`);
    }
  }
}
