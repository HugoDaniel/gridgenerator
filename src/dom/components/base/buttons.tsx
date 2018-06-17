import { linkEvent } from 'inferno';
import { justClick } from '../../common';

const noPropagation = justClick;
export interface IButtonProps {
	className?: string;
	label: string;
	id?: any;
	onAction: ((id?: any, e?: Event) => void) | null;
	disabled?: boolean;
	key?: string;
	bg?: string;
	color?: string;
}
export const Button = (props: IButtonProps) =>
	<button
		{...noPropagation}
		className={`Button b--black-10 pa2 link f7 br1 transition-o ba ${props.disabled ? 'bg-mid-gray light-gray o-0' : `bg-${props.bg || 'blue'} pointer ${props.color ? props.color : 'near-white'} dim o-100`} ttu ${props.className || ''}`}
		onClick={props.disabled ? null : (props.id && props.onAction) ? linkEvent(props.id, props.onAction) : props.onAction}
		disabled={props.disabled}
	>
		{props.label}
	</button>;

export interface IAmmountBtnProps {
	className?: string;
	value: number;
	onInc: (arg: any) => void;
	onDec: (arg: any) => void;
	min: number;
	max: number;
	arg: any;
}
export const AmmountBtn = (props: IAmmountBtnProps) => {
	return (
		<div className="AmmountBtn flex items-center justify-center">
			<button
				className="dec bg-white ttu f7 pa2 link b--black-10 ba pointer dim"
				disabled={props.min === props.value}
				onClick={linkEvent(props.arg, props.onDec)}
				>-</button>
			<div className="bg-white ammount ttu pa2 f7 b--black-10 bt bb">{props.value}</div>
			<button
				className="inc bg-white ttu f7 pa2 link b--black-10 ba pointer dim"
				onClick={linkEvent(props.arg, props.onInc)}
				disabled={props.max === props.value}
			>+</button>
		</div>
	);
};

export interface ITextButtonProps extends IButtonProps {
	width?: number;
	fgColor?: string;
	bgColor?: string;
}
export const TextButton = (props: ITextButtonProps) => {
	const { className, width, bgColor, fgColor, disabled } = props;
	const tachyonsCommon  = `f8 ttu absolute b--none w${width || 3} h2 bg-transparent dark-gray`;
	const tachyonsNormal  = `link pointer`;
	const tachyonsPrimary = 'link blue pointer';
	const tachyonsDisabled = 'light-silver bg-near-white';
	let tachyons = `${tachyonsCommon} ${tachyonsNormal}`;
	// if (isPrimary) tachyons = tachyonsPrimary;
	if (disabled) {
		tachyons = tachyonsDisabled;
	}
	const cx = `TextButton ${className || ''} bb b--dark-gray w${width || 3} w-expand-over`;
	return (
		<div className={cx}>
			<button
				{...noPropagation}
				className={tachyons}
				onClick={disabled ? null : props.onAction}
			>
				{props.label}
			</button>
			<div
				className={`w${width || 3}-expand h2 bg-white bb b--dark-gray`}
			/>
	</div>);
};
