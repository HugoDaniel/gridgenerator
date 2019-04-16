// tslint:disable:max-classes-per-file
// tslint:disable:interface-name
// tslint:disable:member-access
import { should } from "fuse-test-runner";
import * as Modification from "./modification";

export class ModificationsTest {
  "Can be serialized to/from JSON"() {
    const args1: any = [123, { foo: "bar" }];
    args1.callee = () => 0;
    const mod1: Modification.Data<any> = Modification.create(
      123,
      321,
      "testAction",
      args1
    );
    const serialized = mod1.toString();
    should(serialized).haveLengthGreater(0);
    const mod1Parsed = Modification.deserialize(serialized);
    should(mod1Parsed.version).equal(mod1.version);
    should(mod1Parsed.deltaT).equal(mod1.deltaT);
    should(mod1Parsed.actionName).equal(mod1.actionName);
    should(mod1Parsed.args).haveLength(mod1.args.length);
    should(mod1Parsed.args[0]).deepEqual(mod1.args[0]);
    should(mod1Parsed.args[1]).deepEqual(mod1.args[1]);
    should(mod1Parsed.args[2]).deepEqual(mod1.args[2]);
  }
}
