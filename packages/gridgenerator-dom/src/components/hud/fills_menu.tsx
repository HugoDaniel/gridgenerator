import { linkEvent } from 'inferno';
import { Menu, ShapeFillSetId } from '../../../data';
import { justClick } from '../../common';
import { NewCloseBtn } from '../base/new_close';
const noPropagation = justClick;

export interface IFillsMenuProps {
	className?: string;
	menu: Menu<ShapeFillSetId>;
	atFillEditor: boolean;
	isEnteringEditor: boolean;
	isExitingEditor: boolean;
	isEditorOnTop: boolean;
	isOtherEditorVisible: boolean;
	isShort: boolean;
	onAction: (id: ShapeFillSetId) => void;
	onNew: () => void;
}
function buildBtns(props: IFillsMenuProps, selectedCx: string, notSelectedCx: string) {
	const result: any[] = [];
	const selected = props.menu.selected;
	for (const [id, entry] of props.menu.iter()) {
		result.push(
			<button
				key={`fill_${id}_${entry.svg}`}
				onClick={linkEvent(id, props.onAction)}
				{...noPropagation}
				className={`bg-transparent pointer bn ma0 pa1 w2 h2 transition-transform
				${id === selected ? selectedCx : notSelectedCx}`}
				>
				<div
					className={'transition-transform bn pa0 ma0'}
					style={{ transform: `rotate(${2 * Math.PI * (entry.rotation || 0)}rad)` }}
					dangerouslySetInnerHTML={ { __html: entry.svg } }
				/>
			</button>
		);
	}
	const rotated = props.isEditorOnTop || props.isEnteringEditor;
	result.push(
		<NewCloseBtn
			key={`fillsnewclosebtn-${rotated}`}
			className={'w2 h2'}
			rotated={rotated}
			big={false}
			onAction={props.onNew}
		/>
	);
	return result;
}
export const FillsMenu = (props: IFillsMenuProps) => {
	let notSelectedCx = '';
	let selectedCx = 'right-circle';
	if (props.isEnteringEditor || props.isExitingEditor) {
		if (props.isEditorOnTop) {
			selectedCx += ' translate-0';
		} else {
			selectedCx += ' translate-x2';
		}
		notSelectedCx = 'translate-xy2';
	} else {
		selectedCx += ' translate-0';
		if (props.atFillEditor) {
			notSelectedCx += ' translate-xy2';
		}
		notSelectedCx += ' translate-0';
	}
	return (
	<nav className={`FillsMenu ${props.className || ''} ma0 pa0 w3 transition-transform flex flex-column items-center justify-end
		${props.isOtherEditorVisible ? 'translate-x2' : 'translate-0'}`}
		$HasKeyedChildren>
		{buildBtns(props, selectedCx, notSelectedCx)}
	</nav>);
};
