// @ts-ignore
import google_icon from "../../../assets/icons/google.svg";
import { Button } from "../base/buttons";
import { IMeanderWrapperProps, MeanderWrapper } from "./wrapper";

export interface IMeanderLoginProps extends IMeanderWrapperProps {
  onLogin: (e?: Event) => void;
  onRegister: (e?: Event) => void;
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  successTitle: string | null;
  successEmail: string | null;
  showRecoverPw: boolean;
  onRecover: (e: Event) => void;
}
export function MeanderLogin(props: IMeanderLoginProps) {
  const inputcx = "input-reset f6 ba b--black-20 br1 pa2 mb2 db w-100";
  const scx = "f7 mv2 lh-copy db";
  return (
    <MeanderWrapper
      className="MeanderLogin"
      title="Login"
      onExit={props.onExit}
    >
      <div
        className="w-100 h-100 flex items-center justify-center"
        onClick={(e: Event) => e.stopImmediatePropagation()}
      >
        {props.successEmail ? (
          <div className="w5 h4 pa3 ba br2 b--gray bg-white">
            <h2 className="f5">{props.successTitle}</h2>
            <small className={`green ${scx}`}>{props.successMsg}</small>
            <small className="db f7 pa0 ma0">
              Please check your e-mail to proceed
            </small>
          </div>
        ) : (
          <div className="w5 pa3 ba br2 b--gray bg-white">
            <form noValidate={true} id="login-form" className="w-100">
              <fieldset className="bn pa0">
                <input
                  className={inputcx}
                  type="email"
                  placeholder="e-mail"
                  name="login-u"
                  id="login-u"
                  required
                  disabled={props.isLoading}
                />
                <input
                  className={inputcx}
                  minLength={8}
                  type="password"
                  placeholder="password"
                  name="login-p"
                  id="login-p"
                  required
                  disabled={props.isLoading}
                />
                <div className="flex justify-between">
                  <Button
                    disabled={props.isLoading}
                    bg="dark-blue"
                    label="login"
                    onAction={props.onLogin}
                  />
                  <Button
                    disabled={props.isLoading}
                    label="register"
                    onAction={props.onRegister}
                  />
                </div>
                {props.isLoading ? (
                  <small id="login-loading" className={`gray ${scx}`}>
                    Loading
                  </small>
                ) : props.errorMsg ? (
                  <small id="password-desc" className={`red ${scx}`}>
                    {props.errorMsg ? props.errorMsg : " "}
                  </small>
                ) : (
                  <small id="password-desc" className={`green ${scx}`}>
                    {props.successMsg ? props.successMsg : " "}
                  </small>
                )}
              </fieldset>
            </form>
            {props.showRecoverPw ? (
              <div className="recover">
                <a
                  href="/recover"
                  className="f7 gray link"
                  onClick={props.onRecover}
                >
                  Forgot your password ?
                </a>
              </div>
            ) : (
              <div className="social">
                <p className="f7 tc ttu gray">or</p>
                <a className="f4 fw6 black link dim" href="/auth/google">
                  <div className="b--black-10 pa2 link f7 br1 transition-o ba pointer near-white dim o-100 flex items-center justify-between">
                    <img
                      className="w1 h1"
                      src={google_icon}
                      alt="google icon"
                    />
                    <span className="black">Login with Google</span>
                  </div>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </MeanderWrapper>
  );
}
