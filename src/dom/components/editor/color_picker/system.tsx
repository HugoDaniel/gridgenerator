import { linkEvent } from 'inferno';

export interface ISystemPickerBtnProps {
	color: string;
	style?: object;
	className?: string;
	onColorPick(colorHex: string): void;
}
export function SystemPickerBtn(props: ISystemPickerBtnProps) {
	const cx = `SystemPicker pointer ${props.className || ''}`;
	const color = props.color || '#CCCCCC';
	return (
		<label
			className={cx}
			style={props.style || {}}
			ariaLabel={'System eyedropper'}
			for={'systempicker'}
		>
			<p
				className={'f7 sans-serif white ttu ws-normal tc h3 w3 br-100 ma0 flex flex-column justify-center'}
			>
				Click
				<br/>
				me
			</p>
			<input
				type={'color'}
				id={'systempicker'}
				className={'not-visible w0 h0 absolute bn br-100 bg-transparent z-0 o-0'}
				style={{ transform: 'translate(2.8rem, -1.5rem)'}}
				value={color}
				onInput={linkEvent(props, eyedropperColorPick)}
			/>
		</label>
	);
}

function eyedropperColorPick(props, e) {
	props.onColorPick(e.target.value);
}
