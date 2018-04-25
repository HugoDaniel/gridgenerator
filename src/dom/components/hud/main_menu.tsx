import { linkEvent } from 'inferno';
import { MainMenuId, Menu } from '../../../data';
import { justClick } from '../../common';
const noPropagation = justClick;

export interface IMainMenuProps {
	className?: string;
	menu: Menu<MainMenuId>;
	userId: string | null;
	onAction: (id: MainMenuId, e: Event) => void;
}
// onClick={(e) => { e.stopImmediatePropagation(); console.log('BOOM', e); }}
export const MainMenu = (props: IMainMenuProps) =>
<nav className={`MainMenu ${props.className || ''} flex items-center justify-center`} $HasKeyedChildren>
		{props.menu.map( (_id, e, isSelected) => {
			let id: string = _id;
			let label = e.label;
			if (id === MainMenuId.Profile && props.userId === null) {
				label = 'Login';
				id = 'login';
			}
			return (
				<a
					onClick={linkEvent(id, props.onAction)}
					href={`/${id}`}
					key={`mainmenu-${id}`}
					{...noPropagation}
					className={`f7 no-underline black ttu sans-serif dib ph2 pb4 pt1 pointer top-bar ${isSelected ? 'top-bar-selected' : ''}`}>
					{label}
				</a>);
		})}
	</nav>;
