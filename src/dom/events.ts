import { Cart, FatState, Meander, MeanderCourse, Onboarding, PlayerState, ProjectMap, State, UIShapeEditorMode, UIState } from '../data';
import { PatternHit } from '../data/state/ui/clip_pattern';
import { Net, Runtime, WebGLContext } from '../engine';
import { addMouse, addTouch, IEventHandler, removeMouse, removeTouch, UpdateAction } from './common';
import { IEditorProps } from './components/editor';
import { IHUDProps } from './components/hud';
import { IMeanderProps } from './components/meander';
import { IPatternProps } from './components/pattern';
import { ISceneProps } from './components/scene';
import { ColorPickerEvents } from './events/color_picker_events';
import { ExportEvents } from './events/export_events';
import { HUDEvents } from './events/hud_events';
import { MeanderEvents } from './events/meander_events';
import { OnboardingEvents } from './events/onboarding_events';
import { PlayerEvents } from './events/player_events';
import { ProductEvents } from './events/product_events';
import { ProjectEvents } from './events/project_events';
import { PublishEvents } from './events/publish_events';
import { RecorderEvents } from './events/recorder_events';
import { Refresher } from './events/refresher';
import { SceneEvents } from './events/scene_events';
import { ShapeEditorEvents } from './events/shape_editor_events';

export class Events {
	public state: FatState;
	public runtime: Runtime;
	public refresher: Refresher;
	public net: Net;
	public projects: ProjectMap;
	public onboarding: Onboarding;
	public meander: Meander;
	public cart: Cart;
	public player: PlayerState | null;
	public onMouseDown: (e: MouseEvent) => void;
	public onMouseMove: (e: MouseEvent) => void;
	public onMouseUp: (e: MouseEvent) => void;
	public onTouchStart: (e: TouchEvent) => void;
	public onTouchMove: (e: TouchEvent) => void;
	public onTouchEnd: (e: TouchEvent) => void;
	public onTouchCancel: (e: TouchEvent) => void;
	public onWebGLInit: (ctx: WebGLContext) => void;
	public colorPickerEvents: ColorPickerEvents;
	public shapeEditorEvents: ShapeEditorEvents;
	public recorderEvents: RecorderEvents;
	public sceneEvents: SceneEvents;
	public hudEvents: HUDEvents;
	public exportEvents: ExportEvents;
	public publishEvents: PublishEvents;
	public projectEvents: ProjectEvents;
	public playerEvents: PlayerEvents | null;
	public meanderEvents: MeanderEvents;
	public productEvents: ProductEvents;
	public onboardingEvents: OnboardingEvents;
	// should updates:
	public shouldUpdateHUD: (lastProps: IHUDProps, nextProps: IHUDProps) => boolean;
	public shouldUpdateScene: (lastProps: ISceneProps, nextProps: ISceneProps) => boolean;
	public shouldUpdateMeander: (lastProps: IMeanderProps, nextProps: IMeanderProps) => boolean;
	public shouldUpdateEditor: (lastProps: IEditorProps, nextProps: IEditorProps) => boolean;
	public shouldUpdatePattern: (lastProps: IPatternProps, nextProps: IPatternProps) => boolean;

