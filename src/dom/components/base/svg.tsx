export interface ISVGProps {
	className?: string;
	style?: string;
	margin?: number;
	zoom?: number;
	size: number;
	children: any;
}

export const SVG = (props: ISVGProps) => {
	const m = props.margin === undefined ? 10 : props.margin;
	const dimension = props.zoom !== 0 && props.zoom !== undefined
	                ? `${props.size * props.zoom}px` : `${props.size}px`;
	return (
		<svg
			version={'1.1'}
			baseProfile={'basic'}
			xmlns={'http://www.w3.org/2000/svg'}
			width={dimension}
			height={dimension}
			className={`${props.className || ''}`}
			style={props.style}
			viewBox={`${-m / 2} ${-m / 2} ${props.size + m} ${props.size + m}`}
		>
			{props.children}
		</svg>
	);
};
