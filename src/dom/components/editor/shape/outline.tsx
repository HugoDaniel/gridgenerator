export interface IShapeOutlineProps {
	paths: string[];
	resolution?: number;
	rotation?: number;
	className?: string;
	stroke?: string;
	fill?: string;
}
const outlineStroke = 32;
const halfStroke = outlineStroke / 2;
function renderPaths(paths: string[], strokeColor: string, fillColor: string, strokeWidth: number) {
	const result: any[] = [];
	for (let i = 0; i < paths.length; i++) {
		result.push(
			<path
				d={paths[i]}
				stroke={strokeColor}
				fill={fillColor}
				stroke-width={strokeWidth}
			/>
		);
	}
	return result;
}
export const ShapeOutline = (props: IShapeOutlineProps) => {
	const res = props.resolution || 512 + halfStroke;
	const stroke = props.stroke || '#111111';
	const fill = props.fill || 'transparent';
	return (
	<svg
		version={'1.1'}
		baseProfile={'basic'}
		xmlns={'http://www.w3.org/2000/svg'}
		viewBox={`${-halfStroke} ${-halfStroke} ${res + halfStroke} ${res + halfStroke}`}
		className={`ShapeOutline transition-transform ${props.className || ''}`}
		style={{ transform: `rotate(${2 * Math.PI * (props.rotation || 0)}rad)` }}>
		{ renderPaths(props.paths, stroke, fill, outlineStroke) }
	</svg>);
};
