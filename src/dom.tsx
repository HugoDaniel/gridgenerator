import { Component, linkEvent } from 'inferno';
import { Cart, Meander, MeanderCourse, Onboarding, PlayerState, Project, ProjectMap, State, ToolsMenuId, UIShapeEditorMode, UIState } from './data';
import { UpdateAction } from './dom/common';
import { addMouse, addTouch, removeMouse, removeTouch } from './dom/common';
import { Editor, IEditorProps } from './dom/components/editor';
import { HUD, IHUDProps } from './dom/components/hud';
import { Recorder } from './dom/components/recorder';
import { ISceneProps, Scene } from './dom/components/scene';
import { Events } from './dom/events';
export { Events } from './dom/events';
export { Debug } from './dom/debug';
import { IMainMenuProps, MainMenu } from './dom/components/hud/main_menu';
import { IMeanderProps, MeanderFull } from './dom/components/meander';
import { OnboardingPanel } from './dom/components/onboarding';
import { Runtime, RuntimeMediaSize } from './engine';
export { Refresher } from './dom/events/refresher';
export { UpdateAction } from './dom/common';
import { IPatternProps, Pattern } from './dom/components/pattern';

export interface IGridGeneratorDOMProps {
	state: Readonly<State>;
	cart: Cart;
	projects: ProjectMap;
	events: Events;
	runtime: Runtime;
	player: PlayerState | null;
	meander: Meander;
	onboarding: Onboarding;
	action?: UpdateAction;
}

function configEditorBtn(props: IGridGeneratorDOMProps, editorProps: IEditorProps): IEditorProps {
	switch (props.state.ui.at) {
		case UIState.FillEditor:
			editorProps.actionLabel = props.state.ui.fillEditor.primaryActionTitle;
			editorProps.onAction = props.events.hudEvents.onSaveFill;
			break;
		case UIState.ShapeEditor:
			if (props.state.ui.shapeEditor.shapesD.length === 0) {
				editorProps.actionDisabled = true;
				editorProps.actionLabel = props.state.ui.shapeEditor.primaryActionTitle;
			} else if (props.state.ui.shapeEditor.editorMode === UIShapeEditorMode.Fill) {
				editorProps.actionLabel = props.state.ui.fillEditor.primaryActionTitle;
				editorProps.onAction = props.events.shapeEditorEvents.onFigureFillDone;
			} else {
				editorProps.actionLabel = props.state.ui.shapeEditor.primaryActionTitle;
				editorProps.onAction = props.events.hudEvents.onSaveShape;
			}
			break;
		case UIState.Export:
			// TODO: check if this project is exportable
			// editorProps.actionDisabled = true;
			editorProps.actionLabel = props.state.ui.exportEditor.primaryActionTitle;
			break;
		case UIState.Publish:
			// TODO: check if this project has a license
			// editorProps.actionDisabled = true;
			editorProps.actionLabel = props.state.ui.publishEditor.primaryActionTitle;
			break;
	}
	return editorProps;
/*
	if (props.state.ui.at !== UIState.Project) {
		// toolsProps.className += `${runtime.device.isShort ? 'translate-y-2' : ''}`;
		if (props.state.ui.at === UIState.FillEditor) {
			editorProps.actionLabel = props.state.ui.fillEditor.primaryActionTitle;
			editorProps.onAction = props.events.hudEvents.onSaveFill;
		} else if (props.state.ui.at === UIState.ShapeEditor) {
			if (props.state.ui.shapeEditor.shapesD.length === 0) {
				editorProps.actionDisabled = true;
				editorProps.actionLabel = props.state.ui.shapeEditor.primaryActionTitle;
			} else if (props.state.ui.shapeEditor.editorMode === UIShapeEditorMode.Fill) {
				editorProps.actionLabel = props.state.ui.fillEditor.primaryActionTitle;
				editorProps.onAction = props.events.shapeEditorEvents.onFigureFillDone;
			} else {
				editorProps.actionLabel = props.state.ui.shapeEditor.primaryActionTitle;
				editorProps.onAction = props.events.hudEvents.onSaveShape;
			}
		}
	}
	return editorProps;
	*/
}

