import { State } from "./state";
import { RGBColor } from "./state/color/rgb";
import { Vector2D } from "./state/math/vector";
import { GridType } from "./state/layer/grid";
import { TilePattern } from "./state/layer/tile_pattern";
import { FillId } from "./state/fill_map";
import { ShapeId } from "./state/shape_map";
import { ShapeFillSetId } from "./state/shape/shape";
import { UIState } from "./state/ui";
import { UICursor } from "./state/ui/cursor";
import { PublishState } from "./state/ui/publish";
import { ClipPattern } from "./state/ui/clip_pattern";
import { UIFillEditor, UIFillEditorMode } from "./state/ui/fill_editor";
import { UIFillEditorColorMode, ToolsMenuId } from "./state/ui/defaults";
import { ExportAt, ExportEditorFormat, ExportSize } from "./state/ui/export";
import { Fat } from "fatstate";

class GridStateActions {
  public state: State;
  constructor(s?: State) {
    if (s) {
      this.state = s;
    } else {
      this.state = new State();
    }
  }
  //#region Color Picker
  private updateSelectedColor(): void {
    if (this.state.ui.at === UIState.ShapeEditor) {
      // get values from editor
      const shapeIndex = this.state.ui.shapeEditor.selectedShape;
      const fillId = this.state.shapes.editor.fillIds[shapeIndex];
      const fillIdString = this.state.fills.updateFromEditor(fillId);
      this.state.ui.fillEditor.updateSelected(fillIdString);
      this.state.ui.shapeEditor.updateFill(fillIdString);
    } else {
      // get values from shape
      const shape = this.state.selectedShape;
      const fillIdString = this.state.fills.updateFromEditor(
        shape.selectedPathFillId
      );
      this.state.ui.updateSelectedFill(
        this.state.fills.buildSVG(shape.resolution, shape.getSelectedFills()),
        fillIdString
      );
    }
  }
  public colorPickerSelectColor(slice: number): void {
    this.state.fills.colors.editorSelectColor(slice);
    this.updateSelectedColor();
  }
  public colorPickerMoveWheel(angle: number) {
    this.state.fills.colors.moveWheel(angle);
    this.updateSelectedColor();
  }
  public colorPickerModeChange(mode: UIFillEditorColorMode) {
    this.state.fills.colors.modeChange(UIFillEditor.toColorEditorMode(mode));
    this.state.ui.fillEditor.colorMenuMode(mode);
  }
  public colorPickerSystem(hex: string) {
    this.state.fills.colors.editorColorPick(hex);
    this.updateSelectedColor();
  }
  public colorPickerSelectFillId(fillId: number) {
    if (this.state.ui.at === UIState.ShapeEditor) {
      // get values from editor
      const index = this.state.shapes.editor.fillIds.indexOf(fillId);
      this.state.ui.shapeEditor.selectedShape = index;
    } else {
      // set the selected fill id in the shape:
      this.state.shapes.setShapeFillId(this.state.selectedShapeId, fillId);
    }
    // update the UI selected fillId
    this.state.ui.fillEditor.selected = fillId;
    // change the fills map selected id
    this.state.fills.selectFillId(fillId);
    this.updateSelectedColor();
  }
  public colorPickerEnterCode() {
    this.state.ui.fillEditor.editorMode = UIFillEditorMode.Code;
    const fid = this.state.ui.fillEditor.selected;
    const color = this.state.fills.getFillObj(fid);
    if (!color) {
      // tslint:disable-next-line:no-console
      console.warn(
        "Could not get the fill obj(color) for the selected fill id when entering Color Code"
      );
      return this;
    }
    this.state.ui.fillEditor.colorCode = color;
  }
  public colorPickerExitCode() {
    this.state.ui.fillEditor.editorMode = UIFillEditorMode.Color;
  }
  public colorPickerSaveCode(hex: string) {
    this.state.ui.fillEditor.editorMode = UIFillEditorMode.Color;
    this.state.fills.colors.editorColorPick(hex);
    this.updateSelectedColor();
  }
  //#endregion
  //#region HUD
  public async hudEnterFeature(feature: string) {
    this.state.ui.enterFeature(
      feature,
      this.state.currentLayer,
      this.state.layerShapeOutline,
      this.state.layerShapeRes
    );
    this.state.ui.enteringEditor();
  }
  public hudEnterEditShape() {
    // get the path for the current selected shapeId/fillId
    const p = this.state.shapes.editShape(this.state.ui.shapesMenu.selected);
    // get fill strings from the editor fill ids
    this.state.ui.editShape(p, this._editorFills(), true);
    // true because the editor is for an existing shape ^
    this.state.ui.enteringEditor();
  }
  public hudEnterNewShape() {
    const p = this.state.shapes.newShape(this.state.currentLayerType);
    this.state.ui.editShape(p);
    this.state.ui.enteringEditor();
  }
  public hudDiscardNewShape() {
    // remove the created fills
    for (let i = 0; i < this.state.shapes.editor.fillIds.length; i++) {
      this.state.fills.deleteFill(this.state.shapes.editor.fillIds[i]);
    }
    this.state.ui.exitingEditor();
    this.state.ui.editorOnBottom();
  }
  public hudDiscardEditedShape() {
    this.state.ui.exitingEditor();
    this.state.ui.editorOnBottom();
  }
  public hudEnterNewFill(
    shapeFillSetId: number,
    newFillIds: number[],
    colors: RGBColor[]
  ): void {
    // set the new fill id's colors
    this.state.fills.newFills(newFillIds, colors);
    // set the new fills in the new shape fillset id
    const shape = this.state.selectedShape;
    shape.addNewFills(newFillIds, shapeFillSetId);
    // update the current selected editor
    this.state.fills.updateEditorWith(shape.selectedPathFillId);
    // set the UI state
    this.state.ui.newFill(
      this.state.selectedShape,
      this.state.fills.buildShapeSVG(this.state.selectedShape),
      this.state.fills
    );
    this.state.ui.enteringEditor();
  }
  public hudUIExitingEditor(): void {
    this.state.ui.exitingEditor();
  }
  public hudUIEnteringEditor(): void {
    this.state.ui.enteringEditor();
  }
  public hudUIEditorOnTop(): void {
    this.state.ui.editorOnTop();
    this.state.ui.editorStopAnim();
  }
  public hudUIEditorOnBottom(): void {
    this.state.ui.editorOnBottom();
  }
  public hudUICloseNewFill(): void {
    const shape = this.state.selectedShape;
    const rot = this.state.layers.getSelected().selectedRot;
    this.state.ui.closeNewFill(
      shape,
      rot,
      this.state.fills.buildShapeSVG(shape)
    );
    // ^ changes the ui.at state
    this.state.ui.editorStopAnim();
  }
  public hudUICloseNewShape(): void {
    this.state.ui.closeNewShape();
    // ^ changes the ui.at state
    this.state.ui.editorStopAnim();
  }
  public hudDiscardNewFills(): void {
    this.state.fills.discardNewFills();
    this.state.selectedShape.discardNewFill();
    this.state.ui.exitingEditor();
    this.state.ui.editorOnBottom();
  }
  public hudSaveNewFills(): void {
    // update the layer info:
    const grid = this.state.layers.getSelected();
    const shape = this.state.shapes.getShapeById(grid.selectedShape);
    if (!shape) {
      throw new Error(
        `HUD: Cannot save fills for shapeId ${grid.selectedShape}`
      );
    }
    const fillId = shape.selectedFillSet;
    grid.selectFill(fillId);
    this.state.ui.exitingEditor();
    this.state.ui.editorOnBottom();
  }
  public hudSaveShape(
    type: GridType,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    newFillIds: number[]
  ): void {
    // the current selected layer to update
    const grid = this.state.layers.getSelected();
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    // is editing an existing shape ?
    if (isExisting) {
      this._hudUpdateShape(type, shapeId, shapeFillId, newFillIds);
    } else {
      // save the current editing shape
      const shape = this.state.shapes.saveNewShape(type, shapeId, shapeFillId);
      grid.addNewShape(shapeId, shapeFillId);
      // update the shapes menu and fills menu
      this.state.ui.refreshMenus(
        grid,
        this.state.shapes,
        this.state.fills.buildShapeSVG(shape)
      );
      // return to the project editing
      this.state.ui.exitingEditor();
      this.state.ui.editorOnBottom();
    }
  }
  private _hudUpdateShape(
    type: GridType,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    newFillIds: number[]
  ) {
    // the current selected layer to update
    const grid = this.state.layers.getSelected();
    // analyze the new shape and return the transformations that need to be performed
    const changes = this.state.shapes.getShapeChanges(shapeId);
    // get the fill ids that need to be duplicated
    const dupsNeeded = this.state.shapes.getNeededDups(shapeId, changes);
    // duplicate the fillIds and create a map of duplicates
    const dups = this.state.fills.duplicateMany(
      dupsNeeded.fillIds,
      newFillIds,
      dupsNeeded.size
    );
    // update the current editing shape
    const shape = this.state.shapes.saveUpdatedShape(
      type,
      shapeId,
      shapeFillId,
      dups,
      changes
    );
    // update the shapes menu and fills menu
    this.state.ui.refreshMenus(
      grid,
      this.state.shapes,
      this.state.fills.buildShapeSVG(shape)
    );
    // return to the project editing
    this.state.ui.exitingEditor();
    this.state.ui.editorOnBottom();
  }
  public hudSaveUpdatedShape(
    type: GridType,
    shapeId: ShapeId,
    shapeFillId: ShapeFillSetId,
    newFillIds: number[]
  ): void {
    this._hudUpdateShape(type, shapeId, shapeFillId, newFillIds);
  }
  public hudSelectShape(shapeId: ShapeId): void {
    // check if the shape exists
    const shape = this.state.shapes.getShapeById(shapeId);
    if (!shape) {
      throw new Error(`HUD: Cannot select shape with shapeId ${shapeId}`);
    }
    // set it as selected in the current layer
    const grid = this.state.layers
      .getSelected()
      .selectShape(shapeId, shape.selectedFillSet);
    // change to paint mode
    this.state.ui.selectTool(ToolsMenuId.Paint);
    // update the shapes menu and fills menu
    this.state.ui.refreshMenus(
      grid,
      this.state.shapes,
      this.state.fills.buildShapeSVG(shape)
    );
  }
  public hudRotateShape(): void {
    const layer = this.state.layers.getSelected();
    const shapeId = layer.selectedShape;
    // check if the shape exists
    const shape = this.state.shapes.getShapeById(shapeId);
    if (!shape) {
      throw new Error(`HUD: Cannot rotate shape with shapeId ${shapeId}`);
    }
    // rotate it in the current layer
    const rotation = layer.rotateSelected();
    // update the shapes menu and fills menu
    this.state.ui.refreshMenus(
      layer,
      this.state.shapes,
      this.state.fills.buildShapeSVG(shape)
    );
  }
  public hudSelectFill(fillId: ShapeFillSetId): void {
    // get selected layer and shape id
    const grid = this.state.layers.getSelected();
    const shape = this.state.shapes.getShapeById(grid.selectedShape);
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
    this.state.ui.refreshMenus(
      grid,
      this.state.shapes,
      this.state.fills.buildShapeSVG(shape)
    );
  }
  public hudSelectTool(toolId: ToolsMenuId): void {
    this.state.ui.selectTool(toolId);
  }
  public hudClearAll(): void {
    // this.state.ui.selectTool(toolId);
    this.state.layers.getSelected().clear();
  }
  public hudTogglePattern(): void {
    this.state.ui.toolsSubmenus.isGridPatternOn = !this.state.ui.toolsSubmenus
      .isGridPatternOn;
    if (!this.state.ui.toolsSubmenus.isGridPatternOn) {
      // remove pattern
      this.state.layers.getSelected().pattern = null;
    }
  }
  public hudNewPattern(cx: number, cy: number): void {
    const grid = this.state.layers.getSelected();
    // restore the previous pattern configuration if present
    if (grid.oldPattern) {
      grid.pattern = grid.oldPattern;
    } else {
      grid.pattern = new TilePattern(cx - 1, cy - 1, cx + 1, cy + 1);
    }
    const lid = this.state.layers.selectedLayerId;
    const clip = new ClipPattern(grid.pattern);
    this.state.ui.patterns.set(lid, clip);
  }
  public hudUpdatePatternPos(): void {
    this.state.updatePatternsPos();
  }
  public hudStartPatternAdjust(startPos: boolean): void {
    if (startPos) {
      this.state.ui.at = UIState.PatternAdjustStart;
    } else {
      this.state.ui.at = UIState.PatternAdjustEnd;
    }
  }
  public hudPatternAdjust(layerX: number, layerY: number): void {
    const grid = this.state.currentLayer;
    // check which pattern position is being adjusted (start or end ?)
    if (this.state.ui.at === UIState.PatternAdjustEnd) {
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
    const lid = this.state.layers.selectedLayerId;
    const clip = this.state.ui.patterns.get(lid);
    if (clip && grid.pattern) {
      clip.gridPattern = grid.pattern;
      this.state.ui.patterns.set(lid, clip);
    }
    // save the current pattern settings to restore later
    grid.oldPattern = grid.pattern;
    // update the clip pattern
  }
  public hudStopPatternAdjust(): void {
    this.state.ui.at = UIState.Project;
  }
  public hudMouseCursorRotate(): void {
    this.state.ui.cursorHandler.cursor = UICursor.Rotate;
  }
  public hudMouseCursorFromTool(): void {
    this.state.ui.cursorHandler.cursor = this.state.ui.currentToolMouseIcon();
  }
  //#endregion
  //#region Shape Editor
  private _editorFills() {
    // get fill strings from the editor fill ids
    return this.state.shapes.editor.fillIds.map(fid =>
      this.state.fills.getFill(fid)
    );
  }
  public shapeClose(pt: Vector2D, colors: RGBColor[], fillId: FillId[]) {
    this.state.fills.newFills(fillId, colors);
    this.state.shapes.editorCloseShape(pt, fillId[0]);
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    // get fill strings from the editor fill ids
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.state.ui.shapeEditor.selectMostRecentShape();
  }
  public shapePointAction(pt: Vector2D) {
    this.state.shapes.editorSelectPt(pt);
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.state.ui.shapeEditor.unselectShape();
  }
  public shapeReverseTo(i: number) {
    this.state.shapes.editorReverseTo(i);
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
  }
  public shapeSolveAmbiguity(i: number) {
    this.state.shapes.editorSolveAmbiguity(i);
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
  }
  public shapeSelectFigure(d: string) {
    // discard current shape if being edited
    this.state.shapes.editorDiscardCurrent();
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    // update the editor ui with the selected shape
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
    this.state.ui.shapeEditor.selectShape(d);
  }
  public shapeDeleteFigure() {
    this.state.shapes.editorDeleteShape(
      this.state.ui.shapeEditor.selectedShape
    );
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
  }
  public shapeEditFigure() {
    this.state.shapes.editorChangeShape(
      this.state.ui.shapeEditor.selectedShape
    );
    // is editing an existing shape ?
    const isExisting = this.state.ui.shapeEditor.isExistingShape;
    this.state.ui.shapeEditor.fromPath(
      this.state.shapes.editor,
      this._editorFills(),
      isExisting
    );
  }
  public shapeFillFigure() {
    const fillIds = this.state.shapes.editor.fillIds;
    const selectedFillId = fillIds[this.state.ui.shapeEditor.selectedShape];
    const fillObj = this.state.fills.getFillObj(selectedFillId);
    if (!fillObj) {
      // tslint:disable-next-line:no-console
      console.warn(
        "No fill obj found for the selected fill id in shape editor"
      );
      return;
    }
    this.state.fills.updateEditorWith(selectedFillId);
    this.state.ui.fillEditorFromShapeEditor(fillIds, fillObj);
  }
  public shapeFillDone() {
    this.state.ui.shapeFillDone();
  }
  public shapeEnterTemplateSelector() {
    this.state.ui.enterTemplateSelector();
  }
  public shapeSelectTemplate(tid: number) {
    const p = this.state.shapes.editorNewTemplate(tid);
    this.state.ui.editShape(p);
  }
  public shapeExitTemplateSelector() {
    this.state.ui.exitTemplateSelector();
  }
  //#endregion
  //#region Scene
  public sceneCursor(absX: number, absY: number): void {
    this.state.currentLayer.updateCursor(absX, absY, this.state.viewport);
  }
  public scenePaint(x: number, y: number): void {
    this.state.currentLayer.paintElementAt(x, y);
  }
  public sceneDelete(x: number, y: number): void {
    this.state.currentLayer.deleteElementAt(x, y);
  }
  public sceneMove(deltaX: number, deltaY: number): void {
    this.state.viewport.move(deltaX, deltaY);
    this.state.updatePatternsPos();
  }
  public sceneZoom(
    px: number,
    py: number,
    ammount: number,
    cx: number,
    cy: number,
    vx: number,
    vy: number
  ): void {
    this.state.viewport.changeZoom(px, py, ammount, cx, cy, vx, vy);
    this.state.updatePatternsPos();
    // this.mod("sceneZoom", [px, py, ammount]);
  }
  public sceneStopZoom(): void {
    this.state.viewport.setLastSize();
  }
  public sceneToggleGrid(): void {
    this.state.ui.toolsSubmenus.isGridVisible = !this.state.ui.toolsSubmenus
      .isGridVisible;
  }
  public sceneStartZoom(): void {
    this.state.ui.isZooming = true;
  }
  //#endregion
  //#region Features
  public exportPrepare(): void {
    this.state.ui.exportEditor.at = ExportAt.Preparing;
  }
  public exportDone(fname): void {
    this.state.ui.exportEditor.at = ExportAt.Done;
    this.state.ui.exportEditor.fname = fname;
  }
  public exportError(error): void {
    this.state.ui.exportEditor.at = ExportAt.Error;
    this.state.ui.exportEditor.error = error;
  }
  public exportImagePreview(canExport: boolean): void {
    const repetitions = this.state.ui.exportEditor.patternSize;
    this.state.ui.exportEditor.setPreview(
      this.state.createSVG(repetitions, repetitions)
    );
    this.state.ui.exportEditor.isLoading = false;
    this.state.ui.exportEditor.needsPayment = !canExport;
    this.state.ui.exportEditor.at = ExportAt.Image;
  }
  public exportChangeTo(exportAt: number): void {
    this.state.ui.exportEditor.at = exportAt;
    if (exportAt === ExportAt.Video) {
      this.state.ui.exportEditor.format = ExportEditorFormat.MP4;
      this.state.ui.exportEditor.size = ExportSize.FullHD;
    } else {
      this.state.ui.exportEditor.format = ExportEditorFormat.SVG;
    }
  }
  public exportFormatChange(fmt: number): void {
    this.state.ui.exportEditor.format = fmt;
  }
  public exportSizeChange(size: number): void {
    this.state.ui.exportEditor.size = size;
  }
  public exportPatternChange(patternSize: number): void {
    this.state.ui.exportEditor.setPreview(
      this.state.createSVG(patternSize, patternSize)
    );
    this.state.ui.exportEditor.patternSize = patternSize;
  }
  public publishEnterLicense(title: string | null, desc: string | null): void {
    this.state.ui.enterLicense(title, desc);
  }
  public publishSetLicense(license: string): void {
    this.state.ui.setLicense(license);
  }
  public publishExitLicense(): void {
    this.state.ui.exitLicense();
  }
  public publishStartLoading(): void {
    this.state.ui.publishEditor.state = PublishState.Loading;
  }
  public publishError(msg: string): void {
    this.state.ui.publishEditor.state = PublishState.Error;
    this.state.ui.publishEditor.errorMsg = msg;
  }
  public publishSuccess(): void {
    this.state.ui.at = UIState.PublishPreview;
    this.state.ui.publishEditor.state = PublishState.Success;
    this.state.ui.publishEditor.errorMsg = "";
  }
  public featuresExit(): void {
    this.state.ui.exitingEditor();
    this.state.ui.editorOnBottom();
  }
  public featuresClose(): void {
    this.state.ui.closeFeatures();
    this.state.ui.editorStopAnim();
  }
  //#endregion
}
const state = Fat.init(new GridStateActions(), State.toJSON, State.fromJSON);
export type StateActions = typeof state;

export function createState(): StateActions {
  return Fat.init(new GridStateActions(), State.toJSON, State.fromJSON);
}
