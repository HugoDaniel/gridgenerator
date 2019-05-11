import { VerifyingState } from "gridgenerator-data";
import { Button } from "../base/buttons";
import { IMeanderWrapperProps, MeanderWrapper } from "./wrapper";
export interface IMeanderVerifyProps extends IMeanderWrapperProps {
  state: VerifyingState;
  user: string | null;
}
function verifyState(props: IMeanderVerifyProps) {
  const pcx = "f6 tc";
  switch (props.state) {
    case VerifyingState.Verifying:
      return <p className={pcx}>Please wait...</p>;
    case VerifyingState.Success:
      return (
        <div className="flex flex-column items-center justify-center">
          <p className={`green ${pcx}`}>{props.user}</p>
          <Button label="Start" onAction={props.onExit} />
        </div>
      );
    case VerifyingState.AlreadyVerified:
      return <p className={`yellow ${pcx}`}>Already verified</p>;
    case VerifyingState.Failed:
      return <p className={`red ${pcx}`}>Verification error</p>;
  }
}
export function MeanderVerify(props: IMeanderVerifyProps) {
  let title = "Verifying";
  let h = "h3";
  if (props.state === VerifyingState.Success) {
    title = "Verified!";
    h = "h4";
  }
  return (
    <MeanderWrapper
      className="MeanderVerify"
      title={title}
      onExit={props.onExit}
    >
      <div className="w-100 h-100 flex items-center justify-center">
        <div
          className={`w5 ${h} pa3 ba br2 b--gray bg-white flex flex-column items-center justify-center`}
        >
          {verifyState(props)}
        </div>
      </div>
    </MeanderWrapper>
  );
}
