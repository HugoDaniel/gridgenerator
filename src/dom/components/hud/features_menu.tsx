import { linkEvent } from 'inferno';
import { FeaturesMenuId, Menu } from '../../../data';
import { justClick } from '../../common';
const noPropagation = justClick;

export interface IFeaturesMenuProps {
	className?: string;
	menu: Menu<FeaturesMenuId>;
	canUseFeatures: boolean;
	onAction: (id: FeaturesMenuId, e: Event) => void;
	gotoLogin: () => void;
}
export const FeaturesMenu = (props: IFeaturesMenuProps) =>
	<nav className={`FeaturesMenu ${props.className || ''}`} $HasKeyedChildren>
		{props.menu.map( (_id, e, isSelected) => {
			const id: string = _id;
			const label = e.label;
			return (
				<a
					onClick={props.canUseFeatures ? linkEvent(id, props.onAction) : (evt: Event) => { evt.preventDefault(); props.gotoLogin(); } }
					href={props.canUseFeatures ? `/${id}` : '/login'}
					key={`featuresmenu-${id}`}
					{...noPropagation}
					className={`f7 dim no-underline black ttu sans-serif dib ph2 pointer top-bar ${isSelected ? 'top-bar-selected' : ''}`}>
					{label}
				</a>);
		})}
	</nav>;
