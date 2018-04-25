import { linkEvent } from 'inferno';
import { Menu } from '../../../data';
import { ShapeId } from '../../../data';
import { justClick } from '../../common';
import { NewCloseBtn } from '../base/new_close';
import { ShapeOutline } from '../editor/shape/outline';
const noPropagation = justClick;

export interface IShapesMenuProps {
	className?: string;
	menu: Menu<ShapeId>;
	editorShapes: string[];
	atShapesEditor: boolean;
	isEnteringEditor: boolean;
	isExitingEditor: boolean;
	isEditorOnTop: boolean;
	isOtherEditorVisible: boolean;
	isShort: boolean; // is there enough space for all elements ?
	onAction: (id: ShapeId) => void;
	onNew: () => void;
}
function buildBtns(props: IShapesMenuProps, selectedCx: string, notSelectedCx: string) {
	const result: any[] = [];
	const selected = props.menu.selected;
	for (const [id, entry] of props.menu.iter()) {
		const key = `shapesmenubtn-${id}-${entry.svgPaths.join('-')}`;
		let cx = 'w2 h2';
		let svgPaths = entry.svgPaths;
		if (props.isEditorOnTop || props.isExitingEditor) {
			svgPaths = props.editorShapes;
			cx += ' ba b--gray b--dashed';
		}
		result.push(
			<button
				key={key}
				onClick={linkEvent(id, props.onAction)}
				{...noPropagation}
				className={`bg-transparent pointer bn ma0 pa0 transition-transform
					${id === selected ? selectedCx : notSelectedCx}`}>
				<ShapeOutline paths={svgPaths} className={cx} rotation={entry.rotation}/>
			</button>
		);
	}
	const rotated = props.isEditorOnTop || props.isEnteringEditor;
	result.push(
		<NewCloseBtn
			key={`shapesnewclosebtn-${rotated}`}
			className={'w2 h2'}
			rotated={rotated}
			big={false}
			onAction={props.onNew}
		/>
	);
	return result;
}
export const ShapesMenu = (props: IShapesMenuProps) => {
	let notSelectedCx = '';
	let selectedCx = 'left-circle';
	if (props.isEnteringEditor || props.isExitingEditor) {
		if (props.isEditorOnTop) {
			selectedCx += ' translate-0';
		} else {
			selectedCx += ' translate-x-2';
		}
		notSelectedCx = 'translate-xy-2';
	} else {
		if (props.atShapesEditor) {
			if (props.isShort) {
				selectedCx += ' translate-x-2';
			} else {
				selectedCx += ' translate-0';
			}
			notSelectedCx += ' translate-xy-2';
		} else {
			notSelectedCx += ' translate-0';
			selectedCx += ' translate-0';
		}
	}
	return (
	<nav className={`ShapesMenu ${props.className || ''} ma0 pa0 w3 transition-transform flex flex-column items-center justify-end
	${props.isOtherEditorVisible ? 'translate-x-2' : 'translate-0'}`}
	$HasKeyedChildren>
		{buildBtns(props, selectedCx, notSelectedCx)}
	</nav>);
};
