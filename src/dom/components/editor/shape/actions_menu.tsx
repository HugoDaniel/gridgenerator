import { createTextVNode, linkEvent } from 'inferno';
// @ts-ignore
import shape_remove_icon from '../../../../assets/icons/shape-remove.svg';
import { ShapeOutline } from './outline';

export interface IShapeActionsMenuProps {
	className?: string;
	style?: object;
	shapes: string[];
	selected: number;
	fill: string;
	title?: string;
	renderFirstShape?: boolean;
	onAction: (i: number) => void;
}
function renderBtn(index: number, shape: string, fill: string, isSelected: boolean, action: (i: number) => void) {
	const stroke = '#FF6300';
	const className = 'h1 w1 ba b--light-silver mh1 h2-ns w2-ns mh2-ns';
	const selectedCx = `${className} b--orange`;
	const btnClassName = 'bn bg-transparent pa0 ma0 pointer dim';
	return (
		<button
		key={`${index}-${shape}`}
		className={btnClassName}
		onClick={linkEvent(index, action)}
	>
		<ShapeOutline
			paths={[shape]}
			fill={fill}
			stroke={stroke}
			className={isSelected ? selectedCx : className}
		/>
	</button>
	);
}
function renderShapes(shapes: string[], fill: string, selected: number, action: (i: number) => void, title: string, renderFirst: boolean) {
	const result: any[] = [
		<p
			className={`sans-serif ttu mh1 ${shapes.length > 1 ? 'f7 mv0' : 'f6 tc w-100'}`}
			key={'shapes-actions-label'}
			$HasVNodeChildren
		>
			{createTextVNode(title)}
		</p>
	];
	if (renderFirst) {
		result.unshift( renderBtn(0, shapes[0], fill, true, action) );
	}
	for (let i = shapes.length - 1; i > Math.max(shapes.length - 8, 0); i--) {
		if (shapes[i].length !== 0) {
			result.push(
				renderBtn(i, shapes[i], fill, i === selected, action)
			);
		}
	}
	return result;
}
export const ShapeActionsMenu = (props: IShapeActionsMenuProps) => {
	const title =  props.shapes.length > 1 ? (props.title || 'Go Back To: ') : 'Make your shape: connect the dots.';
	console.log('ACTIONS MENU WITH', props.shapes.length);
	return (
		<nav
			className={`ShapeActionsMenu ${props.className || ''} flex justify-start items-center w-100 bg-near-white overflow-hidden`}
			style={props.style || {}}
			$HasKeyedChildren
		>
		{ renderShapes(
			props.shapes,
			props.fill,
			props.selected,
			props.onAction,
			title,
			props.renderFirstShape || false
		)}
		</nav>
	);
};