	constructor(rt: Runtime, s: FatState, m: Meander, cart: Cart, net: Net, proj: ProjectMap, onboarding: Onboarding, player: PlayerState | null, refresher: Refresher) {
		this.runtime = rt;
		this.state = s;
		this.meander = m;
		this.net = net;
		this.projects = proj;
		this.cart = cart;
		this.refresher = refresher;
		this.player = player;
		this.onboarding = onboarding;
		this.onMouseDown = (e: MouseEvent) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			if (!this.runtime.device.isUsingMouse) {
				this.runtime.device.isUsingMouse = true;
				this.refresher.refreshRuntimeOnly(this.runtime);
				this.updateMouseUsage();
			}
			if (this.state.current.isPatternOn) {
				// was the action inside, outside or on the circles ?
				const hit = this.state.current.patternHit(e.clientX, e.clientY);
				if (hit === PatternHit.EndCircle || hit === PatternHit.StartCircle) {
					this.state.hudStartPatternAdjust(hit === PatternHit.StartCircle);
					this.refresher.refreshStateOnly(this.state);
					return;
				}
			}
			this.getEventHandler().onMouseDown(e);
		};
		this.onMouseMove = (e: MouseEvent) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			this.getEventHandler().onMouseMove(e);
		};
		this.onMouseUp = (e) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			this.getEventHandler().onMouseUp(e);
		};
		this.onTouchStart = (e: TouchEvent) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			if (this.runtime.device.isUsingMouse) {
				this.runtime.device.isUsingMouse = false;
				this.refresher.refreshRuntimeOnly(this.runtime);
				this.updateMouseUsage();
			}
			this.getEventHandler().onTouchStart(e);
		};
		this.onTouchMove = (e: TouchEvent) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			this.getEventHandler().onTouchMove(e);
		};
		this.onTouchEnd = (e: TouchEvent) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			this.getEventHandler().onTouchEnd(e);
		};
		this.onTouchCancel = (e: TouchEvent) => {
			if (this.meander.course !== MeanderCourse.Project
				|| this.state.current.ui.at === UIState.Publish || this.state.current.ui.at === UIState.Export) {
				return;
			}
			// e.preventDefault();
			this.getEventHandler().onTouchCancel(e);
		};
		this.onWebGLInit = async (ctx) => {
			await this.sceneEvents.onWebGLInit(ctx);
			this.meanderEvents.initProject();
		};
		// Event Handlers:
		this.colorPickerEvents = new ColorPickerEvents(rt, s, refresher);
		this.shapeEditorEvents = new ShapeEditorEvents(rt, s, refresher);
		this.recorderEvents = new RecorderEvents(rt, s, refresher);
		this.sceneEvents = new SceneEvents(rt, s, refresher);
		this.projectEvents  = new ProjectEvents(rt, s, this.net, this.projects, refresher, this.sceneEvents.reset);
		this.publishEvents = new PublishEvents(rt, s, this.net, refresher, this.projects);
		this.productEvents = new ProductEvents(rt, s, this.cart, this.net, refresher, this.projects);
		this.onboardingEvents = new OnboardingEvents(rt, s, refresher, this.onboarding);
		this.hudEvents = new HUDEvents(rt, s, refresher, this.sceneEvents.openCols, this.sceneEvents.closeCols, this.sceneEvents.onRedraw);
		this.exportEvents = new ExportEvents(rt, s, this.net, this.projects, refresher,
			this.hudEvents.onExitFeatures
		);
		this.meanderEvents = new MeanderEvents(rt, m, this.net, refresher,
			this.projectEvents.beforeLogin,
			this.projectEvents.afterLogin,
			this.projectEvents.refreshProjects,
			this.projectEvents.getProject,
			this.projectEvents.reviveProject,
			this.projectEvents.reviveNetProject
		);
		this.shouldUpdateHUD = (lastProps, nextProps) => {
			const dontUpdate = nextProps.action === UpdateAction.Pan;
			return !dontUpdate;
		};
		this.shouldUpdateScene = (lastProps, nextProps) => {
			const dontUpdate = nextProps.action === UpdateAction.Pan;
			return !dontUpdate;
		};
		this.shouldUpdateMeander = (lastProps, nextProps) => {
			const dontUpdate = nextProps.action === UpdateAction.Pan;
			return !dontUpdate;
		};
		this.shouldUpdateEditor = (lastProps, nextProps) => {
			const dontUpdate = nextProps.action === UpdateAction.Pan;
			return !dontUpdate;
		};
		this.shouldUpdatePattern = (lastProps, nextProps) => {
			// const dontUpdate = nextProps.action === UpdateAction.Pan;
			return true;
		};
		if (player) {
			this.playerEvents = new PlayerEvents(rt, player, refresher, this.meanderEvents.gotoRoot);
		}
		// TODO: To add a new event class, create it here
		// TODO: update the functions bellow with it
	}
	public update(rt: Runtime, state: FatState): void {
		this.updateRuntime(rt);
		this.updateState(state);
	}
	public updateOnboarding(o: Onboarding): void {
		this.onboarding = o;
		this.onboardingEvents.onboarding = o;
	}
	public updateNet(n: Net): void {
		this.net = n;
		this.meanderEvents.net = n;
		this.productEvents.net = n;
		this.exportEvents.net = n;
	}
	public updateMeander(m: Meander): void {
		this.meanderEvents.meander = m;
	}
	public updateCart(c: Cart): void {
		this.productEvents.cart = c;
	}
	public updateProjects(p: ProjectMap): void {
		this.projects = p;
		this.projectEvents.projects = p;
		this.publishEvents.projects = p;
		this.exportEvents.projects = p;
	}
	public updateRuntime(rt: Runtime): void {
		this.runtime = rt;
		this.colorPickerEvents.runtime = rt;
		this.shapeEditorEvents.runtime = rt;
		this.recorderEvents.runtime = rt;
		this.sceneEvents.runtime = rt;
		this.hudEvents.runtime = rt;
		this.exportEvents.runtime = rt;
		this.publishEvents.runtime = rt;
		this.projectEvents.runtime = rt;
		this.onboardingEvents.runtime = rt;
		if (this.playerEvents) {
			this.playerEvents.runtime = rt;
		}
		this.meanderEvents.runtime = rt;
		this.productEvents.runtime = rt;
	}
	public updateState(state: FatState): void {
		this.state = state;
		this.colorPickerEvents.state = state;
		this.shapeEditorEvents.state = state;
		this.recorderEvents.state = state;
		this.sceneEvents.state = state;
		this.hudEvents.state = state;
		this.exportEvents.state = state;
		this.publishEvents.state = state;
		this.projectEvents.state = state;
		this.productEvents.state = state;
		this.onboardingEvents.state = state;
	}
	public updatePlayer(p: PlayerState): void {
		if (!this.playerEvents) {
			this.playerEvents = new PlayerEvents(this.runtime, p, this.refresher, this.meanderEvents.gotoRoot);
		} else {
			this.playerEvents.state = p;
		}
	}
	public initialPlayerState(s: State): void {
		if (!this.playerEvents) {
			return;
		} else {
			this.playerEvents.setInitialState(s);
		}
	}
	// PRIVATE METHODS BELLOW
	private updateMouseUsage(): void {
		const domElem = document.getElementsByTagName('body')[0];
		if (this.runtime.device.isUsingMouse) {
			removeTouch(domElem, this);
			addMouse(domElem, this);
		} else {
			removeMouse(domElem, this);
			addTouch(domElem, this);
		}
	}
	private getEventHandler(): IEventHandler {
		const isAt = this.state.current.ui.at;
		// TODO: allow event to go to project if x is outside a given threshold (to paint while editing a shape)
		if (isAt === UIState.FillEditor
			|| this.state.current.ui.shapeEditor.editorMode === UIShapeEditorMode.Fill) {
			// console.log('HANDLING WITH FILL EDITOR');
			return this.colorPickerEvents;
		} else if (isAt === UIState.ShapeEditor) {
			// console.log('HANDLING WITH SHAPE EDITOR');
			return this.shapeEditorEvents;
		} else if (isAt === UIState.Publish || this.state.current.ui.at === UIState.PublishPreview) {
			return this.publishEvents;
		} else if (isAt === UIState.Export) {
			return this.exportEvents;
		} else if (isAt === UIState.Product) {
			return this.productEvents;
		} else if (isAt === UIState.PatternAdjustEnd || isAt === UIState.PatternAdjustStart) {
			return this.hudEvents;
		}
		return this.sceneEvents;
	}
}
