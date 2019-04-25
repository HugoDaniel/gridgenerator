import { PublishState } from "./state/ui/publish";
import { Checkpoint } from "./fat/checkpoint";
import { Modification, ModificationReviver } from "./fat/modification";
import { State } from "./state";
import { RGBColor } from "./state/color/rgb";
import { FillId } from "./state/fill_map";
import { GridType } from "./state/layer/grid";
import { TilePattern } from "./state/layer/tile_pattern";
import { Vector2D } from "./state/math/vector";
import { ShapeFillSetId } from "./state/shape/shape";
import { ShapeId } from "./state/shape_map";
import { UIState } from "./state/ui";
import { ClipPattern } from "./state/ui/clip_pattern";
import { UICursor } from "./state/ui/cursor";
import { ToolsMenuId, UIFillEditorColorMode } from "./state/ui/defaults";
import { ExportAt, ExportEditorFormat, ExportSize } from "./state/ui/export";
import { UIFillEditor, UIFillEditorMode } from "./state/ui/fill_editor";

export interface FatStateReviver {
  m: ModificationReviver[];
  v: number;
}
export class FatState {
  private _version: number;
  private _state: State;
  private _mods: Modification[];
  private _prevTime: number;
  private _maxDeltaT: number;
  private _minDeltaT: number;
  private _checkpoint: Checkpoint | null;
  // ^ checkpoint points to the largest version of this fat state
  // useful to keep the final state and all its mods when time traveling
  // it gets set to null if a modification is done on a restored state
  private _relativeVersion: number | null;
  // ^ when the state is restored, the _version is set to 0
  // if not null this var indicates that the current state was restored
  // and its original version in relation to the checkpoint
  // whenever an action occurs the checkpoint and relativeVersion are set to null
  private _restoring: boolean;
  constructor(initialState?: State) {
    this._version = 0;
    this._state = initialState || new State();
    this._mods = [];
    this._prevTime = Date.now(); // useless here, this is set when starting replay
    this._maxDeltaT = 500; // actions occur at most with 500ms difference
    this._minDeltaT = 60; // bellow this value, actions get merged
    this._checkpoint = null;
    this._relativeVersion = null;
    this._restoring = false;
  }
  public toJSON(): FatStateReviver {
    return {
      m: this._mods.map(m => m.toJSON()),
      v: this.maxVersion
    };
  }
  public static revive(o: FatStateReviver, state: State) {
    const result = new FatState();
    result._mods = o.m.map(m => Modification.revive(m, FatState.reviveArgs));
    result._version = o.v;
    result._state = state;
    return result;
  }
  set initialState(s: State) {
    this._version = 0;
    this._checkpoint = null;
    this._state = s;
  }
  //#region Recorder
  get version(): number {
    if (this._relativeVersion) {
      return this._relativeVersion;
    }
    return this._version;
  }
  get current(): Readonly<State> {
    return this._state;
  }
  get maxVersion(): number {
    if (!this._checkpoint) {
      return this._version;
    }
    return Math.max(this._version, this._checkpoint.version);
  }
  public static reviveArgs(name: string, args: any[] | null): any[] | null {
    if (!args) {
      return null;
    }
    switch (name) {
      case "hudEnterNewFill":
        return [
          args[0],
          args[1],
          args[2].map(c => new RGBColor(c.r, c.g, c.b, c.a))
        ];
      case "shapeClose":
        return [
          new Vector2D(args[0].x, args[0].y),
          args[1].map(c => new RGBColor(c.r, c.g, c.b, c.a)),
          args[2]
        ];
      case "shapePointAction":
        return [new Vector2D(args[0].x, args[0].y)];
      default:
        return args;
    }
  }
  private mod(name: string, args: any[] | null) {
    // check the deltaT
    const now = Date.now();
    const deltaT = now - this._prevTime;
    this._prevTime = now;
    // if deltaT is bellow min, then update the previous action if its the same
    if (deltaT < this._minDeltaT) {
      const lastMod = this._mods[this._mods.length - 1];
      if (!lastMod) {
        return;
      }
      const lastModName = lastMod.actionName;
      if (lastModName === name) {
        // update it
        this._mods[this._mods.length - 1] = new Modification(
          lastMod.version,
          lastMod.deltaT + deltaT,
          name,
          args
        );
        return;
      }
    }
    // up the version
    this._version++;
    // create the mod
    this._mods.push(
      new Modification(
        this.version,
        Math.min(deltaT, this._maxDeltaT),
        name,
        args
      )
    );
    // clear the checkpoint
    this.removeCheckpoint();
  }
  private modsNeeded(version: number) {
    if (!this._checkpoint) {
      throw new Error(
        "No checkpoint was done yet. Cannot go to version " + version
      );
    }
    if (this._checkpoint.version < version) {
      throw new Error("No checkpoint found for version " + version);
    }
    return this._checkpoint.mods;
  }
  private doCheckpoint(newVersion: number) {
    // only performs a checkpoint if the current version is bigger
    // than the current checkpoint version
    if (!this._checkpoint || this._checkpoint.version < this._version) {
      this._checkpoint = new Checkpoint(this._state, this._mods, this._version);
    }
    this._relativeVersion = newVersion;
  }
  private removeCheckpoint() {
    if (!this._restoring) {
      this._checkpoint = null;
      this._relativeVersion = null;
    }
  }
  public restoreTo(version: number, initialState?: State) {
    // Use modifications to restore from version 0 up to desired version
    let mods = this._mods;
    // If version is bigger than current max version or is a restored version
    // use the mods from a bigger checkpoint
    if (version > this.maxVersion || this._relativeVersion !== null) {
      mods = this.modsNeeded(version);
    } else if (version === this._version) {
      return; // no action required
    }
    // Move current state and version to a checkpoint
    this.doCheckpoint(version);
    // Start with a clean State
    this._version = 0;
    this._state = initialState || new State();
    this._mods = [];
    // Initialize the resoration process
    this._restoring = true;
    // Apply to actions until the desired version is reached
    for (let v = 0; v < version; v++) {
      const mod = mods[v];
      if (!mod.args) {
        this[mod.actionName]();
      } else {
        this[mod.actionName](...mod.args);
      }
    }
    // Mark the process as finished
    this._restoring = false;
  }
  /**
   * Restores the state to be after the next mod present in the set
   * It is fast because it does not need a initial state
   * And it does not do a checkpoint
   */
  public fastRestoreFwd(set: Set<string>) {
    let mods = this._mods;
    let version = this._version;
    if (this._checkpoint) {
      mods = this._checkpoint.mods;
      version = this._checkpoint.version;
    }
    let curVersion = this.version;
    // Initialize the resoration process
    this._restoring = true;
    // Apply to actions until the desired version is reached
    do {
      const mod = mods[curVersion];
      if (!mod) {
        this._restoring = false;
        return;
      }
      if (!mod.args) {
        this[mod.actionName]();
      } else {
        this[mod.actionName](...mod.args);
      }
      if (set.has(mod.actionName)) {
        break;
      }
      curVersion++;
    } while (curVersion < this.maxVersion);
    // Mark the process as finished
    this._restoring = false;
    this._relativeVersion = Math.min(curVersion + 1, this.maxVersion);
  }

