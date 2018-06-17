import { linkEvent } from 'inferno';

export interface IShapePointAttribs {
	x: number;
	y: number;
	isOtherEdge?: boolean;
	isCurrentEdge?: boolean;
	isClickable?: boolean;
	isActive?: boolean;
}
export interface IShapePointProps {
	pointAttribs: IShapePointAttribs;
	onAction: ((e: IShapePointAttribs) => void) | null;
}

function genKey(a: IShapePointAttribs, def?: string): string {
	if (!a && def) {
		return def;
	}
	return `${a.x},${a.y}`;
}

export const ShapePoint = (props: IShapePointProps) => {
	if (props.pointAttribs.isOtherEdge) {
		// draw the "ok" icon on the other edge
		// this icon closes the path and adds it to the shapes list
		return (
			<g
				key={genKey(props.pointAttribs, `isOtherEdge`)}
				ontouchstart={props.onAction ? linkEvent(props.pointAttribs, props.onAction) : props.onAction}
				onClick={props.onAction ? linkEvent(props.pointAttribs, props.onAction) : props.onAction}
				style={
					{ transform: `translate(${props.pointAttribs.x - 10}px, ${props.pointAttribs.y - 10}px)`
					, cursor: 'pointer'
					, width: '1rem'
					, height: '1rem'
					, background: 'red'
					}
				}
			>
				<svg
					version={'1.1'}
					xmlns={'http://www.w3.org/2000/svg'}
					viewBox={'0 0 64 63.998'}
					width={'20px'}
					height={'20px'}
				>
					<path
						fill={'#88C057'}
						d={'M32,0C14.327,0,0,14.322,0,31.999c0,17.669,14.327,31.999,32,31.999s32-14.33,32-31.999 C64,14.322,49.673,0,32,0z'}
					/>
					<path
						fill={'#FFFFFF'}
						d={'M45.428,22.571c-0.776-0.775-2.033-0.775-2.81,0 L28.001,37.189l-6.618-6.618c-0.775-0.775-2.033-0.775-2.809,0c-0.776,0.775-0.776,2.033,0,2.81l7.803,7.803 c0.061,0.083,0.122,0.166,0.197,0.241c0.394,0.394,0.911,0.586,1.427,0.58c0.516,0.006,1.033-0.187,1.427-0.58 c0.076-0.076,0.139-0.161,0.2-0.245l15.8-15.8C46.203,24.605,46.203,23.347,45.428,22.571z'}
					/>
				</svg>
			</g>
		);
	}
	let cx = 'ShapePoint transition-o ';
	if (props.pointAttribs.isCurrentEdge) {
		cx += 'orange-fill dark-blue-stroke ';
	} else if (props.pointAttribs.isActive) {
		cx += `orange-fill ${props.pointAttribs.isClickable ? 'dark-gray-stroke pointer' : 'no-stroke'} `;
	} else if (props.pointAttribs.isClickable) {
		cx += 'light-gray-fill dark-gray-stroke hover-orange-stroke pointer o-100';
	} else {
		cx += 'light-gray-fill dark-gray-stroke o-10';
	}
	const _action = props.pointAttribs.isClickable && props.onAction
		? linkEvent(props.pointAttribs, props.onAction)
		: null;
	const centerx = props.pointAttribs.x;
	const centery = props.pointAttribs.y;
	return (
				<circle
					key={genKey(props.pointAttribs, `c(${centerx},${centery})`)}
					className={cx}
					cx={centerx}
					cy={centery}
					r={6}
					stroke-width={2}
					onClick={_action}
				/>
	);
};
/*
			onClick={props.pointAttribs.isClickable
				? linkEvent(props.pointAttribs, props.onAction)
				: null}
*/
