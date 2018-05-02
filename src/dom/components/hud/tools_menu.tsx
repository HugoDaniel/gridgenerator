import { linkEvent } from 'inferno';
import { Menu, ToolsMenuId } from '../../../data';
import { justClick } from '../../common';
import { Button } from '../base/buttons';
import { ISubmenuZoomProps, SubmenuZoom } from './submenu_zoom';

const noPropagation = justClick;

export interface IToolsMenuProps {
	className?: string;
	withMoveZoom: boolean;
	// ^ show zoom and move icons ?
	isVisible: boolean;
	menu: Menu<ToolsMenuId>;
	onAction: (id: ToolsMenuId, e: Event) => void;
	onZoomIn: (e: Event) => void;
	onZoomOut: (e: Event) => void;
}

export const ToolsMenu = (props: IToolsMenuProps) =>
	<nav className={`ToolsMenu ${props.className || ''} ${props.isVisible ? 'flex' : 'dn'} items-end justify-center`}
	$HasKeyedChildren>
		{ props.menu.map((id, e, isSelected) => {
			if (id === ToolsMenuId.Zoom && isSelected) {
				return (
					<SubmenuZoom
						key={`zoom-submenu`}
						onZoomIn={props.onZoomIn}
						onZoomOut={props.onZoomOut}
					/>
				);
			} else {
				return (
				<a
					key={`toolsmenu-${id}`}
					href={`#${id}`}
					onClick={linkEvent(id, props.onAction)}
					{...noPropagation}
					className={`f7 no-underline black hover-color ttu sans-serif dib ph2 pv2 ${isSelected ? 'bottom-circle' : ''}`}>
					<img src={e.iconUrl} alt={`${e.label} tool`} className={'w1'} />
				</a>);
			}
		},
		  (id, e, isSelected) => {
				if (props.withMoveZoom) {
					return true;
				} else {
					return (id !== ToolsMenuId.Zoom && id !== ToolsMenuId.Move);
				}
			}
		)}
	</nav>;
