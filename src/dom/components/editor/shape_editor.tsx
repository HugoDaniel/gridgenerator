import { linkEvent } from 'inferno';
import { Path } from '../../../data';
import { UIShapeEditor, UIShapeEditorMode } from '../../../data/state/ui/shape_editor';
import { IShapeActionsMenuProps, ShapeActionsMenu } from './shape/actions_menu';
import { FigureOpts, IFigureOptsProps } from './shape/figure_options';
import { FiguresMenu, IFiguresMenuProps } from './shape/figures_menu';
import { IShapeGridProps, ShapeGrid } from './shape/grid';
import { IShapePointAttribs } from './shape/point';

export interface IShapeEditorProps {
	className?: string;
	style?: object;
	shapeEditor: UIShapeEditor;
	size: number;
	isNotSmall: boolean;
	onPointAction: (attribs: IShapePointAttribs) => void;
	onShapeMount: () => void;
	onReverseAction: (i: number) => void;
	onSolveAmbiguity: (i: number) => void;
	onFigureSelect: (data: { d: string, index: number }) => void;
	onFigureDelete: () => void;
	onFigureEdit: () => void;
	onFigureFill: () => void;
	onEnterTemplateSelector: () => void;
}

function chooseMenu(props: IShapeEditorProps) {
	switch (props.shapeEditor.editorMode) {
		case UIShapeEditorMode.Fill:
		break;
		default:
			if (props.shapeEditor.selectedShape > -1) {
				// figure options
				const figOpsProps: IFigureOptsProps = {
					fill: props.shapeEditor.fills[props.shapeEditor.selectedShape],
					onDelete: props.onFigureDelete,
					onEdit: props.onFigureEdit,
					onFill: props.onFigureFill
				};
				return (
					<FigureOpts {...figOpsProps} />
				);
			} else if (props.shapeEditor.ambiguities.length > 1) {
				// ambiguities
				const shapeAmbiguitiesProps: IShapeActionsMenuProps = {
					className: '',
					shapes: props.shapeEditor.ambiguities,
					selected: -1,
					fill: '#FFB700',
					title: 'Other options: ',
					renderFirstShape: true,
					onAction: props.onSolveAmbiguity
				};
				return (
					<ShapeActionsMenu {...shapeAmbiguitiesProps} />
				);
			} else {
				// actions
				const shapeActionsMenuProps: IShapeActionsMenuProps = {
					className: '',
					shapes: props.shapeEditor.currentShapeActions,
					selected: props.shapeEditor.selectedAction,
					fill: '#FFB700',
					onAction: props.onReverseAction
				};
				return (
					<ShapeActionsMenu {...shapeActionsMenuProps} />
				);
			}
	}
}
export const ShapeEditor = (props: IShapeEditorProps) => {
	const figuresMenuProps: IFiguresMenuProps = {
		className: '',
		onFigureAction: props.onFigureSelect,
		fills: props.shapeEditor.fills,
		shapes: props.shapeEditor.shapesD,
		resolution: props.shapeEditor.templateRes,
		selected: props.shapeEditor.selectedShape,
		onEnterTemplateSelector: props.onEnterTemplateSelector,
		size: props.size,
		isNotSmall: props.isNotSmall
	};
	return (
		<div
			style={props.style || {}}
			className={`ShapeEditor ${props.className || ''}
			flex flex-column justify-start items-center h-100-ns editormw editor-shadow pr4-ns`}
		>
			<FiguresMenu {...figuresMenuProps} />
			<ShapeGrid className="mt2" {...props} />
			<div
				className="w-100 h3-ns"
				style={
					props.isNotSmall ? { width: `${props.size}px` } : {}
				}
			>
				{chooseMenu(props)}
			</div>
		</div>
	);
};
