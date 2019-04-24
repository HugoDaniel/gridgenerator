// tslint:disable:max-classes-per-file
// tslint:disable:interface-name
// tslint:disable:member-access
import { Modification } from "./modification";

it("Can be serialized to/from JSON", () => {
  const args1: any = [123, { foo: "bar" }];
  args1.callee = () => 0;
  const mod1 = new Modification(123, 321, "testAction", args1);
  const serialized = mod1.serialize();
  expect(serialized.length).toBeGreaterThan(0);
  const mod1Parsed = Modification.deserialize(serialized);
  expect(mod1Parsed.version).toEqual(mod1.version);
  expect(mod1Parsed.deltaT).toEqual(mod1.deltaT);
  expect(mod1Parsed.actionName).toEqual(mod1.actionName);
  expect(mod1Parsed.args).toHaveLength(mod1.args.length);
  expect(mod1Parsed.args[0]).toStrictEqual(mod1.args[0]);
  expect(mod1Parsed.args[1]).toStrictEqual(mod1.args[1]);
  expect(mod1Parsed.args[2]).toStrictEqual(mod1.args[2]);
});