export class GridGeneratorDOM extends Component<IGridGeneratorDOMProps, any> {
	constructor(props: IGridGeneratorDOMProps, context: any) {
		super(props, context);
	}
	public componentDidMount() {
		const domElem = document.getElementsByTagName('body')[0];
		addMouse(domElem, this.props.events);
		addTouch(domElem, this.props.events);
	}
	public componentWillUnmount() {
		const domElem = document.getElementsByTagName('body')[0];
		removeMouse(domElem, this.props.events);
		removeTouch(domElem, this.props.events);
	}
	private selectCursor(props: IGridGeneratorDOMProps, inProj: boolean): string {
		return props.state.ui.cursorHandler.iconURL();
	}
	public render() {
		const state: Readonly<State> = this.props.state;
		const project: Project = this.props.projects.current;
		const events: Events = this.props.events;
		const runtime: Runtime = this.props.runtime;
		const cart: Cart = this.props.cart;
		const onboarding: Onboarding = this.props.onboarding;
		// next varZ's are set according to the editor/project stack state
		let editorZ = 'z-0';
		let sceneZ = 'z-1';
		let hudZ = 'z-2';
		if (this.props.state.ui.isEditorOnTop) {
			sceneZ = 'z-0';
			editorZ = 'z-2';
			hudZ = 'z-1';
		}
		// const debugInfo = `TEXTURE SIZE: ${this.props.runtime.getTextureSize(state.viewport)}; DPR: ${this.props.runtime.device.dpr}`;
		const canCloseEditor = state.ui.isEditorOnTop || state.ui.isEnteringEditor;
		const hudProps: IHUDProps = {
			title: state.ui.title,
			action: this.props.action,
			className: `absolute top-0 left-0 w-100 h-100 ${hudZ}`,
			isLoggedIn: !(runtime.token === undefined || runtime.token === null),
			gotoLogin: events.meanderEvents.gotoLogin,
			ui: state.ui,
			editorShapes: state.ui.shapeEditor.shapesD,
			mediaSize: runtime.device.mediaSize,
			isShort: runtime.device.isShort,
			zoom: state.viewport.zoom,
			zoomMiddleAt: state.viewport.zoomMiddle,
			onSelectTool: events.hudEvents.onSelectTool,
			onClearAll: events.hudEvents.onClearAll,
			onNewFill: events.hudEvents.onNewFill,
			onNewShape: events.hudEvents.onNewShape,
			onFeaturesMenu: events.hudEvents.onFeaturesMenu,
			onSelectShape: events .hudEvents.onSelectShape,
			onSelectFill: events.hudEvents.onSelectFill,
			onSaveFill: events.hudEvents.onSaveFill,
			onSaveShape: events.hudEvents.onSaveShape,
			onFillDone: events.shapeEditorEvents.onFigureFillDone,
			onToggleGrid: events.sceneEvents.onGridToggle,
			onTogglePattern: events.hudEvents.onGridPattern,
			onExitGrid: events.hudEvents.onGridExit,
			onSceneMouseMove: events.sceneEvents.onMouseMove,
			onSceneMouseDown: events.sceneEvents.onMouseDown,
			onSceneMouseUp: events.sceneEvents.onMouseUp,
			onSceneTouchMove: events.sceneEvents.onTouchMove,
			onSceneTouchStart: events.sceneEvents.onTouchStart,
			onSceneTouchEnd: events.sceneEvents.onTouchEnd,
			onSceneTouchCancel: events.sceneEvents.onTouchCancel,
			onSceneZoomIn: events.sceneEvents.onZoomIn,
			onSceneZoomOut: events.sceneEvents.onZoomOut,
			btnVisible: false
		};
		if (canCloseEditor) {
			hudProps.onNewFill = events.hudEvents.onDiscardFill;
			hudProps.onNewShape = events.hudEvents.onDiscardShape;
			// hudProps.btnVisible = runtime.device.mediaSize === RuntimeMediaSize.Normal;
		}
		const hres = runtime.device.mediaSize === RuntimeMediaSize.Normal
		           ? state.ui.shapeEditor.templateRes
		           : Math.min(runtime.height - 200, state.ui.shapeEditor.templateRes);
		const editorSize = Math.min(
			Math.min(runtime.height, hres),
			Math.min(runtime.width, state.ui.shapeEditor.templateRes));
		let editorProps: IEditorProps = {
			action: this.props.action,
			className: `absolute bottom-0 w-100 h-100 ${editorZ}`,
			isPaidAccount: this.props.meander.isPaidAccount,
			onFeaturesMenu: events.hudEvents.onFeaturesMenu,
			project,
			fillEditor: state.ui.fillEditor,
			shapeEditor: state.ui.shapeEditor,
			exportEditor: state.ui.exportEditor,
			exportEditorEvents: events.exportEvents,
			publishEditor: state.ui.publishEditor,
			publishEditorEvents: events.publishEvents,
			productEditor: cart,
			productEvents: events.productEvents,
			playerData: this.props.player,
			playerEvents: this.props.events.playerEvents,
			shapeSize: editorSize,
			colorPickerEvents: events.colorPickerEvents,
			runtime,
			hudEvents: events.hudEvents,
			shapeEditorEvents: events.shapeEditorEvents,
			at: state.ui.at,
			actionLabel: 'Please wait',
			height: runtime.device.height,
			onAction: null,
			actionDisabled: false,
			templates: state.shapes.availableTemplates(),
			isEditorOnTop: state.ui.isEditorOnTop,
			isExitingEditor: state.ui.isExitingEditor,
			isEnteringEditor: state.ui.isEnteringEditor,
			onPublishSuccess: () => events.hudEvents.onExitFeatures(events.meanderEvents.gotoProjects),
			onExitFeatures: events.hudEvents.onExitFeatures,
			onExitShape: events.hudEvents.onDiscardShape,
			onExitFill: events.hudEvents.onDiscardFill,
			onPricing: (e) => {
				if (e) {
					e.preventDefault();
				}
				events.hudEvents.onExitFeatures(events.meanderEvents.gotoPricing);
			}
		};
		editorProps = configEditorBtn(this.props, editorProps);
		const sceneProps: ISceneProps = {
			className: `absolute top-0 left-0 ${sceneZ}`,
			onContext: events.onWebGLInit,
			height: runtime.height,
			width: runtime.width,
			action: this.props.action
		};
		const inProj = this.props.meander.course === MeanderCourse.Project
		            || this.props.meander.course === MeanderCourse.None;
		const meanderProps: IMeanderProps = {
			action: this.props.action,
			className: `${inProj ? 'h3 children-o-0' : 'h-100 bg-meander children-o-100'} w-100 f1 ttu fixed z-4 bottom-0 children-opacity`,
			meander: this.props.meander,
			events: this.props.events.meanderEvents,
			// isMenuHidden: (state.ui.at !== UIState.Project && runtime.device.mediaSize === RuntimeMediaSize.Normal),
			isMenuHidden: state.ui.at !== UIState.Project,
			menu: state.ui.mainMenu,
			userId: runtime.token ? runtime.token.id : null,
			height: runtime.height,
			projects: this.props.projects.list(),
			currentProject: this.props.projects.current,
			playerState: this.props.player,
			playerEvents: this.props.events.playerEvents
		};
		const cursor = this.selectCursor(this.props, inProj);
		/*
		<Recorder
			onRestore={events.recorderEvents.restoreTo}
			version={this.props.version}
			maxVersion={this.props.maxVersion}
		/>
		*/
		const isLoggedIn =
			(this.props.projects.size > 0 &&
			this.props.meander.profile.created &&
			this.props.runtime.token);
		const pattern = state.pattern;
		return (
		<div style={{ cursor } }>
			<Scene {...sceneProps} onComponentShouldUpdate={this.props.events.shouldUpdateScene as (lastProps: any, nextProps: any) => boolean} />
			{ pattern && !canCloseEditor
			? <Pattern
					action={this.props.action}
					className="absolute absolute top-0 left-0 z-1"
					w={runtime.width}
					h={runtime.height}
					startPosX={pattern.screenStartX}
					startPosY={pattern.screenStartY}
					endPosX={pattern.screenEndX}
					endPosY={pattern.screenEndY}
					unitSize={state.viewport.unitSize}
					onComponentShouldUpdate={this.props.events.shouldUpdatePattern as (lastProps: any, nextProps: any) => boolean}
				/>
			: <div />
			}
			<HUD {...hudProps}  onComponentShouldUpdate={this.props.events.shouldUpdateHUD as (lastProps: any, nextProps: any) => boolean} />
			<Editor {...editorProps}  onComponentShouldUpdate={this.props.events.shouldUpdateEditor as (lastProps: any, nextProps: any) => boolean} />
			<OnboardingPanel data={onboarding} />
			<MeanderFull {...meanderProps}  onComponentShouldUpdate={this.props.events.shouldUpdateMeander as (lastProps: any, nextProps: any) => boolean} />
		</div>
		);
		/*
		if (isLoggedIn) {
		} else {
			return (
				<div style={{ cursor } }>
					<MeanderFull {...meanderProps} />
				</div>
			);
		}
		*/
	}
}
/*
*/
