import { Component } from "inferno";
import { Button } from "./base/buttons";
export interface IRecorderProps {
  onRestore: () => void;
  version: number;
  maxVersion: number;
}
export class Recorder extends Component<any, any> {
  constructor(props, context) {
    super(props, context);
    this.state = { inputVersion: null };
  }
  public updateInput(e) {
    const detail = parseInt(e.target.value, 10);
    if (!isNaN(detail)) {
      this.setState({ inputVersion: detail });
    }
  }
  public restore(v) {
    if (v <= parseInt(this.props.maxVersion, 10)) {
      this.props.onRestore(v);
    }
  }
  public render() {
    const props: IRecorderProps = this.props;
    return (
      <div className={"Recorder w5 h2 bg-black absolute top-0 left-0"}>
        <p className={"dib ph2"}>
          {props.version}
          <span>/</span>
          {props.maxVersion}
        </p>
        <input
          className={"dib w2 ml2"}
          type={"text"}
          defaultValue={this.state.inputVersion}
          onInput={this.updateInput.bind(this)}
        />
        <Button
          className={"dib"}
          onAction={this.restore.bind(this, this.state.inputVersion)}
          label={"Restore"}
        />
        <Button
          className={"dib"}
          onAction={this.restore.bind(this, this.props.version - 1)}
          label={"<"}
          disabled={this.props.version === 0}
        />
        <Button
          className={"dib"}
          onAction={this.restore.bind(this, this.props.version + 1)}
          label={">"}
          disabled={this.props.version === this.props.maxVersion}
        />
      </div>
    );
  }
}

/*
		TODO: display current version
		TODO: allow to switch to a specific version
		TODO: replay from the current version up until the last recorded one
		TODO: pause at any moment
		! update the dom only: whenever an error is thrown because of no context in runtime
	*/
