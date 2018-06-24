import { linkEvent } from 'inferno';
import { Cart, FeaturesMenuId, Project, Template, UIExportEditor, UIFillEditor, UIPublishEditor, UIShapeEditor, UIShapeEditorMode, UIState } from '../../data';
import { Runtime, RuntimeMediaSize } from '../../engine';
import { UpdateAction } from '../common';
import { ColorPickerEvents } from '../events/color_picker_events';
import { ExportEvents } from '../events/export_events';
import { HUDEvents } from '../events/hud_events';
import { ProductEvents } from '../events/product_events';
import { PublishEvents } from '../events/publish_events';
import { ShapeEditorEvents } from '../events/shape_editor_events';
import { Button } from './base/buttons';
import { NewCloseBtn } from './base/new_close';
import { ColorPicker, IColorPickerProps } from './editor/color_picker';
import { Export, IExportProps } from './editor/export';
import { IProductProps, Product } from './editor/product';
import { IPublishProps, Publish } from './editor/publish';
import { IPublishPreviewProps, PublishPreview } from './editor/publish/preview';
import { IShapeEditorProps, ShapeEditor } from './editor/shape_editor';
import { ITemplatePickerProps, TemplatePicker } from './editor/template_picker';

export interface IEditorProps {
	action?: UpdateAction;
	className?: string;
	actionLabel: string;
	actionDisabled: boolean;
	onAction: ((e?: Event) => void) | null;
	fillEditor: UIFillEditor;
	colorPickerEvents: ColorPickerEvents;
	shapeEditor: UIShapeEditor;
	shapeEditorEvents: ShapeEditorEvents;
	exportEditor: UIExportEditor;
	exportEditorEvents: ExportEvents;
	publishEditor: UIPublishEditor;
	publishEditorEvents: PublishEvents;
	productEditor: Cart;
	productEvents: ProductEvents;
	shapeSize: number;
	at: UIState;
	hudEvents: HUDEvents;
	runtime: Runtime;
	project: Project;
	templates: Template[];
	isEditorOnTop: boolean;
	isExitingEditor: boolean;
	isEnteringEditor: boolean;
	isPaidAccount: boolean;
	height: number;
	onPublishSuccess: () => void;
	onExitFeatures: () => void;
	onExitShape: () => void;
	onExitFill: () => void;
	onFeaturesMenu: (feature: string, e: Event) => void;
	onPricing: (e: any) => void;
}
function selectEditor(props: IEditorProps, colorPickerProps: IColorPickerProps, shapeEditorProps: IShapeEditorProps, templateProps: ITemplatePickerProps, exportProps: IExportProps, publishProps: IPublishProps, productProps: IProductProps) {
	switch (props.at) {
		case UIState.ShapeEditor:
			switch (props.shapeEditor.editorMode) {
				case UIShapeEditorMode.Fill:
				return ( <ColorPicker {...colorPickerProps} /> );
				case UIShapeEditorMode.TemplateSelector:
				return ( <TemplatePicker {...templateProps} /> );
				default:
				return ( <ShapeEditor {...shapeEditorProps} /> );
			}
		case UIState.FillEditor:
			return (
				<ColorPicker {...colorPickerProps} />
			);
		case UIState.Export:
			return (
				<Export {...exportProps} height={props.height} onComponentDidMount={exportProps.events.onExportInit} />
			);
		case UIState.Publish:
			return (
				<Publish {...publishProps} height={props.height} />
			);
		case UIState.PublishPreview:
			return (
				<PublishPreview project={props.project} onExit={props.onPublishSuccess} height={props.height} />
			);
		case UIState.Product:
			return (
				<Product onComponentDidMount={productProps.events.onProductInit} {...productProps} />
			);
		default:
			return <div />;
	}
}
export const Editor = (props: IEditorProps) => {
	const isNotSmall = props.runtime.device.mediaSize !== RuntimeMediaSize.Normal;
	const colorPickerProps: IColorPickerProps = {
		className: '',
		fillEditor: props.fillEditor,
		colorPickerEvents: props.colorPickerEvents,
		runtime: props.runtime,
		onPrimary: props.hudEvents.onSaveFill,
		onShapePathSelect: props.colorPickerEvents.onChangeFillId
	};
	const shapeEditorProps: IShapeEditorProps = {
		className: '',
		shapeEditor: props.shapeEditor,
		size: props.shapeSize,
		isNotSmall,
		onPointAction: props.shapeEditorEvents.onPointAction,
		onShapeMount: props.shapeEditorEvents.onShapeMount,
		onReverseAction: props.shapeEditorEvents.onReverseTo,
		onSolveAmbiguity: props.shapeEditorEvents.onSolveAmbiguity,
		onFigureSelect: props.shapeEditorEvents.onFigureSelect,
		onFigureDelete: props.shapeEditorEvents.onFigureDelete,
		onFigureEdit: props.shapeEditorEvents.onFigureEdit,
		onFigureFill: props.shapeEditorEvents.onFigureFill,
		onEnterTemplateSelector: props.shapeEditorEvents.onEnterTemplateSelector
	};
	const templatePickerProps: ITemplatePickerProps = {
		className: '',
		templates: props.templates,
		onCancel: props.shapeEditorEvents.onExitTemplateSelector,
		onTemplateSelect: props.shapeEditorEvents.onTemplateSelect
	};
	/*
	let btnContainerCx = 'mw6-ns ml4-ns'; // style for color picker
	if (props.at === UIState.ShapeEditor) {
		btnContainerCx = ' ml5-ns';
	}
	*/
	const exportProps: IExportProps = {
		className: '',
		data: props.exportEditor,
		events: props.exportEditorEvents,
		onExit: props.onExitFeatures
	};
	const publishProps: IPublishProps = {
		className: '',
		data: props.publishEditor,
		events: props.publishEditorEvents,
		onExit: props.onExitFeatures,
		isPaidAccount: props.isPaidAccount
	};
	const productProps: IProductProps = {
		className: '',
		data: props.productEditor,
		events: props.productEvents,
		height: props.height,
		onExit: props.onExitFeatures
	};
	const isFillEditor = props.at === UIState.FillEditor;
	return (
		<div className={`Editor ${props.className || ''}`}>
			{selectEditor(props, colorPickerProps, shapeEditorProps, templatePickerProps, exportProps, publishProps, productProps)}
			{ props.at === UIState.FillEditor || props.at === UIState.ShapeEditor ?
			<div
				className={`w-100 flex items-center justify-center editormw-ns fixed bottom-1`}
			>
				<Button
					className="center"
					key={`btn-at-${props.at}`}
					label={props.actionLabel}
					onAction={props.actionDisabled ? null : props.onAction}
					disabled={props.actionDisabled}
					/>
				<NewCloseBtn
					key={`btn-at-${props.at}-close`}
					className={`w2 h2 fixed mb4 bottom-2 ${isFillEditor ? 'right-1' : 'left-1'}`}
					big={false}
					rotated={props.isEditorOnTop || props.isEnteringEditor}
					onAction={isFillEditor ? props.onExitFill : props.onExitShape}
				/>
			</div>
			: <div /> }
		</div>
	);
};
