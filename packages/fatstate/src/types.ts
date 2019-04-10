export interface ISerializable<S> {
  serialize: () => string;
  deserialize: (serialized: string) => S;
}

export interface IWithState<A extends ISerializable<A>> {
  state: A;
  [propName: string]: any;
}
export type FunctionPropertyNames<T> = {
  // tslint:disable-next-line:ban-types
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T];
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
