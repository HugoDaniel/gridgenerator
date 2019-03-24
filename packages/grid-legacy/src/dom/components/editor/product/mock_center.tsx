export interface IMockPosterCenterProps {
	className?: string;
	preview: string;
	viewBox: string;
	previewW: number;
	previewH: number;
	previewX: number;
	previewY: number;
	ratio: number;
}
export const MockPosterCenter = (props: IMockPosterCenterProps) => {
	const x = 6 + ((500 - 354) / 2);
	const use = {
		'xlink:href': '#art',
		'width': props.previewW,
		'height': props.previewH,
		'x': x + props.previewX,
		'y': 6 + props.previewY,
		'className': 'pointer'
	};
	const clip = {
		'clip-path': 'url(#rectClip)'
	};
	const extra = {
		'shape-rendering': 'crispEdges'
	};
	return (
		<svg
			className={props.className}
			version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
			viewBox="0 0 512 512"
			style={ {'enable-background': 'new 0 0 512 512'} }
		>
			<style type="text/css">{`
				.st3{fill: none;stroke:#00AEEF;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;stroke-dasharray:12,12,12,12,12,12;}
			`}
			</style>
			<clipPath id="rectClip">
				<rect x={x} y={6} className="st3"  width={354} height={500} />
			</clipPath>
			<rect id="posterDrawArea" x={x} y={6} className="st3" width={354} height={500} />
			<symbol id="art" viewBox={props.viewBox} {...extra}
				dangerouslySetInnerHTML={ { __html: props.preview } }
			/>
			<g {...clip}>
				<use {...use} />
			</g>
		</svg>
	);
};

export interface IMockTShirtCenterProps {
	className?: string;
	preview: string;
	viewBox: string;
	previewW: number;
	previewH: number;
	previewX: number;
	previewY: number;
}
export const MockTShirtCenter = (props: IMockTShirtCenterProps) => {
	const areaX = 122;
	const areaY = 100;
	const use = {
		'xlink:href': '#art',
		'width': props.previewW,
		'height': props.previewH,
		'x': areaX + props.previewX,
		'y': areaY + props.previewY,
		'className': 'pointer'
	};
	const clip = {
		'clip-path': 'url(#rectClip)'
	};
	const extra = {
		'shape-rendering': 'crispEdges'
	};
	return (
	<svg
		className={props.className}
		version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
		viewBox="0 0 512 512"
		style={ {'enable-background': 'new 0 0 512 512'} }
	>
		<style type="text/css">{`
			.st0{fill: #FFFFFF;stroke:#808285;stroke-width:2;stroke-miterlimit:10;}
			.st1{fill: #FFFFFF;stroke:#808285;stroke-width:1.1027;stroke-miterlimit:10;}
			.st2{fill: none;stroke:#808285;stroke-width:1.1027;stroke-miterlimit:10;}
			.st3{fill: none;stroke:#00AEEF;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;stroke-dasharray:12,12,12,12,12,12;}
		`}
		</style>
		<clipPath id="rectClip">
			<rect x={areaX} y={areaY} className="st3" width="264" height="352"/>
		</clipPath>
		<path id="XMLID_8_" className="st0" d="M405.6,235.3c-4.6-4.6-5.3-31.5-15-34.4c-9.7,16.6,2.3,249.6-1.4,259.1
			c-2.8,22.2-135.1,49.6-259.8,14.3c-5.5-1.9-15.5-4.2-18.3-9.2c5.4-20.1,12.8-206.7,2.7-255.3c-4.7,7-8.3,15.3-14.1,21.6
			c0,0-51.3,4.2-86.6-33.3c0,0,23.6-61.7,31.9-79c3.8-12.4,9.5-24.8,16.4-35.8c12.6-20,29.8-28.1,52.2-33.6
			c61.7-15.8,69-29.6,87.3-37.3c6.2,9,29.7,15.2,45,16.6c35.3,3.5,65.9-17.8,66.5-17.3c5.5,4.2,15.3,10.9,21.5,13.9
			c26.2,12.6,56.3,13.6,82,27.5c0,0,34.4,8.5,54.5,79.9l27.7,70.7C498,203.7,467.7,242.7,405.6,235.3z"/>
		<path id="XMLID_7_" className="st1" d="M87.1,58.2c0,0,29.6,94.6,26.6,151.6"/>
		<path id="XMLID_6_" className="st1" d="M422.4,56.1c0,0-32.6,96.3-31.9,144.8"/>
		<path id="XMLID_5_" className="st2" d="M182.7,22.8c2.8,12.5,17.3,39.5,58.9,42.3c58.2,1.4,79.7-35.7,82.4-45"/>
		<path id="XMLID_4_" className="st2" d="M191.8,16.6c2.8,12.5,14.5,36.7,58.2,38.1c48.5-3.5,63.7-30.2,66.5-39.5"/>
		<path id="XMLID_3_" className="st1" d="M402.4,224.4c0,0,54.7,6.9,91.4-33.9"/>
		<path id="XMLID_2_" className="st1" d="M18.6,182.2c0,0,11.1,33.9,87.3,39.5"/>
		<path id="XMLID_1_" className="st1" d="M112.1,451.7c0,0,155.9,63.7,279.2-2.1"/>
		<rect id="tshirtDrawArea" x={areaX} y={areaY} className="st3" width="264" height="352"/>
		<symbol id="art" viewBox={props.viewBox} {...extra}
			dangerouslySetInnerHTML={ { __html: props.preview } }
		/>
		<g {...clip}>
			<use {...use} />
		</g>
	</svg>);
};