  public prev(init: State, s: Set<string>, adjust: number = 0) {
    // console.log('MODS AVAILABLE', this._mods.length, this._mods);
    let mods = this._mods;
    const version = this.version;
    if (this._checkpoint) {
      mods = this._checkpoint.mods;
    }
    // find previous version:
    let prev = 0;
    for (let v = 0; v < version; v++) {
      if (s.has(mods[v].actionName)) {
        prev = v;
      }
    }
    // console.log('REVERTING TO', prev);
    // restore to it
    this.restoreTo(prev - adjust, init);
  }
  public next(init: State, s: Set<string>) {
    let mods = this._mods;
    let version = this._version;
    if (this._checkpoint) {
      mods = this._checkpoint.mods;
      version = this._checkpoint.version;
    }
    // find next version:
    let next = this.version + 1;
    let found = false;
    for (let v = next; v < version; v++) {
      if (s.has(mods[v].actionName)) {
        found = true;
        next = v;
        break;
      }
    }
    if (!found) {
      next = version;
    }
    this._relativeVersion = next;
    // restore to it
    this.restoreTo(next, init);
  }
  //#endregion
  //#region Color Picker
  private updateSelectedColor(): FatState {
    if (this._state.ui.at === UIState.ShapeEditor) {
      // get values from editor
      const shapeIndex = this._state.ui.shapeEditor.selectedShape;
      const fillId = this._state.shapes.editor.fillIds[shapeIndex];
      const fillIdString = this._state.fills.updateFromEditor(fillId);
      this._state.ui.fillEditor.updateSelected(fillIdString);
      this._state.ui.shapeEditor.updateFill(fillIdString);
      return this;
    } else {
      // get values from shape
      const shape = this._state.selectedShape;
      const fillIdString = this._state.fills.updateFromEditor(
        shape.selectedPathFillId
      );
      this._state.ui.updateSelectedFill(
        this._state.fills.buildSVG(shape.resolution, shape.getSelectedFills()),
        fillIdString
      );
      return this;
    }
  }
  public colorPickerSelectColor(slice: number): FatState {
    this._state.fills.colors.editorSelectColor(slice);
    this.updateSelectedColor();
    this.mod("colorPickerSelectColor", [slice]);
    return this;
  }
  public colorPickerMoveWheel(angle: number): FatState {
    this._state.fills.colors.moveWheel(angle);
    this.updateSelectedColor();
    this.mod("colorPickerMoveWheel", [angle]);
    return this;
  }
  public colorPickerModeChange(mode: UIFillEditorColorMode): FatState {
    this._state.fills.colors.modeChange(UIFillEditor.toColorEditorMode(mode));
    this._state.ui.fillEditor.colorMenuMode(mode);
    this.mod("colorPickerModeChange", [mode]);
    return this;
  }
  public colorPickerSystem(hex: string): FatState {
    this._state.fills.colors.editorColorPick(hex);
    this.updateSelectedColor();
    this.mod("colorPickerSystem", [hex]);
    return this;
  }
  public colorPickerSelectFillId(fillId: number): FatState {
    if (this._state.ui.at === UIState.ShapeEditor) {
      // get values from editor
      const index = this._state.shapes.editor.fillIds.indexOf(fillId);
      this._state.ui.shapeEditor.selectedShape = index;
    } else {
      // set the selected fill id in the shape:
      this._state.shapes.setShapeFillId(this._state.selectedShapeId, fillId);
    }
    // update the UI selected fillId
    this._state.ui.fillEditor.selected = fillId;
    // change the fills map selected id
    this._state.fills.selectFillId(fillId);
    this.updateSelectedColor();
    this.mod("colorPickerSelectFillId", [fillId]);
    return this;
  }
  public colorPickerEnterCode(): FatState {
    this._state.ui.fillEditor.editorMode = UIFillEditorMode.Code;
    const fid = this._state.ui.fillEditor.selected;
    const color = this._state.fills.getFillObj(fid);
    if (!color) {
      // tslint:disable-next-line:no-console
      console.warn(
        "Could not get the fill obj(color) for the selected fill id when entering Color Code"
      );
      return this;
    }
    this._state.ui.fillEditor.colorCode = color;
    this.mod("colorPickerEnterCode", null);
    return this;
  }
  public colorPickerExitCode(): FatState {
    this._state.ui.fillEditor.editorMode = UIFillEditorMode.Color;
    this.mod("colorPickerExitCode", null);
    return this;
  }

