import { Component, linkEvent } from "inferno";
export class Input extends Component<any, any> {
  constructor(props, context) {
    super(props, context);
    this.state = { inputValue: null };
  }
  public handleText(that, e: Event) {
    const t = e.target as HTMLInputElement;
    that.setState({ inputValue: t.value ? t.value : "" });
    if (this && this.props.onInput) {
      this.props.onInput(t.value);
    }
  }
  public render() {
    return (
      <input
        id={this.props.id || null}
        className={this.props.className || ""}
        type={this.props.type || "text"}
        value={this.state.inputValue || this.props.value}
        defaultValue={this.props.defaultValue || ""}
        onInput={linkEvent(this, this.handleText)}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder || ""}
        maxLength={this.props.maxLength || null}
      />
    );
  }
}

export class TextArea extends Component<any, any> {
  constructor(props, context) {
    super(props, context);
    this.state = { inputValue: null };
  }
  public handleText(that, e: Event) {
    const t = e.target as HTMLTextAreaElement;
    that.setState({ inputValue: t.value ? t.value : "" });
  }
  public render() {
    return (
      <textarea
        id={this.props.id || null}
        className={this.props.className || ""}
        value={this.state.inputValue || this.props.value}
        defaultValue={this.props.defaultValue || ""}
        onInput={linkEvent(this, this.handleText)}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder || ""}
      />
    );
  }
}
