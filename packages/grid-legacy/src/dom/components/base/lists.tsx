export interface IListProps {
	selectedCx?: string;
	nonSelectedCx?: string;
	selected?: number;
	className?: string;
	children?: any;
	style?: object;
	inReverse?: boolean;
}
export function List(props: IListProps) {
	const cxSelected = `selected ${props.selectedCx || ''}`;
	const cxNonSelected = props.nonSelectedCx || '';
	const tachyons = 'list ma0 pa0';
	const tachyonsli = 'ma0';
	const isSelected = (i) => props.selected === i ? cxSelected : cxNonSelected;
	const cx = `List ${props.className || ''} ${tachyons} `;
	const cxli = `List-item ${tachyonsli}`;
	let children = props.children;
	let elements = <p>{'empty'}</p>;
	if (children) {
		if (props.inReverse) {
			children = props.children.slice(0).reverse();
		}
		elements = children.map((child, i) =>
			<li className={`${cxli} ${isSelected(i)}` }>{child}</li>
		);
	}
	return (
		<ul	className={cx}
				style={props.style || {}}
		>{elements}</ul>
	);
}

export function VList(props: IListProps) {
	const tachyons = 'w3 flex flex-column items-center justify-start';
	const vlistProps = Object.assign({}, props, { className: `${props.className || ''} ${tachyons}`});
	return (
		<List {...vlistProps} />
	);
}

export function HList(props: IListProps) {
	const tachyons = 'h3 flex flex-row items-center justify-start';
	const hlistProps = Object.assign({}, props,
		{ className: `${props.className || tachyons}`
		});
	return (
		<List {...hlistProps} />
	);
}
