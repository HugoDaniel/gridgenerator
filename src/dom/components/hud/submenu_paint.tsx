import { linkEvent } from 'inferno';
// @ts-ignore
import paint_pattern_icon from '../../../assets/icons/paint-pattern.svg';
import { justClick } from '../../common';
const noPropagation = justClick;
export interface ISubmenuPaintProps {
	className?: string;
	isPatternOn: boolean;
	onTogglePattern: (e: Event) => void;
}
export const SubmenuPaint = (props: ISubmenuPaintProps) => {
	return (
		<nav className="SubmenuPaint flex items-center justify-center">
			<a className="flex items-center justify-center bg-red w3 h3" href="#patternToggle" onClick={props.onTogglePattern} {...noPropagation} >
				<img className="w2 h2" src={paint_pattern_icon} alt="Toggle Pattern Mode" />
			</a>
		</nav>
	);
};
