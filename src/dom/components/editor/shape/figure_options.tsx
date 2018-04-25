// @ts-ignore
import shape_edit_icon from '../../../../assets/icons/shape-edit.svg';
// @ts-ignore
import shape_remove_icon from '../../../../assets/icons/shape-remove.svg';

export interface IFigureOptsProps {
	className?: string;
	style?: object;
	fill: string;
	onFill: () => void;
	onDelete: () => void;
	onEdit: () => void;
}

function renderOpts(props: IFigureOptsProps) {
	const btnCx = 'ba ma0 pa1 ph2 pointer dim flex justify-center items-center b--black-10 br1 mr3-ns';
	const txtCx = 'f8 ttu pa0 ma0 pr2 pt1';
	return (
		[
			<button
				key={'btn-figfill'}
				className={btnCx}
				onClick={props.onFill}
			>
				<p className={txtCx}>Fill</p>
				<svg
					className={'w1 h1'}
					viewBox={'0 0 64 64'}
				>
					<circle cx={32} cy={32} r={26} fill={props.fill} stroke={'#222222'} stroke-width={2} />
				</svg>
			</button>,
			<button
				key={'btn-figedit'}
				className={btnCx}
				onClick={props.onEdit}
			>
				<p className={txtCx}>Edit</p>
				<img src={shape_edit_icon} className={'w1 h1'} alt={'edit icon'} />
			</button>,
			<button
			key={'btn-figremove'}
			className={btnCx}
			onClick={props.onDelete}
			>
				<p className={txtCx}>Delete</p>
				<img src={shape_remove_icon} className={'w1 h1'} alt={'remove icon'} />
			</button>
		]
	);
}
export const FigureOpts = (props: IFigureOptsProps) => {
	return (
		<nav
			className={`FigureOpts ${props.className || ''} flex justify-around items-center w-100 bg-near-white  justify-center-ns mt3-ns`}
			style={props.style || {}}
			$HasKeyedChildren
		>
			{renderOpts(props)}
		</nav>
	);
};
