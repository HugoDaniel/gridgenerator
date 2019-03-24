import { Button } from '../base/buttons';
import { IMeanderWrapperProps, MeanderWrapper } from './wrapper';

export interface IMeanderRecoverProps extends IMeanderWrapperProps {
	onRecover: (e: Event) => void;
	isLoading: boolean;
	errorMsg: string | null;
}
export function MeanderRecover(props: IMeanderRecoverProps) {
	const inputcx = 'input-reset f6 ba b--black-20 br1 pa2 mb2 db w-100';
	const scx = 'f7 h1 lh-copy db';
	return (
		<MeanderWrapper className="MeanderRecover" title="Forgot ?" onExit={props.onExit}>
			<div className="w-100 h-100 flex items-center justify-center">
				<div className="w5 h5 pa3 ba br2 b--gray bg-white">
					<form noValidate={true} id="recover-form" className="w-100">
						<fieldset className="bn pa0">
						<label htmlFor="recover-p">
						</label>
						<input className={inputcx} minLength={8} type="password" placeholder="new password" name="recover-p" id="recover-p" required disabled={props.isLoading} />
						<div className="flex justify-between">
							<Button disabled={props.isLoading} label="recover" onAction={props.onRecover} />
						</div>
						{ props.isLoading
						? <small id="recover-loading" className={`gray mb2 ${scx}`}>Loading</small>
						: props.errorMsg
						? <small id="password-desc" className={`red mb2 ${scx}`}>
								{ props.errorMsg ? props.errorMsg : ' ' }
							</small>
						: <small id="password-desc" className={`green mb2 ${scx}`}>
							</small>
						}
						</fieldset>
					</form>
				</div>
			</div>
		</MeanderWrapper>
	);
}