  public colorPickerSaveCode(hex: string): FatState {
    this._state.ui.fillEditor.editorMode = UIFillEditorMode.Color;
    this._state.fills.colors.editorColorPick(hex);
    this.updateSelectedColor();
    this.mod("colorPickerSaveCode", [hex]);
    return this;
  }
  //#endregion

  //#region HUD
  public async hudEnterFeature(feature: string) {
    this._state.ui.enterFeature(
      feature,
      this._state.currentLayer,
      this._state.layerShapeOutline,
      this._state.layerShapeRes
    );
    this._state.ui.enteringEditor();
    this.mod("hudEnterFeature", [feature]);
  }
  public hudEnterEditShape() {
    // get the path for the current selected shapeId/fillId
    const p = this._state.shapes.editShape(this._state.ui.shapesMenu.selected);
    // get fill strings from the editor fill ids
    this._state.ui.editShape(p, this._editorFills(), true);
    // true because the editor is for an existing shape ^
    this._state.ui.enteringEditor();
    this.mod("hudEnterEditShape", null);
  }
  public hudEnterNewShape() {
    const p = this._state.shapes.newShape(this._state.currentLayerType);
    this._state.ui.editShape(p);
    this._state.ui.enteringEditor();
    this.mod("hudEnterNewShape", null);
  }
  public hudDiscardNewShape() {
    // remove the created fills
    for (let i = 0; i < this._state.shapes.editor.fillIds.length; i++) {
      this._state.fills.deleteFill(this._state.shapes.editor.fillIds[i]);
    }
    this._state.ui.exitingEditor();
    this._state.ui.editorOnBottom();
    this.mod("hudDiscardNewShape", null);
  }
  public hudDiscardEditedShape() {
    this._state.ui.exitingEditor();
    this._state.ui.editorOnBottom();
    this.mod("hudDiscardEditedShape", null);
  }
  public hudEnterNewFill(
    shapeFillSetId: number,
    newFillIds: number[],
    colors: RGBColor[]
  ): FatState {
    // set the new fill id's colors
    this._state.fills.newFills(newFillIds, colors);
    // set the new fills in the new shape fillset id
    const shape = this._state.selectedShape;
    shape.addNewFills(newFillIds, shapeFillSetId);
    // update the current selected editor
    this._state.fills.updateEditorWith(shape.selectedPathFillId);
    // set the UI state
    this._state.ui.newFill(
      this._state.selectedShape,
      this._state.fills.buildShapeSVG(this._state.selectedShape),
      this._state.fills
    );
    this._state.ui.enteringEditor();
    this.mod("hudEnterNewFill", [shapeFillSetId, newFillIds, colors]);
    return this;
  }
  public hudUIExitingEditor(): FatState {
    this._state.ui.exitingEditor();
    this.mod("hudExitingEditor", null);
    return this;
  }
  public hudUIEnteringEditor(): FatState {
    this._state.ui.enteringEditor();
    this.mod("hudEnteringEditor", null);
    return this;
  }
  public hudUIEditorOnTop(): FatState {
    this._state.ui.editorOnTop();
    this._state.ui.editorStopAnim();
    this.mod("hudUIEditorOnTop", null);
    return this;
  }
  public hudUIEditorOnBottom(): FatState {
    this._state.ui.editorOnBottom();
    this.mod("hudUIEditorOnBottom", null);
    return this;
  }
  public hudUICloseNewFill(): FatState {
    const shape = this._state.selectedShape;
    const rot = this._state.layers.getSelected().selectedRot;
    this._state.ui.closeNewFill(
      shape,
      rot,
      this._state.fills.buildShapeSVG(shape)
    );
    // ^ changes the ui.at state
    this._state.ui.editorStopAnim();
    this.mod("hudUICloseNewFill", null);
    return this;
  }
  public hudUICloseNewShape(): FatState {
    this._state.ui.closeNewShape();
    // ^ changes the ui.at state
    this._state.ui.editorStopAnim();
    this.mod("hudUICloseNewShape", null);
    return this;
  }
  public hudDiscardNewFills(): FatState {
    this._state.fills.discardNewFills();
    this._state.selectedShape.discardNewFill();
    this._state.ui.exitingEditor();
    this._state.ui.editorOnBottom();
    this.mod("hudDiscardNewFills", null);
    return this;
  }
  public hudSaveNewFills(): FatState {
    // update the layer info:
    const grid = this._state.layers.getSelected();
    const shape = this._state.shapes.getShapeById(grid.selectedShape);
    if (!shape) {
      throw new Error(
        `HUD: Cannot save fills for shapeId ${grid.selectedShape}`
      );
    }
    const fillId = shape.selectedFillSet;
    grid.selectFill(fillId);
    this._state.ui.exitingEditor();
    this._state.ui.editorOnBottom();
    this.mod("hudSaveNewFills", null);
    return this;
  }
  public hudSaveShape(
    type: GridType,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    newFillIds: number[]
  ): FatState {
    // the current selected layer to update
    const grid = this._state.layers.getSelected();
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    // is editing an existing shape ?
    if (isExisting) {
      this._hudUpdateShape(type, shapeId, shapeFillId, newFillIds);
    } else {
      // save the current editing shape
      const shape = this._state.shapes.saveNewShape(type, shapeId, shapeFillId);
      grid.addNewShape(shapeId, shapeFillId);
      // update the shapes menu and fills menu
      this._state.ui.refreshMenus(
        grid,
        this._state.shapes,
        this._state.fills.buildShapeSVG(shape)
      );
      // return to the project editing
      this._state.ui.exitingEditor();
      this._state.ui.editorOnBottom();
    }
    this.mod("hudSaveShape", [type, shapeId, shapeFillId, newFillIds]);
    return this;
  }
  private _hudUpdateShape(
    type: GridType,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    newFillIds: number[]
  ) {
    // the current selected layer to update
    const grid = this._state.layers.getSelected();
    // analyze the new shape and return the transformations that need to be performed
    const changes = this._state.shapes.getShapeChanges(shapeId);
    // get the fill ids that need to be duplicated
    const dupsNeeded = this._state.shapes.getNeededDups(shapeId, changes);
    // duplicate the fillIds and create a map of duplicates
    const dups = this._state.fills.duplicateMany(
      dupsNeeded.fillIds,
      newFillIds,
      dupsNeeded.size
    );
    // update the current editing shape
    const shape = this._state.shapes.saveUpdatedShape(
      type,
      shapeId,
      shapeFillId,
      dups,
      changes
    );
    // update the shapes menu and fills menu
    this._state.ui.refreshMenus(
      grid,
      this._state.shapes,
      this._state.fills.buildShapeSVG(shape)
    );
    // return to the project editing
    this._state.ui.exitingEditor();
    this._state.ui.editorOnBottom();
  }
  public hudSaveUpdatedShape(
    type: GridType,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    newFillIds: number[]
  ): FatState {
    this._hudUpdateShape(type, shapeId, shapeFillId, newFillIds);
    this.mod("hudSaveUpdatedShape", [type, shapeId, shapeFillId, newFillIds]);
    return this;
  }
  public hudSelectShape(shapeId: ShapeId): FatState {
    // check if the shape exists
    const shape = this._state.shapes.getShapeById(shapeId);
    if (!shape) {
      throw new Error(`HUD: Cannot select shape with shapeId ${shapeId}`);
    }
    // set it as selected in the current layer
    const grid = this._state.layers
      .getSelected()
      .selectShape(shapeId, shape.selectedFillSet);
    // change to paint mode
    this._state.ui.selectTool(ToolsMenuId.Paint);
    // update the shapes menu and fills menu
    this._state.ui.refreshMenus(
      grid,
      this._state.shapes,
      this._state.fills.buildShapeSVG(shape)
    );
    this.mod("hudSelectShape", [shapeId]);
    return this;
  }
  public hudRotateShape(): FatState {
    const layer = this._state.layers.getSelected();
    const shapeId = layer.selectedShape;
    // check if the shape exists
    const shape = this._state.shapes.getShapeById(shapeId);
    if (!shape) {
      throw new Error(`HUD: Cannot rotate shape with shapeId ${shapeId}`);
    }
    // rotate it in the current layer
    const rotation = layer.rotateSelected();
    // update the shapes menu and fills menu
    this._state.ui.refreshMenus(
      layer,
      this._state.shapes,
      this._state.fills.buildShapeSVG(shape)
    );
    this.mod("hudRotateShape", null);
    return this;
  }
  public hudSelectFill(fillId: ShapeFillSetId): FatState {
    // get selected layer and shape id
    const grid = this._state.layers.getSelected();
    const shape = this._state.shapes.getShapeById(grid.selectedShape);
    if (!shape) {
      throw new Error(
        `HUD: Cannot select shape fill. Selected shape could not be found: ${
          grid.selectedShape
        }`
      );
    }
    // select the desired fill
    shape.selectFill(fillId);
    grid.selectFill(fillId);
    // update the shapes menu and fills menu
    this._state.ui.refreshMenus(
      grid,
      this._state.shapes,
      this._state.fills.buildShapeSVG(shape)
    );
    this.mod("hudSelectFill", [fillId]);
    return this;
  }
  public hudSelectTool(toolId: ToolsMenuId): FatState {
    this._state.ui.selectTool(toolId);
    this.mod("hudSelectTool", [toolId]);
    return this;
  }
  public hudClearAll(): FatState {
    // this._state.ui.selectTool(toolId);
    this._state.layers.getSelected().clear();
    this.mod("hudClearAll", null);
    return this;
  }
  public hudTogglePattern(): FatState {
    this._state.ui.toolsSubmenus.isGridPatternOn = !this._state.ui.toolsSubmenus
      .isGridPatternOn;
    if (!this._state.ui.toolsSubmenus.isGridPatternOn) {
      // remove pattern
      this._state.layers.getSelected().pattern = null;
    }
    this.mod("hudTogglePattern", null);
    return this;
  }
  public hudNewPattern(cx: number, cy: number): FatState {
    const grid = this._state.layers.getSelected();
    // restore the previous pattern configuration if present
    if (grid.oldPattern) {
      grid.pattern = grid.oldPattern;
    } else {
      grid.pattern = new TilePattern(cx - 1, cy - 1, cx + 1, cy + 1);
    }
    const lid = this._state.layers.selectedLayerId;
    const clip = new ClipPattern(grid.pattern);
    this._state.ui.patterns.set(lid, clip);
    this.mod("hudNewPattern", [cx, cy]);
    return this;
  }
  public hudUpdatePatternPos(): FatState {
    this._state.updatePatternsPos();
    this.mod("hudUpdatePatternPos", null);
    return this;
  }
  public hudStartPatternAdjust(startPos: boolean): FatState {
    if (startPos) {
      this._state.ui.at = UIState.PatternAdjustStart;
    } else {
      this._state.ui.at = UIState.PatternAdjustEnd;
    }
    this.mod("hudStartPatternAdjust", [startPos]);
    return this;
  }
  public hudPatternAdjust(layerX: number, layerY: number): FatState {
    const grid = this._state.currentLayer;
    // check which pattern position is being adjusted (start or end ?)
    if (this._state.ui.at === UIState.PatternAdjustEnd) {
      // set the grid tilepattern to match the new positions
      if (grid.pattern) {
        if (grid.pattern.startX < layerX) {
          grid.pattern.endX = layerX;
        }
        if (grid.pattern.startY < layerY) {
          grid.pattern.endY = layerY;
        }
      }
    } else {
      if (grid.pattern) {
        if (grid.pattern.endX > layerX) {
          grid.pattern.startX = layerX;
        }
        if (grid.pattern.endY > layerY) {
          grid.pattern.startY = layerY;
        }
      }
    }
    const lid = this._state.layers.selectedLayerId;
    const clip = this._state.ui.patterns.get(lid);
    if (clip && grid.pattern) {
      clip.gridPattern = grid.pattern;
      this._state.ui.patterns.set(lid, clip);
    }
    // save the current pattern settings to restore later
    grid.oldPattern = grid.pattern;
    // update the clip pattern
    this.mod("hudPatternAdjust", [layerX, layerY]);
    return this;
  }
  public hudStopPatternAdjust(): FatState {
    this._state.ui.at = UIState.Project;
    this.mod("hudStopPatternAdjust", null);
    return this;
  }
  public hudMouseCursorRotate(): FatState {
    this._state.ui.cursorHandler.cursor = UICursor.Rotate;
    this.mod("hudMouseCursorRotate", null);
    return this;
  }
  public hudMouseCursorFromTool(): FatState {
    this._state.ui.cursorHandler.cursor = this._state.ui.currentToolMouseIcon();
    this.mod("hudMouseCursorFromTool", null);
    return this;
  }
  //#endregion

