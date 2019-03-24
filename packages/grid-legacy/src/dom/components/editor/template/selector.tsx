import { linkEvent } from 'inferno';
import { Template } from '../../../../data';

export interface ITemplateSelectorProps {
	className?: string;
	templates: Template[];
	margin: number;
	bg: string;
	bghover: string;
	stroke: string;
	onTemplateSelect: (tid: number) => void;
}
export const TemplateSelector = (props: ITemplateSelectorProps) =>
<nav className={`TemplateSelector ${props.className || ''} list flex flex-wrap bg-near-white ph2 pv3 flex-column-ns items-center-ns justify-center-ns pv0-ns ph0-ns mt3-ns`}>
	{props.templates.map((t, tid) => {
		const maxLen = t.resolution + props.margin;
		return (
		<li className="list-item link pointer dim ph1">
			<svg
				className="w4 h4"
				version={'1.1'}
				baseProfile={'basic'}
				xmlns={'http://www.w3.org/2000/svg'}
				viewBox={`-${props.margin / 2} -${props.margin / 2} ${maxLen} ${maxLen}`}
				onClick={linkEvent(tid, props.onTemplateSelect)}
			>
				<rect
					x={-props.margin / 2}
					y={-props.margin / 2}
					width={maxLen}
					height={maxLen}
					fill={props.bg}
				/>
				<path d={t.pathString} stroke={props.stroke} fill={'transparent'} stroke-width={'2px'} />
			</svg>
		</li>);
	})}
</nav>
;