import { Component, createTextVNode } from 'inferno';
import { FillId, ShapeId, ToolsMenuId, UI, UIShapeEditorMode, UIState } from '../../data';
import { RuntimeMediaSize } from '../../engine';
import { DeleteMenu, IDeleteMenuProps } from './hud/delete_menu';
import { FeaturesMenu, IFeaturesMenuProps } from './hud/features_menu';
import { FillsMenu, IFillsMenuProps } from './hud/fills_menu';
import { IShapesMenuProps, ShapesMenu } from './hud/shapes_menu';
import { IToolsMenuProps, ToolsMenu } from './hud/tools_menu';
import { IZoomMenuProps, ZoomMenu } from './hud/zoom_menu';
export interface IHUDProps {
	className?: string;
	ui: UI;
	editorShapes: string[];
	isShort: boolean;
	mediaSize: RuntimeMediaSize;
	btnVisible: boolean;
	// ^ HUD can have a single button instead of the tools menu:
	btnId?: string;
	zoom: number;
	zoomMiddleAt: number;
	isLoggedIn: boolean;
	onSelectTool: (toolId: ToolsMenuId, e: Event) => void;
	onClearAll: () => void;
	onNewFill: () => void;
	onNewShape: () => void;
	onFeaturesMenu: (feature: string, e: Event) => void;
	onSelectShape: (sid: ShapeId) => void;
	onSelectFill: (fid: FillId) => void;
	onSaveFill: () => void;
	onSaveShape: () => void;
	onFillDone: () => void;
	onSceneMouseMove: (e: MouseEvent) => void;
	onSceneMouseDown: (e: MouseEvent) => void;
	onSceneMouseUp: (e: MouseEvent) => void;
	onSceneTouchMove: (e: TouchEvent) => void;
	onSceneTouchStart: (e: TouchEvent) => void;
	onSceneTouchEnd: (e: TouchEvent) => void;
	onSceneTouchCancel: (e: TouchEvent) => void;
	gotoLogin: () => void;
}

function currentToolMenu(id: ToolsMenuId, fillsProps: IFillsMenuProps, deleteProps: IDeleteMenuProps, zoomProps: IZoomMenuProps) {
	switch (id) {
		case ToolsMenuId.Paint:
		return <FillsMenu {...fillsProps} />;
		case ToolsMenuId.Delete:
		return <DeleteMenu {...deleteProps} />;
		case ToolsMenuId.Zoom:
		return <ZoomMenu {...zoomProps} />;
	}
}
const debugFunc = (e) => e;
export class HUD extends Component<IHUDProps, any> {
	public render() {
		const props = this.props;

		const toolsMenuProps: IToolsMenuProps = {
			className: `absolute bottom-2 mb4 left-0 w-100 visible-ns`,
			withMoveZoom: props.mediaSize !== RuntimeMediaSize.Normal,
			// ^ show move and zoom icons ?
			menu: props.ui.toolsMenu,
			onAction: props.onSelectTool,
			// isVisible: !(props.ui.at !== UIState.Project && props.isShort)
			isVisible: props.ui.at === UIState.Project
			// isSingleAction: props.ui.isEnteringEditor || props.ui.at !== UIState.Project,
			// singleActionDisabled: props.ui.isEnteringEditor || props.ui.isExitingEditor
		};
		// configToolsBtn(props, toolsMenuProps);
		const shapesMenuProps: IShapesMenuProps = {
			menu: props.ui.shapesMenu,
			onAction: props.onSelectShape,
			onNew: props.onNewShape,
			atShapesEditor: props.ui.at === UIState.ShapeEditor,
			editorShapes: props.editorShapes,
			// isEditorVisible: props.ui.isEditorVisible,
			isEditorOnTop: props.ui.isEditorOnTop,
			isExitingEditor: props.ui.isExitingEditor,
			isEnteringEditor: props.ui.isEnteringEditor,
			isShort: props.isShort,
			className: `absolute bottom-2 mb4 left-0 vertical-menuh`,
			isOtherEditorVisible: props.ui.at === UIState.FillEditor
			                   || props.ui.at === UIState.Export
			                   || props.ui.at === UIState.Publish
			                   || props.ui.at === UIState.PublishPreview
		};
		const fillsMenuProps: IFillsMenuProps = {
			menu: props.ui.fillsMenu,
			onAction: props.onSelectFill,
			onNew: props.onNewFill,
			atFillEditor: props.ui.at === UIState.FillEditor,
			isEditorOnTop: props.ui.isEditorOnTop,
			isExitingEditor: props.ui.isExitingEditor,
			isEnteringEditor: props.ui.isEnteringEditor,
			isShort: props.isShort,
			className: 'absolute bottom-2 mb4 right-0 vertical-menuh',
			isOtherEditorVisible: props.ui.at === UIState.ShapeEditor
												 || props.ui.at === UIState.Export
												 || props.ui.at === UIState.Publish
												 || props.ui.at === UIState.PublishPreview
		};
		const deleteMenuProps: IDeleteMenuProps = {
			onClearAll: props.onClearAll,
			className: 'absolute bottom-2 mb5 right-0 pb2'
		};
		const zoomMenuProps: IZoomMenuProps = {
			className: 'absolute bottom-2 mb5 right-0 pb2',
			percentage: props.zoom,
			middleAt: props.zoomMiddleAt,
			size: 255
		};
		const featuresMenuProps: IFeaturesMenuProps = {
			className: `center w4 h2 ma0 pa0 flex items-center justify-center transition-o ${props.ui.at === UIState.Project ? 'o-100' : 'o-0'}`,
			menu: props.ui.featuresMenu,
			onAction: props.onFeaturesMenu,
			canUseFeatures: props.isLoggedIn,
			gotoLogin: props.gotoLogin
		};
		// console.log(props.ui.at, props.ui.isEnteringEditor, props.ui.isExitingEditor);
		return (
			<section
				className={`HUD ${props.className || ''}`}
			>
				<h1
					className={`mb0 lh-title f6 w-100 tc sans-serif ttu black transition-transform ${props.ui.at === UIState.Project ? '' : 'translate-y--3'}`}
					$HasVNodeChildren>
						{createTextVNode(props.ui.title)}
				</h1>
				<FeaturesMenu {...featuresMenuProps} />
				<ToolsMenu {...toolsMenuProps} />
				{currentToolMenu(props.ui.toolsMenu.selected, fillsMenuProps, deleteMenuProps, zoomMenuProps)}
				<ShapesMenu {...shapesMenuProps} />
			</section>
		);
	}
}
/*
*/
