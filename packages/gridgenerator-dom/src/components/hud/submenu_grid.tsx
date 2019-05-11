import { linkEvent } from 'inferno';
// @ts-ignore
import grid_pattern_icon from '../../../assets/icons/grid-pattern.svg';
// @ts-ignore
import grid_view_icon from '../../../assets/icons/grid-view.svg';
// @ts-ignore
import tools_grid_icon from '../../../assets/icons/tools-grid.svg';
import { justClick } from '../../common';
const noPropagation = justClick;
export interface ISubmenuGridProps {
	className?: string;
	onPattern: (e: Event) => void;
	onView: (e: Event) => void;
	onExit: (e: Event) => void;
	isPatternOn: boolean;
	isGridVisible: boolean;
}
// SubmenuZoom absolute bottom-2 pb3 mb5 left-0 w-100 flex items-center justify-center
export const SubmenuGrid = (props: ISubmenuGridProps) => {
	return (
		<div className="dib">
			<nav className="flex flex-column bottom-circle">
				<a className="flex items-center justify-center w2 h2" href="#" onClick={props.onView} {...noPropagation} >
					<img className={`w1 h1 ${!props.isGridVisible ? 'o-40 grayscale' : ''}`} src={grid_view_icon} alt="Toggle Grid" />
				</a>
				<a className="flex items-center justify-center w2 h2" href="#" onClick={props.onPattern} {...noPropagation} >
					<img className={`w1 h1 ${!props.isPatternOn ? 'o-40 grayscale' : ''}`} src={grid_pattern_icon} alt="Toggle Pattern" />
				</a>
				<p className="gray pa0 ma0 tc" style={
					{ 'font-size': '0.5rem', 'transform': 'translateY(0.4rem)' }}>
					▲
				</p>
				<a className="flex items-center justify-center w2 h2" href="#" onClick={props.onExit} {...noPropagation} >
					<img className="w1 h1" src={tools_grid_icon} alt="Grid Tool" />
				</a>
			</nav>
		</div>
	);
};