  //#region Shape Editor
  private _editorFills() {
    // get fill strings from the editor fill ids
    return this._state.shapes.editor.fillIds.map(fid =>
      this._state.fills.getFill(fid)
    );
  }
  public shapeClose(
    pt: Vector2D,
    colors: RGBColor[],
    fillId: FillId[]
  ): FatState {
    this._state.fills.newFills(fillId, colors);
    this._state.shapes.editorCloseShape(pt, fillId[0]);
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    // get fill strings from the editor fill ids
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this._state.ui.shapeEditor.selectMostRecentShape();
    this.mod("shapeClose", [pt, colors, fillId]);
    return this;
  }
  public shapePointAction(pt: Vector2D): FatState {
    this._state.shapes.editorSelectPt(pt);
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this._state.ui.shapeEditor.unselectShape();
    this.mod("shapePointAction", [pt]);
    return this;
  }
  public shapeReverseTo(i: number): FatState {
    this._state.shapes.editorReverseTo(i);
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.mod("shapeReverseTo", [i]);
    return this;
  }
  public shapeSolveAmbiguity(i: number): FatState {
    this._state.shapes.editorSolveAmbiguity(i);
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.mod("shapeSolveAmbiguity", [i]);
    return this;
  }
  public shapeSelectFigure(d: string): FatState {
    // discard current shape if being edited
    this._state.shapes.editorDiscardCurrent();
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    // update the editor ui with the selected shape
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this._state.ui.shapeEditor.selectShape(d);
    this.mod("shapeSelectFigure", [d]);
    return this;
  }
  public shapeDeleteFigure(): FatState {
    this._state.shapes.editorDeleteShape(
      this._state.ui.shapeEditor.selectedShape
    );
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.mod("shapeDeleteFigure", null);
    return this;
  }
  public shapeEditFigure(): FatState {
    this._state.shapes.editorChangeShape(
      this._state.ui.shapeEditor.selectedShape
    );
    // is editing an existing shape ?
    const isExisting = this._state.ui.shapeEditor.isExistingShape;
    this._state.ui.shapeEditor.fromPath(
      this._state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.mod("shapeEditFigure", null);
    return this;
  }
  public shapeFillFigure(): FatState {
    const fillIds = this._state.shapes.editor.fillIds;
    const selectedFillId = fillIds[this._state.ui.shapeEditor.selectedShape];
    const fillObj = this._state.fills.getFillObj(selectedFillId);
    if (!fillObj) {
      // tslint:disable-next-line:no-console
      console.warn(
        "No fill obj found for the selected fill id in shape editor"
      );
      return this;
    }
    this._state.fills.updateEditorWith(selectedFillId);
    this._state.ui.fillEditorFromShapeEditor(fillIds, fillObj);
    this.mod("shapeFillFigure", null);
    return this;
  }
  public shapeFillDone(): FatState {
    this._state.ui.shapeFillDone();
    this.mod("shapeFillDone", null);
    return this;
  }
  public shapeEnterTemplateSelector(): FatState {
    this._state.ui.enterTemplateSelector();
    this.mod("shapeEnterTemplateSelector", null);
    return this;
  }
  public shapeSelectTemplate(tid: number): FatState {
    const p = this._state.shapes.editorNewTemplate(tid);
    this._state.ui.editShape(p);
    this.mod("shapeSelectTemplate", [tid]);
    return this;
  }
  public shapeExitTemplateSelector(): FatState {
    this._state.ui.exitTemplateSelector();
    this.mod("shapeExitTemplateSelector", null);
    return this;
  }
  //#endregion

  //#region Scene
  public sceneCursor(absX: number, absY: number): FatState {
    this._state.currentLayer.updateCursor(absX, absY, this._state.viewport);
    this.mod("sceneCursor", [absX, absY]);
    return this;
  }
  public scenePaint(x: number, y: number): FatState {
    this._state.currentLayer.paintElementAt(x, y);
    this.mod("scenePaint", [x, y]);
    return this;
  }
  public sceneDelete(x: number, y: number): FatState {
    this._state.currentLayer.deleteElementAt(x, y);
    this.mod("sceneDelete", [x, y]);
    return this;
  }
  public sceneMove(deltaX: number, deltaY: number): FatState {
    this._state.viewport.move(deltaX, deltaY);
    this._state.updatePatternsPos();
    this.mod("sceneMove", [deltaX, deltaY]);
    return this;
  }
  public sceneZoom(
    px: number,
    py: number,
    ammount: number,
    cx: number,
    cy: number,
    vx: number,
    vy: number
  ): FatState {
    this._state.viewport.changeZoom(px, py, ammount, cx, cy, vx, vy);
    this._state.updatePatternsPos();
    this.mod("sceneZoom", [px, py, ammount]);
    return this;
  }
  public sceneStopZoom(): FatState {
    this._state.viewport.setLastSize();
    this.mod("sceneZoom", null);
    return this;
  }
  public sceneToggleGrid(): FatState {
    this._state.ui.toolsSubmenus.isGridVisible = !this._state.ui.toolsSubmenus
      .isGridVisible;
    this.mod("sceneToggleGrid", null);
    return this;
  }
  public sceneStartZoom(): FatState {
    this._state.ui.isZooming = true;
    this.mod("sceneStartZoom", null);
    return this;
  }
  //#endregion

  //#region Features
  public exportPrepare(): FatState {
    this._state.ui.exportEditor.at = ExportAt.Preparing;
    this.mod("exportPrepare", null);
    return this;
  }
  public exportDone(fname): FatState {
    this._state.ui.exportEditor.at = ExportAt.Done;
    this._state.ui.exportEditor.fname = fname;
    this.mod("exportDone", [fname]);
    return this;
  }
  public exportError(error): FatState {
    this._state.ui.exportEditor.at = ExportAt.Error;
    this._state.ui.exportEditor.error = error;
    this.mod("exportError", [error]);
    return this;
  }
  public exportImagePreview(canExport: boolean): FatState {
    const repetitions = this._state.ui.exportEditor.patternSize;
    this._state.ui.exportEditor.setPreview(
      this._state.createSVG(repetitions, repetitions)
    );
    this._state.ui.exportEditor.isLoading = false;
    this._state.ui.exportEditor.needsPayment = !canExport;
    this._state.ui.exportEditor.at = ExportAt.Image;
    this.mod("exportImagePreview", [canExport]);
    return this;
  }
  public exportChangeTo(exportAt: number): FatState {
    this._state.ui.exportEditor.at = exportAt;
    if (exportAt === ExportAt.Video) {
      this._state.ui.exportEditor.format = ExportEditorFormat.MP4;
      this._state.ui.exportEditor.size = ExportSize.FullHD;
    } else {
      this._state.ui.exportEditor.format = ExportEditorFormat.SVG;
    }
    this.mod("exportChangeTo", [exportAt]);
    return this;
  }
  public exportFormatChange(fmt: number): FatState {
    this._state.ui.exportEditor.format = fmt;
    this.mod("exportFormatChange", [fmt]);
    return this;
  }
  public exportSizeChange(size: number): FatState {
    this._state.ui.exportEditor.size = size;
    this.mod("exportSizeChange", [size]);
    return this;
  }
  public exportPatternChange(patternSize: number): FatState {
    this._state.ui.exportEditor.setPreview(
      this._state.createSVG(patternSize, patternSize)
    );
    this._state.ui.exportEditor.patternSize = patternSize;
    this.mod("exportPatternChange", [patternSize]);
    return this;
  }
  public publishEnterLicense(
    title: string | null,
    desc: string | null
  ): FatState {
    this._state.ui.enterLicense(title, desc);
    if (title || desc) {
      this.mod("publishEnterLicense", [title, desc]);
    } else {
      this.mod("publishEnterLicense", null);
    }
    return this;
  }
  public publishSetLicense(license: string): FatState {
    this._state.ui.setLicense(license);
    this.mod("publishSetLicense", [license]);
    return this;
  }
  public publishExitLicense(): FatState {
    this._state.ui.exitLicense();
    this.mod("publishExitLicense", null);
    return this;
  }
  public publishStartLoading(): FatState {
    this._state.ui.publishEditor.state = PublishState.Loading;
    this.mod("publishStartLoading", null);
    return this;
  }
  public publishError(msg: string): FatState {
    this._state.ui.publishEditor.state = PublishState.Error;
    this._state.ui.publishEditor.errorMsg = msg;
    this.mod("publishError", [msg]);
    return this;
  }
  public publishSuccess(): FatState {
    this._state.ui.at = UIState.PublishPreview;
    this._state.ui.publishEditor.state = PublishState.Success;
    this._state.ui.publishEditor.errorMsg = "";
    this.mod("publishSuccess", null);
    return this;
  }
  public featuresExit(): FatState {
    this._state.ui.exitingEditor();
    this._state.ui.editorOnBottom();
    this.mod("featuresExit", null);
    return this;
  }
  public featuresClose(): FatState {
    this._state.ui.closeFeatures();
    this._state.ui.editorStopAnim();
    this.mod("featuresClose", null);
    return this;
  }
  //#endregion
}
