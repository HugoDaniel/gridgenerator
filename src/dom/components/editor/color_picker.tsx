import { Component } from 'inferno';
import { FillId, UIFillEditor } from '../../../data';
import { Runtime, RuntimeMediaSize } from '../../../engine';
import { ColorPickerEvents } from '../../events/color_picker_events';
import { Button, IButtonProps } from '../base/buttons';
import { ColorCanvas, IColorCanvasProps } from './color_picker/canvas';
import { ColorShapes, IColorShapesProps } from './color_picker/color_shapes';
import { IModeMenuProps, ModeMenu } from './color_picker/mode_menu';
import { IRecentColorsProps, RecentColors } from './color_picker/recent';
import { ISystemPickerBtnProps, SystemPickerBtn } from './color_picker/system';
import { FiguresMenu, IFiguresMenuProps } from './shape/figures_menu';

export interface IColorPickerProps {
	className?: string;
	style?: object;
	fillEditor: UIFillEditor;
	colorPickerEvents: ColorPickerEvents;
	runtime: Runtime;
	onShapePathSelect: (fillId: FillId) => void;
	onPrimary: () => void;
}
function needsVertExpansion(isInPortrait: boolean, size: RuntimeMediaSize): boolean {
	return (size === RuntimeMediaSize.Normal && isInPortrait);
}
function needsHorizExpansion(isInPortrait: boolean, size: RuntimeMediaSize): boolean {
	return (!isInPortrait && size !== RuntimeMediaSize.Large);
}

export const ColorPicker = (props: IColorPickerProps) => {
	const
		{ fillEditor, colorPickerEvents, runtime, className,
			style
		}: IColorPickerProps = props;
	const shapes = fillEditor.paths;
	const label = fillEditor.primaryActionTitle;
	const primaryVisible = runtime.device.mediaSize !== RuntimeMediaSize.Normal;
	// update the size of the elements if there
	// is not enough screen space available
	const isShort = runtime.device.isShort;
	let size = 320;
	let shapeSize = 3;
	if (isShort) {
		size = 250;
		// ^ color picker size is now 250 px
		shapeSize = 2;
		// ^ the shape selector is now w2 h2 in size
	}
	const canvasStyleSize = size;
	const shapeMenuSize = `h3 w3 h4-l w4-l`;
	const colorCanvasProps: IColorCanvasProps = {
		className: 'transition-wh',
		size,
		onCanvasInit: colorPickerEvents.onColorCanvasInit,
		onCanvasUnmount: colorPickerEvents.onColorCanvasUnmount,
		style: { width: `${canvasStyleSize}px`, height: `${canvasStyleSize}px` }
	};
	const systemPickerProps: ISystemPickerBtnProps = {
		className: `${runtime.device.hasSystemColorPicker ? 'dn' : 'absolute w3 h3 br-100'}`,
		style: { transform: 'translateY(-2rem)' },
		onColorPick: colorPickerEvents.onColorPick,
		color: fillEditor.selectedFillString()
	};
	const modeMenuProps: IModeMenuProps = {
		className: `h3`,
		isVertical: false,
		onAction: colorPickerEvents.onModeChange,
		menu: fillEditor.colorMenu
	};
	const colorShapesProps: IColorShapesProps = {
		className: `${shapeMenuSize} transition-wh`,
		onAction: props.onShapePathSelect,
		resolution: fillEditor.templateRes,
		shapesPaths: shapes,
		templatePath: fillEditor.templatePath,
		selected: fillEditor.selected
	};
	const fillPaths = fillEditor.fillPaths;
	const figMenuProps: IFiguresMenuProps = {
		className: 'center mw-70',
		fills: fillPaths[0],
		shapes: fillPaths[1],
		resolution: fillEditor.templateRes,
		selected: fillPaths[2],
		isNotSmall: true,
		onEnterTemplateSelector: () => 0,
		onFigureAction: (data) => {
			const fid = fillEditor.fidByPos(data.index);
			if (!fid) {
				return;
			}
			props.onShapePathSelect(fid);
		}
	};
	// <Button {...btnProps} />
	return (
		<div
			className={`ColorPicker ${className || ''} flex justify-center items-start editormw editor-shadow h-100-ns pr5-ns`}
			style={style || {}}
		>
			<div className={'flex flex-column justify-center items-center'}>
				<ColorCanvas {...colorCanvasProps} />
				<SystemPickerBtn {...systemPickerProps} />
				<ModeMenu {...modeMenuProps} />
				<div
					className="center mt4-ns"
				>
					<ColorShapes {...colorShapesProps} />
				</div>
				{ fillPaths[0].length > 1 ?
					<FiguresMenu {...figMenuProps} /> : <div/>
				}
				<RecentColors
					className="fixed bottom-0 left-0 flex flex-column-reverse items-center justify-center h-100 w2 w3-ns overflow-hidden"
					hexValues={fillEditor.mruColors}
					onColorSelect={colorPickerEvents.onColorPick}
				/>
			</div>
		</div>
	);
};
