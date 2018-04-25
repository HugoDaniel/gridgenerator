import { CanvasContext, WebGLContext } from '../../engine';
import Canvas, { ICanvasProps } from './base/canvas';
export interface ISceneProps {
	className?: string;
	style?: string;
	width: number;
	height: number;
	onContext: (ctx: WebGLContext | CanvasContext) => void;
}
export const Scene = (props: ISceneProps) => {
	const canvasProps: ICanvasProps = {
		is3D: true,
		offscreen: false,
		className: props.className,
		onContext: props.onContext,
		height: props.height,
		width: props.width
	};
	return (
		<Canvas {...canvasProps} />
	);
};
